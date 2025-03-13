import { renderHook } from '@testing-library/react-hooks'

import {
    fetchMessagesSentMetric,
    fetchOnlineTimeMetric,
    useMessagesSentMetric,
    useOnlineTimeMetric,
} from 'hooks/reporting/metrics'
import {
    fetchMessagesSentPerHour,
    useMessagesSentPerHour,
} from 'hooks/reporting/useMessagesSentPerHour'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/metrics')
const useMessagesSentMetricMock = assumeMock(useMessagesSentMetric)
const useOnlineTimeMock = assumeMock(useOnlineTimeMetric)
const fetchMessagesSentMetricMock = assumeMock(fetchMessagesSentMetric)
const fetchOnlineTimeMock = assumeMock(fetchOnlineTimeMetric)

describe('MessagesSentPerHourPerAgent.ts', () => {
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

    const timeZone = 'UTC'
    const messagesSentValue = 50
    const onlineTimeValue = 60 * 60 * 4
    const useMessagesSentMetricReturnValue = {
        data: {
            value: messagesSentValue,
        },
        isFetching: false,
        isError: false,
    }
    const useOnlineTimeReturnValue = {
        data: {
            value: onlineTimeValue,
        },
        isFetching: false,
        isError: false,
    }

    describe('useMessagesSentPerHour', () => {
        beforeEach(() => {
            useMessagesSentMetricMock.mockReturnValue(
                useMessagesSentMetricReturnValue,
            )
            useOnlineTimeMock.mockReturnValue(useOnlineTimeReturnValue)
        })

        it('should calculate the metric from messages sent and online time', () => {
            const { result } = renderHook(() =>
                useMessagesSentPerHour(statsFilters, timeZone),
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
            renderHook(() => useMessagesSentPerHour(statsFilters, timeZone), {})

            expect(useMessagesSentMetricMock).toHaveBeenCalledWith(
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

            renderHook(() =>
                useMessagesSentPerHour(statsFiltersWithoutAgents, timeZone),
            )

            expect(useMessagesSentMetricMock).toHaveBeenCalledWith(
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
            useMessagesSentMetricMock.mockReturnValue({
                ...useMessagesSentMetricReturnValue,
                data: undefined,
            })
            useOnlineTimeMock.mockReturnValue({
                ...useOnlineTimeReturnValue,
                data: undefined,
            })

            const { result } = renderHook(() =>
                useMessagesSentPerHour(statsFilters, timeZone),
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

    describe('fetchMessagesSentPerHour', () => {
        beforeEach(() => {
            fetchMessagesSentMetricMock.mockResolvedValue(
                useMessagesSentMetricReturnValue,
            )
            fetchOnlineTimeMock.mockResolvedValue(useOnlineTimeReturnValue)
        })

        it('should calculate the metric from messages sent and online time', async () => {
            const result = await fetchMessagesSentPerHour(
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
            await fetchMessagesSentPerHour(statsFilters, timeZone)

            expect(fetchMessagesSentMetricMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                    agents: statsFilters.agents,
                },
                timeZone,
            )
            expect(fetchOnlineTimeMock).toHaveBeenCalledWith(
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

            await fetchMessagesSentPerHour(statsFiltersWithoutAgents, timeZone)

            expect(fetchMessagesSentMetricMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                },
                timeZone,
            )
            expect(fetchOnlineTimeMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                },
                timeZone,
            )
        })

        it('should return empty data when no data', async () => {
            fetchMessagesSentMetricMock.mockResolvedValue({
                ...useMessagesSentMetricReturnValue,
                data: undefined,
            })
            fetchOnlineTimeMock.mockResolvedValue({
                ...useOnlineTimeReturnValue,
                data: undefined,
            })

            const result = await fetchMessagesSentPerHour(
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
            fetchMessagesSentMetricMock.mockRejectedValue({
                ...useMessagesSentMetricReturnValue,
                data: undefined,
            })
            fetchOnlineTimeMock.mockResolvedValue({
                ...useOnlineTimeReturnValue,
                data: undefined,
            })

            const result = await fetchMessagesSentPerHour(
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
    })
})
