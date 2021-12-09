import React, {ReactNode} from 'react'
import {renderHook} from 'react-hooks-testing-library'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'
import {act, render} from '@testing-library/react'
import {produce} from 'immer'

import useStatResource from '../useStatResource'
import {Stat, TwoDimensionalChart} from '../../../models/stat/types'
import {StatsFilters, StatsFilterType} from '../../../state/stats/types'
import {TicketChannel} from '../../../business/types/ticket'
import client from '../../../models/api/resources'
import {RootState} from '../../../state/types'
import {firstResponseTimeStat} from '../../../fixtures/stats'
import {FIRST_RESPONSE_TIME} from '../../../config/stats'
import {flushPromises} from '../../../utils/testing'

jest.mock('../../../state/notifications/actions', () => ({
    notify: (message: string) => ({
        type: 'notify mock',
        message,
    }),
}))

const serverMock = new MockAdapter(client)
const mockStore = configureMockStore<RootState>([thunk])

describe('useStatResource', () => {
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
        [StatsFilterType.Period]: {
            start_datetime: '2021-04-02T00:00:00.000Z',
            end_datetime: '2021-04-02T23:59:59.999Z',
        },
        [StatsFilterType.Channels]: [TicketChannel.Email],
    }

    const createStoreWrapper = (store: ReturnType<typeof mockStore>) => {
        return ({children}: {children?: ReactNode}) => (
            <Provider store={store}>{children}</Provider>
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        serverMock.reset()
        serverMock
            .onAny(`/api/stats/${FIRST_RESPONSE_TIME}/`)
            .reply(200, firstResponseTimeStat)
    })

    it('should not fetch the stat when statFilters are null', async () => {
        const store = mockStore(defaultState)

        renderHook(
            () => {
                return useStatResource<TwoDimensionalChart>({
                    statName: 'stat',
                    resourceName: FIRST_RESPONSE_TIME,
                    statsFilters: null,
                })
            },
            {
                wrapper: createStoreWrapper(store),
            }
        )
        await flushPromises()

        expect(serverMock.history.post).toHaveLength(0)
    })

    it('should fetch and save the stat', async () => {
        const store = mockStore(defaultState)

        renderHook(
            () => {
                return useStatResource<TwoDimensionalChart>({
                    statName: 'stat',
                    resourceName: FIRST_RESPONSE_TIME,
                    statsFilters: defaultStatsFilters,
                })
            },
            {
                wrapper: createStoreWrapper(store),
            }
        )
        await flushPromises()

        expect(serverMock.history).toMatchSnapshot()
        expect(store.getActions()).toMatchSnapshot()
    })

    it('should display error message on server response error', async () => {
        const store = mockStore(defaultState)
        const errorMessage = 'Some error'
        serverMock.reset()
        serverMock.onAny(`/api/stats/${FIRST_RESPONSE_TIME}/`).reply(403, {
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
                    resourceName: FIRST_RESPONSE_TIME,
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
        [
            'return stat from the store',
            firstResponseTimeStat,
            firstResponseTimeStat,
        ],
    ])('should %s', (testName, storeValue, expectedValue) => {
        const {result} = renderHook(
            () => {
                return useStatResource<TwoDimensionalChart>({
                    statName: 'stat',
                    resourceName: FIRST_RESPONSE_TIME,
                    statsFilters: defaultStatsFilters,
                })
            },
            {
                wrapper: createStoreWrapper(
                    mockStore(
                        produce(defaultState, (state) => {
                            state.entities.stats[
                                `stat/${FIRST_RESPONSE_TIME}`
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
                    resourceName: FIRST_RESPONSE_TIME,
                    statsFilters: defaultStatsFilters,
                })
            },
            {
                wrapper: createStoreWrapper(
                    mockStore(
                        produce(defaultState, (state) => {
                            state.ui.stats.fetchingMap[
                                `stat/${FIRST_RESPONSE_TIME}`
                            ] = storeValue
                        })
                    )
                ),
            }
        )

        expect(result.current[1]).toBe(expectedResult)
    })

    describe('debouncing fetch requests', () => {
        // Using testing-library/react to test debounce because
        // react-hooks-testing-library doesn't play well with fake timers
        const TestComponent = ({
            statsFilters,
        }: {
            statsFilters: StatsFilters | null
        }) => {
            useStatResource({
                statName: 'stat',
                resourceName: FIRST_RESPONSE_TIME,
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

            const {rerender} = render(
                <Provider store={store}>
                    <TestComponent statsFilters={defaultStatsFilters} />
                </Provider>
            )
            await flushPromises()
            store.clearActions()
            serverMock.resetHistory()

            rerender(
                <Provider store={store}>
                    <TestComponent
                        statsFilters={{
                            ...defaultStatsFilters,
                            [StatsFilterType.Tags]: [1],
                        }}
                    />
                </Provider>
            )
            act(() => {
                jest.advanceTimersByTime(10)
            })
            rerender(
                <Provider store={store}>
                    <TestComponent
                        statsFilters={{
                            ...defaultStatsFilters,
                            [StatsFilterType.Tags]: [2],
                        }}
                    />
                </Provider>
            )
            act(() => {
                jest.runAllTimers()
            })
            await flushPromises()

            expect(serverMock.history).toMatchSnapshot()
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
            serverMock.resetHistory()

            rerender(
                <Provider store={store}>
                    <TestComponent statsFilters={{...defaultStatsFilters}} />
                </Provider>
            )
            act(() => {
                jest.runAllTimers()
            })
            await flushPromises()

            expect(serverMock.history.post).toHaveLength(0)
        })

        it('should not debounce the request when statsFilters were initially set', async () => {
            const store = mockStore(defaultState)

            const {rerender} = render(
                <Provider store={store}>
                    <TestComponent statsFilters={null} />
                </Provider>
            )
            rerender(
                <Provider store={store}>
                    <TestComponent statsFilters={defaultStatsFilters} />
                </Provider>
            )
            await flushPromises()

            expect(serverMock.history).toMatchSnapshot()
        })
    })
})
