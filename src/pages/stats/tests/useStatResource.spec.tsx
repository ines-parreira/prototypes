import React, {ReactNode} from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {act, render} from '@testing-library/react'
import {produce} from 'immer'

import {Stat, StatsFilters, TwoDimensionalChart} from 'models/stat/types'
import {TicketChannel} from 'business/types/ticket'
import {RootState} from 'state/types'
import {firstResponseTime} from 'fixtures/stats'
import {FIRST_RESPONSE_TIME} from 'config/stats'
import {assumeMock, flushPromises} from 'utils/testing'
import {fetchStat} from 'models/stat/resources'

import useStatResource from '../useStatResource'

jest.mock('state/notifications/actions', () => ({
    notify: (message: string) => ({
        type: 'notify mock',
        message,
    }),
}))

jest.mock('models/stat/resources')
const fetchStatMock = assumeMock(fetchStat)

const mockStore = configureMockStore<RootState>([thunk])

describe('useStatResource', () => {
    const defaultResourceName = FIRST_RESPONSE_TIME
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

    const defaultStatsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-04-02T00:00:00.000Z',
            end_datetime: '2021-04-02T23:59:59.999Z',
        },
        channels: [TicketChannel.Email],
    }

    const createStoreWrapper = (store: ReturnType<typeof mockStore>) => {
        return ({children}: {children?: ReactNode}) => (
            <Provider store={store}>{children}</Provider>
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        fetchStatMock.mockResolvedValue(firstResponseTime)
    })

    it('should fetch and save the stat', async () => {
        const store = mockStore(defaultState)

        renderHook(
            () => {
                return useStatResource<TwoDimensionalChart>({
                    statName: 'stat',
                    resourceName: defaultResourceName,
                    statsFilters: defaultStatsFilters,
                })
            },
            {
                wrapper: createStoreWrapper(store),
            }
        )
        await flushPromises()

        expect(fetchStatMock).toHaveBeenLastCalledWith(
            defaultResourceName,
            {
                filters: defaultStatsFilters,
                cursor: undefined,
            },
            {cancelToken: expect.anything()}
        )
        expect(store.getActions()).toMatchSnapshot()
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
                    statName: 'stat',
                    resourceName: defaultResourceName,
                    statsFilters: defaultStatsFilters,
                })
            },
            {
                wrapper: createStoreWrapper(store),
            }
        )
        await flushPromises()

        expect(store.getActions()).toMatchSnapshot()
    })

    it.each<[string, Stat | undefined, Stat | null]>([
        [
            'return null stat when stat is not found in the store',
            undefined,
            null,
        ],
        ['return stat from the store', firstResponseTime, firstResponseTime],
    ])('should %s', (testName, storeValue, expectedValue) => {
        const {result} = renderHook(
            () => {
                return useStatResource<TwoDimensionalChart>({
                    statName: 'stat',
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
                            ] = storeValue
                        })
                    )
                ),
            }
        )
        expect(result.current[0]).toBe(expectedValue)
    })

    it.each<[string, boolean | undefined, boolean]>([
        [
            'return true fetching flag result when fetching flag is set to true in the store',
            true,
            true,
        ],
        [
            'return false fetching flag result when fetching flag is set to false in the store',
            false,
            false,
        ],
        [
            'return true fetching flag result when fetching flag not defined in the store',
            undefined,
            true,
        ],
    ])('should %s', (testName, storeValue, expectedResult) => {
        const {result} = renderHook(
            () => {
                return useStatResource<TwoDimensionalChart>({
                    statName: 'stat',
                    resourceName: defaultResourceName,
                    statsFilters: defaultStatsFilters,
                })
            },
            {
                wrapper: createStoreWrapper(
                    mockStore(
                        produce(defaultState, (state) => {
                            state.ui.stats.fetchingMap[
                                `stat/${defaultResourceName}`
                            ] = storeValue
                        })
                    )
                ),
            }
        )

        expect(result.current[1]).toBe(expectedResult)
    })

    it('should fetch the page with cursor when fetchPage is called', async () => {
        const store = mockStore(defaultState)
        const {result, rerender} = renderHook(
            () => {
                return useStatResource<TwoDimensionalChart>({
                    statName: 'stat',
                    resourceName: defaultResourceName,
                    statsFilters: defaultStatsFilters,
                })
            },
            {
                wrapper: createStoreWrapper(store),
            }
        )
        await flushPromises()
        store.clearActions()

        const [, , fetchPage] = result.current
        act(() => {
            fetchPage('foo-cursor')
        })
        rerender()
        await flushPromises()

        expect(fetchStatMock).toHaveBeenLastCalledWith(
            defaultResourceName,
            {
                filters: defaultStatsFilters,
                cursor: 'foo-cursor',
            },
            {cancelToken: expect.anything()}
        )
        expect(store.getActions()).toMatchSnapshot()
    })

    it('should fetch the stats with empty cursor when filters change', async () => {
        const store = mockStore(defaultState)
        const updatedStatsFilters = {
            ...defaultStatsFilters,
            channels: [TicketChannel.Facebook],
        }

        const {result, rerender, waitForNextUpdate} = renderHook(
            ({statsFilters}) => {
                return useStatResource<TwoDimensionalChart>({
                    statName: 'stat',
                    resourceName: defaultResourceName,
                    statsFilters,
                })
            },
            {
                initialProps: {
                    statsFilters: defaultStatsFilters,
                },
                wrapper: createStoreWrapper(store),
            }
        )
        await flushPromises()
        const [, , fetchPage] = result.current
        act(() => {
            fetchPage('foo-cursor')
        })
        rerender()
        await flushPromises()
        rerender({
            statsFilters: updatedStatsFilters,
        })
        await flushPromises()
        await waitForNextUpdate()

        expect(fetchStatMock).toHaveBeenLastCalledWith(
            defaultResourceName,
            {
                filters: updatedStatsFilters,
                cursor: undefined,
            },
            {cancelToken: expect.anything()}
        )
    })

    describe('debouncing fetch requests', () => {
        // Using testing-library/react to test debounce because
        // react-hooks-testing-library doesn't play well with fake timers
        const TestComponent = ({
            statsFilters,
        }: {
            statsFilters: StatsFilters
        }) => {
            useStatResource({
                statName: 'stat',
                resourceName: defaultResourceName,
                statsFilters,
            })
            return null
        }

        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

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

            const {rerender} = render(
                <Provider store={store}>
                    <TestComponent statsFilters={defaultStatsFilters} />
                </Provider>
            )
            await flushPromises()
            store.clearActions()

            rerender(
                <Provider store={store}>
                    <TestComponent statsFilters={tagsStatsFilters} />
                </Provider>
            )
            act(() => {
                jest.advanceTimersByTime(10)
            })
            rerender(
                <Provider store={store}>
                    <TestComponent statsFilters={channelsStatsFilters} />
                </Provider>
            )
            act(() => {
                jest.runAllTimers()
            })
            await flushPromises()

            expect(fetchStatMock).toHaveBeenLastCalledWith(
                defaultResourceName,
                {
                    filters: channelsStatsFilters,
                    cursor: undefined,
                },
                {cancelToken: expect.anything()}
            )
        })

        it('should not fetch the stat when statsFilters changed to the same value', async () => {
            const store = mockStore(defaultState)

            const {rerender} = render(
                <Provider store={store}>
                    <TestComponent statsFilters={defaultStatsFilters} />
                </Provider>
            )
            await flushPromises()
            store.clearActions()

            rerender(
                <Provider store={store}>
                    <TestComponent statsFilters={{...defaultStatsFilters}} />
                </Provider>
            )
            act(() => {
                jest.runAllTimers()
            })
            await flushPromises()

            expect(fetchStatMock.mock.calls).toHaveLength(1)
        })

        it('should not fetch the stat when statsFilters is dirty changed to the same value', async () => {
            const store = mockStore({
                ...defaultState,
                ui: {
                    ...defaultState.ui,
                    stats: {...defaultState.ui.stats, isFilterDirty: true},
                },
            })

            const {rerender} = render(
                <Provider store={store}>
                    <TestComponent statsFilters={defaultStatsFilters} />
                </Provider>
            )
            await flushPromises()
            store.clearActions()

            rerender(
                <Provider store={store}>
                    <TestComponent
                        statsFilters={{
                            ...defaultStatsFilters,
                            tags: [2],
                        }}
                    />
                </Provider>
            )
            act(() => {
                jest.runAllTimers()
            })
            await flushPromises()

            expect(fetchStatMock.mock.calls).toHaveLength(1)
        })
    })
})
