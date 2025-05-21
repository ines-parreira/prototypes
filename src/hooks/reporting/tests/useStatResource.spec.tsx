import React, { ReactNode } from 'react'

import { act, waitFor } from '@testing-library/react'
import { produce } from 'immer'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import { FIRST_RESPONSE_TIME } from 'config/stats'
import { firstResponseTime } from 'fixtures/stats'
import useStatResource, {
    DEFAULT_ERROR_MESSAGE,
} from 'hooks/reporting/useStatResource'
import { fetchStat } from 'models/stat/resources'
import { LegacyStatsFilters, TwoDimensionalChart } from 'models/stat/types'
import { statFetched } from 'state/entities/stats/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { RootState } from 'state/types'
import {
    fetchStatEnded,
    fetchStatStarted,
} from 'state/ui/stats/fetchingMapSlice'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('state/notifications/actions')
const notifyMock = notify as jest.Mock

jest.mock('models/stat/resources')
const fetchStatMock = assumeMock(fetchStat)

const mockStore = configureMockStore<RootState>([thunk])

describe('useStatResource', () => {
    const defaultResourceName = FIRST_RESPONSE_TIME
    const defaultStatName = 'some-stat'
    const defaultStatsFilters: LegacyStatsFilters = {
        period: {
            start_datetime: '2021-04-02T00:00:00.000Z',
            end_datetime: '2021-04-02T23:59:59.999Z',
        },
        channels: [TicketChannel.Email],
    }
    const defaultState = {
        ui: {
            stats: {
                fetchingMap: {},
            },
        },
        entities: {
            stats: {},
        },
    } as RootState
    const notificationMock = {
        type: 'mocked-notification',
        message: 'error message',
    }

    const createStoreWrapper = (store: ReturnType<typeof mockStore>) => {
        return ({ children }: { children?: ReactNode }) => (
            <Provider store={store}>{children}</Provider>
        )
    }

    beforeEach(() => {
        jest.useFakeTimers()
        fetchStatMock.mockResolvedValue(firstResponseTime)
        notifyMock.mockReturnValue(notificationMock)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should fetch the page with cursor when fetchPage is called', async () => {
        const cursor = 'foo-cursor'
        const store = mockStore(defaultState)

        const { result } = renderHook(
            () =>
                useStatResource<TwoDimensionalChart>({
                    statName: defaultStatName,
                    resourceName: defaultResourceName,
                    statsFilters: defaultStatsFilters,
                }),
            {
                wrapper: createStoreWrapper(store),
            },
        )

        // Wait for the initial fetch to complete
        await waitFor(() => expect(fetchStatMock).toHaveBeenCalled())

        // Clear the mock so we can isolate the cursor-based call
        fetchStatMock.mockClear()

        // Trigger a cursor-based fetch
        act(() => {
            result.current[2](cursor)
        })

        // Wait for the new fetch to be triggered with correct cursor
        await waitFor(() =>
            expect(fetchStatMock).toHaveBeenCalledWith(
                defaultResourceName,
                {
                    filters: defaultStatsFilters,
                    cursor,
                },
                { cancelToken: expect.anything() },
            ),
        )
    })

    it('should fetch and save the stat', async () => {
        const store = mockStore(defaultState)

        renderHook(
            () => {
                return useStatResource<TwoDimensionalChart>({
                    statName: defaultStatName,
                    resourceName: defaultResourceName,
                    statsFilters: defaultStatsFilters,
                })
            },
            {
                wrapper: createStoreWrapper(store),
            },
        )
        await waitFor(() => {
            expect(fetchStatMock).toHaveBeenLastCalledWith(
                defaultResourceName,
                {
                    filters: defaultStatsFilters,
                    cursor: undefined,
                },
                { cancelToken: expect.anything() },
            )
        })

        const actions = store.getActions()
        expect(actions[0]).toEqual(
            fetchStatStarted({
                statName: defaultStatName,
                resourceName: defaultResourceName,
            }),
        )
        expect(actions[1]).toEqual(
            statFetched({
                statName: defaultStatName,
                resourceName: defaultResourceName,
                value: firstResponseTime,
            }),
        )
        expect(actions[2]).toEqual(
            fetchStatEnded({
                statName: defaultStatName,
                resourceName: defaultResourceName,
            }),
        )
    })

    it('should display error message on server response error', async () => {
        const store = mockStore(defaultState)
        const errorMessage = 'Some error'
        fetchStatMock.mockRejectedValue({
            data: {
                error: {
                    msg: errorMessage,
                },
            },
        })

        renderHook(
            () => {
                return useStatResource<TwoDimensionalChart>({
                    statName: defaultStatName,
                    resourceName: defaultResourceName,
                    statsFilters: defaultStatsFilters,
                })
            },
            {
                wrapper: createStoreWrapper(store),
            },
        )

        await waitFor(() =>
            expect(notifyMock).toHaveBeenLastCalledWith({
                status: NotificationStatus.Error,
                title: DEFAULT_ERROR_MESSAGE,
            }),
        )
        expect(store.getActions()[1]).toEqual(notificationMock)
    })

    it('should return null stat when stat is not found in the store', () => {
        const { result } = renderHook(
            () => {
                return useStatResource<TwoDimensionalChart>({
                    statName: defaultStatName,
                    resourceName: defaultResourceName,
                    statsFilters: defaultStatsFilters,
                })
            },
            {
                wrapper: createStoreWrapper(
                    mockStore(
                        produce(defaultState, (state) => {
                            state.entities.stats[
                                `stat/${defaultResourceName}`
                            ] = undefined
                        }),
                    ),
                ),
            },
        )
        expect(result.current[0]).toBe(null)
    })

    it.each([
        {
            storeValue: true,
            fetchingFlag: true,
        },
        {
            storeValue: false,
            fetchingFlag: false,
        },
        {
            storeValue: undefined,
            fetchingFlag: true,
        },
    ])(
        'should return $fetchingFlag fetching flag when the fetching flag is set to $storeValue in the store',
        ({ storeValue, fetchingFlag }) => {
            const { result } = renderHook(
                () => {
                    return useStatResource<TwoDimensionalChart>({
                        statName: defaultStatName,
                        resourceName: defaultResourceName,
                        statsFilters: defaultStatsFilters,
                    })
                },
                {
                    wrapper: createStoreWrapper(
                        mockStore(
                            produce(defaultState, (state) => {
                                state.ui.stats.fetchingMap[
                                    `${defaultStatName}/${defaultResourceName}`
                                ] = storeValue
                            }),
                        ),
                    ),
                },
            )

            expect(result.current[1]).toBe(fetchingFlag)
        },
    )

    it('should fetch the page with cursor when fetchPage is called', async () => {
        const cursor = 'foo-cursor'
        const store = mockStore(defaultState)

        const { result } = renderHook(
            () =>
                useStatResource<TwoDimensionalChart>({
                    statName: defaultStatName,
                    resourceName: defaultResourceName,
                    statsFilters: defaultStatsFilters,
                }),
            {
                wrapper: createStoreWrapper(store),
            },
        )

        // Wait for initial fetch
        await waitFor(() => expect(fetchStatMock).toHaveBeenCalledTimes(1))

        // Reset for the cursor-based fetch
        fetchStatMock.mockClear()

        // Trigger cursor update
        act(() => {
            result.current[2](cursor)
        })

        // Wait for internal effect (useEffect → handleFetchStat)
        await waitFor(() =>
            expect(fetchStatMock).toHaveBeenCalledWith(
                defaultResourceName,
                {
                    filters: defaultStatsFilters,
                    cursor,
                },
                { cancelToken: expect.anything() },
            ),
        )
    })

    it('should fetch the stats with empty cursor when filters change', async () => {
        const cursor = 'foo-cursor'
        const store = mockStore(defaultState)

        const updatedStatsFilters = {
            ...defaultStatsFilters,
            channels: [TicketChannel.Facebook],
        }

        const { result, rerender } = renderHook(
            ({ statsFilters }) =>
                useStatResource<TwoDimensionalChart>({
                    statName: defaultStatName,
                    resourceName: defaultResourceName,
                    statsFilters,
                }),
            {
                initialProps: {
                    statsFilters: defaultStatsFilters,
                },
                wrapper: createStoreWrapper(store),
            },
        )

        // Wait for the initial fetch
        await waitFor(() => expect(fetchStatMock).toHaveBeenCalled())

        // Clear previous calls
        fetchStatMock.mockClear()

        // Fetch page with cursor
        act(() => {
            result.current[2](cursor)
        })

        await waitFor(() =>
            expect(fetchStatMock).toHaveBeenCalledWith(
                defaultResourceName,
                {
                    filters: defaultStatsFilters,
                    cursor,
                },
                { cancelToken: expect.anything() },
            ),
        )

        // Clear again before rerendering with new filters
        fetchStatMock.mockClear()

        // Trigger filters update
        rerender({ statsFilters: updatedStatsFilters })

        // Fast-forward debounce timer
        act(() => {
            jest.runAllTimers()
        })

        // Wait for the fetch with updated filters and cursor reset
        await waitFor(() =>
            expect(fetchStatMock).toHaveBeenCalledWith(
                defaultResourceName,
                {
                    filters: updatedStatsFilters,
                    cursor: undefined,
                },
                { cancelToken: expect.anything() },
            ),
        )
    })

    describe('debouncing fetch requests', () => {
        it('should debounce requests when stat filter change', async () => {
            const store = mockStore(defaultState)
            const tagsStatsFilters = {
                ...defaultStatsFilters,
                tags: [1],
            }
            const channelsStatsFilters = {
                ...defaultStatsFilters,
                channels: [TicketChannel.FacebookMention],
            }

            const { rerender } = renderHook(
                ({ statsFilters }) => {
                    return useStatResource<TwoDimensionalChart>({
                        statName: defaultStatName,
                        resourceName: defaultResourceName,
                        statsFilters,
                    })
                },
                {
                    initialProps: {
                        statsFilters: defaultStatsFilters,
                    },
                    wrapper: createStoreWrapper(store),
                },
            )
            await waitFor(() => expect(fetchStatMock).toHaveBeenCalled())
            fetchStatMock.mockClear()
            rerender({
                statsFilters: tagsStatsFilters,
            })
            act(() => jest.advanceTimersByTime(10))
            rerender({
                statsFilters: channelsStatsFilters,
            })
            act(() => jest.runAllTimers())

            await waitFor(() =>
                expect(fetchStatMock).toHaveBeenLastCalledWith(
                    defaultResourceName,
                    {
                        filters: channelsStatsFilters,
                        cursor: undefined,
                    },
                    { cancelToken: expect.anything() },
                ),
            )
            expect(fetchStatMock).toHaveBeenCalledTimes(1)
        })

        it('should not fetch the stat when statsFilters changed to the same value', async () => {
            const store = mockStore(defaultState)

            const { rerender } = renderHook(
                ({ statsFilters }) => {
                    return useStatResource<TwoDimensionalChart>({
                        statName: defaultStatName,
                        resourceName: defaultResourceName,
                        statsFilters,
                    })
                },
                {
                    initialProps: {
                        statsFilters: defaultStatsFilters,
                    },
                    wrapper: createStoreWrapper(store),
                },
            )
            await waitFor(() => expect(fetchStatMock).toHaveBeenCalled())
            fetchStatMock.mockClear()
            rerender({
                statsFilters: { ...defaultStatsFilters },
            })
            act(() => jest.runAllTimers())

            expect(fetchStatMock).not.toHaveBeenCalled()
        })
    })
})
