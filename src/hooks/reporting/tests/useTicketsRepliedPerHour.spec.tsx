import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { User } from 'config/types/user'
import {
    fetchOnlineTimeMetric,
    fetchTicketsRepliedMetric,
    useOnlineTimeMetric,
    useTicketsRepliedMetric,
} from 'hooks/reporting/metrics'
import {
    fetchOnlineTimePerAgent,
    fetchTicketsRepliedMetricPerAgent,
    useOnlineTimePerAgent,
    useTicketsRepliedMetricPerAgent,
} from 'hooks/reporting/metricsPerAgent'
import { periodAndAgentOnlyFilters } from 'hooks/reporting/useMessagesSentPerHour'
import {
    fetchTicketsRepliedPerHour,
    fetchTicketsRepliedPerHourPerAgentTotalCapacity,
    useTicketsRepliedPerHour,
    useTicketsRepliedPerHourPerAgentTotalCapacity,
} from 'hooks/reporting/useTicketsRepliedPerHour'
import {
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import { HelpdeskMessageMeasure } from 'models/reporting/cubes/HelpdeskMessageCube'
import { TicketMember } from 'models/reporting/cubes/TicketCube'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import { RootState, StoreDispatch } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/metrics')
const useTicketsRepliedMetricMock = assumeMock(useTicketsRepliedMetric)
const useOnlineTimeMock = assumeMock(useOnlineTimeMetric)
const fetchTicketsRepliedMetricMock = assumeMock(fetchTicketsRepliedMetric)
const fetchOnlineTimeMetricMock = assumeMock(fetchOnlineTimeMetric)
jest.mock('hooks/reporting/metricsPerAgent')
const useTicketsRepliedMetricPerAgentMock = assumeMock(
    useTicketsRepliedMetricPerAgent,
)
const useOnlineTimePerAgentMock = assumeMock(useOnlineTimePerAgent)
const fetchTicketsRepliedMetricPerAgentMock = assumeMock(
    fetchTicketsRepliedMetricPerAgent,
)
const fetchOnlineTimePerAgentMock = assumeMock(fetchOnlineTimePerAgent)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('TicketsRepliedPerHour', () => {
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00+02:00',
            end_datetime: '2021-06-04T23:59:59+02:00',
        },
        integrations: withDefaultLogicalOperator([456]),
        agents: withDefaultLogicalOperator([1, 2]),
        tags: [
            {
                ...withDefaultLogicalOperator([123]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }
    const defaultState = {
        stats: { filters: statsFilters },
        ui: {
            stats: {
                filters: uiStatsInitialState,
            },
        },
    } as RootState

    const timeZone = 'UTC'
    const ticketsClosed = 50
    const onlineTimeValue = 60 * 60 * 4
    const ticketsRepliedMetricReturnValue = {
        data: {
            value: ticketsClosed,
        },
        isFetching: false,
        isError: false,
    }
    const onlineTimeReturnValue = {
        data: {
            value: onlineTimeValue,
        },
        isFetching: false,
        isError: false,
    }
    const ticketsRepliedValue = 100
    const agent = {
        id: 123,
        name: 'User',
    } as User
    const useRepliedTicketsMetricPerAgentReturnValue = {
        data: {
            value: ticketsRepliedValue,
            decile: 5,
            allData: [
                {
                    [HelpdeskMessageMeasure.TicketCount]:
                        String(ticketsRepliedValue),
                    [TicketMember.MessageSenderId]: String(agent.id),
                },
            ],
        },
        isFetching: false,
        isError: false,
    }
    const useOnlineTimePerAgentReturnValue = {
        data: {
            value: onlineTimeValue,
            decile: 5,
            allData: [
                {
                    [AgentTimeTrackingMeasure.OnlineTime]:
                        String(onlineTimeValue),
                    [AgentTimeTrackingDimension.UserId]: String(agent.id),
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    describe('useTicketsRepliedPerHour.ts', () => {
        beforeEach(() => {
            useTicketsRepliedMetricMock.mockReturnValue(
                ticketsRepliedMetricReturnValue,
            )
            useOnlineTimeMock.mockReturnValue(onlineTimeReturnValue)
        })

        it('should calculate the metric from messages sent and online time', () => {
            const { result } = renderHook(
                () => useTicketsRepliedPerHour(statsFilters, timeZone),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                data: {
                    value: 12.5,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should strip the statsFilters to period and agents only', () => {
            renderHook(() => useTicketsRepliedPerHour(statsFilters, timeZone), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            })

            expect(useTicketsRepliedMetricMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                    agents: statsFilters.agents,
                },
                timeZone,
            )
            expect(useOnlineTimeMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                    agents: statsFilters.agents,
                },
                timeZone,
            )
        })

        it('should strip the statsFilters to period and no agents', () => {
            const statsFiltersWithoutAgents = {
                period: statsFilters.period,
            }
            const state = {
                stats: { filters: statsFiltersWithoutAgents },
                ui: {
                    stats: {
                        filters: uiStatsInitialState,
                    },
                },
            } as RootState

            renderHook(
                () =>
                    useTicketsRepliedPerHour(
                        statsFiltersWithoutAgents,
                        timeZone,
                    ),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(state)}>{children}</Provider>
                    ),
                },
            )

            expect(useTicketsRepliedMetricMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                },
                timeZone,
            )
            expect(useOnlineTimeMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                },
                timeZone,
            )
        })

        it('should return empty data when no data', () => {
            useTicketsRepliedMetricMock.mockReturnValue({
                ...ticketsRepliedMetricReturnValue,
                data: undefined,
            })
            useOnlineTimeMock.mockReturnValue({
                ...onlineTimeReturnValue,
                data: undefined,
            })

            const { result } = renderHook(
                () => useTicketsRepliedPerHour(statsFilters, timeZone),
                {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore(defaultState)}>
                            {children}
                        </Provider>
                    ),
                },
            )

            expect(result.current).toEqual({
                data: {
                    value: null,
                },
                isError: false,
                isFetching: false,
            })
        })
    })

    describe('fetchTicketsRepliedPerHour.ts', () => {
        beforeEach(() => {
            fetchTicketsRepliedMetricMock.mockResolvedValue(
                ticketsRepliedMetricReturnValue,
            )
            fetchOnlineTimeMetricMock.mockResolvedValue(onlineTimeReturnValue)
        })

        it('should calculate the metric from messages sent and online time', async () => {
            const result = await fetchTicketsRepliedPerHour(
                statsFilters,
                timeZone,
            )

            expect(result).toEqual({
                data: {
                    value: 12.5,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should strip the statsFilters to period and agents only', async () => {
            await fetchTicketsRepliedPerHour(statsFilters, timeZone)

            expect(fetchTicketsRepliedMetricMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                    agents: statsFilters.agents,
                },
                timeZone,
            )
            expect(fetchOnlineTimeMetricMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                    agents: statsFilters.agents,
                },
                timeZone,
            )
        })

        it('should strip the statsFilters to period and no agents', async () => {
            const statsFiltersWithoutAgents = {
                period: statsFilters.period,
            }

            await fetchTicketsRepliedPerHour(
                statsFiltersWithoutAgents,
                timeZone,
            )

            expect(fetchTicketsRepliedMetricMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                },
                timeZone,
            )
            expect(fetchOnlineTimeMetricMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                },
                timeZone,
            )
        })

        it('should return empty data when no data', async () => {
            fetchTicketsRepliedMetricMock.mockResolvedValue({
                ...ticketsRepliedMetricReturnValue,
                data: undefined,
            })
            fetchOnlineTimeMetricMock.mockResolvedValue({
                ...onlineTimeReturnValue,
                data: undefined,
            })

            const result = await fetchTicketsRepliedPerHour(
                statsFilters,
                timeZone,
            )

            expect(result).toEqual({
                data: {
                    value: null,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should return empty data on error', async () => {
            fetchTicketsRepliedMetricMock.mockRejectedValue({
                ...ticketsRepliedMetricReturnValue,
                data: undefined,
            })
            fetchOnlineTimeMetricMock.mockResolvedValue({
                ...onlineTimeReturnValue,
                data: undefined,
            })

            const result = await fetchTicketsRepliedPerHour(
                statsFilters,
                timeZone,
            )

            expect(result).toEqual({
                data: {
                    value: null,
                },
                isError: true,
                isFetching: false,
            })
        })
    })

    describe('useTicketsRepliedPerHourPerAgentTotalCapacity', () => {
        beforeEach(() => {
            useTicketsRepliedMetricPerAgentMock.mockReturnValue(
                useRepliedTicketsMetricPerAgentReturnValue,
            )
            useOnlineTimePerAgentMock.mockReturnValue(
                useOnlineTimePerAgentReturnValue,
            )
        })

        it('should calculate the metric from messages sent and online time', () => {
            const { result } = renderHook(() =>
                useTicketsRepliedPerHourPerAgentTotalCapacity(
                    statsFilters,
                    timeZone,
                ),
            )

            expect(useTicketsRepliedMetricPerAgentMock).toHaveBeenCalledWith(
                periodAndAgentOnlyFilters(statsFilters),
                timeZone,
            )
            expect(useOnlineTimePerAgentMock).toHaveBeenCalledWith(
                periodAndAgentOnlyFilters(statsFilters),
                timeZone,
            )
            expect(result.current).toEqual({
                data: {
                    value: ticketsRepliedValue / (onlineTimeValue / 60 / 60),
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should return null in case data is empty', () => {
            useTicketsRepliedMetricPerAgentMock.mockReturnValue({
                ...useRepliedTicketsMetricPerAgentReturnValue,
                data: undefined,
            } as any)
            useOnlineTimePerAgentMock.mockReturnValue({
                ...useOnlineTimePerAgentReturnValue,
                data: undefined,
            } as any)

            const { result } = renderHook(() =>
                useTicketsRepliedPerHourPerAgentTotalCapacity(
                    statsFilters,
                    timeZone,
                ),
            )

            expect(result.current).toEqual({
                data: { value: null },
                isError: false,
                isFetching: false,
            })
        })
    })

    describe('fetchTicketsRepliedPerHourPerAgentTotalCapacity', () => {
        beforeEach(() => {
            fetchTicketsRepliedMetricPerAgentMock.mockResolvedValue(
                useRepliedTicketsMetricPerAgentReturnValue,
            )
            fetchOnlineTimePerAgentMock.mockResolvedValue(
                useOnlineTimePerAgentReturnValue,
            )
        })
        it('should calculate the metric from messages sent and online time', async () => {
            const result =
                await fetchTicketsRepliedPerHourPerAgentTotalCapacity(
                    statsFilters,
                    timeZone,
                )

            expect(fetchTicketsRepliedMetricPerAgentMock).toHaveBeenCalledWith(
                periodAndAgentOnlyFilters(statsFilters),
                timeZone,
            )
            expect(fetchOnlineTimePerAgentMock).toHaveBeenCalledWith(
                periodAndAgentOnlyFilters(statsFilters),
                timeZone,
            )
            expect(result).toEqual({
                data: {
                    value: ticketsRepliedValue / (onlineTimeValue / 60 / 60),
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should return empty data when no data', async () => {
            fetchTicketsRepliedMetricPerAgentMock.mockResolvedValue({
                ...useRepliedTicketsMetricPerAgentReturnValue,
                data: undefined,
            } as any)
            fetchOnlineTimePerAgentMock.mockResolvedValue({
                ...fetchOnlineTimePerAgentMock,
                data: undefined,
            } as any)

            const result =
                await fetchTicketsRepliedPerHourPerAgentTotalCapacity(
                    statsFilters,
                    timeZone,
                )

            expect(result).toEqual({
                data: {
                    value: null,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should return empty data on error', async () => {
            fetchTicketsRepliedMetricPerAgentMock.mockRejectedValue({
                ...useRepliedTicketsMetricPerAgentReturnValue,
                data: undefined,
            } as any)
            fetchOnlineTimePerAgentMock.mockResolvedValue({
                ...fetchOnlineTimePerAgentMock,
                data: undefined,
            } as any)

            const result =
                await fetchTicketsRepliedPerHourPerAgentTotalCapacity(
                    statsFilters,
                    timeZone,
                )

            expect(result).toEqual({
                data: {
                    value: null,
                },
                isError: true,
                isFetching: false,
            })
        })
    })
})
