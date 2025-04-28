import { waitFor } from '@testing-library/react'

import { TicketChannel } from 'business/types/ticket'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import { useDistributionTrendReportData } from 'hooks/reporting/common/useDistributionTrendReportData'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import { formatMetricValue } from 'pages/stats/common/utils'
import { renderHook } from 'utils/testing/renderHook'

describe('useDistributionTrendReportData', () => {
    const defaultStatsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
        channels: withDefaultLogicalOperator([TicketChannel.Chat]),
        integrations: withDefaultLogicalOperator([
            integrationsState.integrations[0].id,
        ]),
        agents: withDefaultLogicalOperator([agents[0].id]),
        tags: [
            {
                ...withDefaultLogicalOperator([1]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }

    const emailResult = {
        label: 'email',
        value: 1,
    }
    const facebookResult = {
        label: 'facebook',
        value: 5,
    }
    const emailPreviousResult = {
        label: 'email',
        value: 2,
    }
    const facebookPreviousResult = {
        label: 'facebook',
        value: 8,
    }
    const workloadData = [emailResult, facebookResult]
    const workloadPreviousData = [emailPreviousResult, facebookPreviousResult]
    const labelPrefix = 'someLabel'

    it('should fetch and format results', async () => {
        const distributionsConfig = {
            fetchCurrentDistribution: jest
                .fn()
                .mockResolvedValue({ data: workloadData }),
            fetchPreviousDistribution: jest
                .fn()
                .mockResolvedValue({ data: workloadPreviousData }),
            labelPrefix,
            metricFormat: 'decimal' as const,
        }

        const { result } = renderHook(() =>
            useDistributionTrendReportData(
                defaultStatsFilters,
                'UTC',
                distributionsConfig,
            ),
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                data: [
                    {
                        label: `${labelPrefix} - ${emailResult.label}`,
                        value: formatMetricValue(emailResult.value),
                        prevValue: formatMetricValue(emailPreviousResult.value),
                    },
                    {
                        label: `${labelPrefix} - ${facebookResult.label}`,
                        value: formatMetricValue(facebookResult.value),
                        prevValue: formatMetricValue(
                            facebookPreviousResult.value,
                        ),
                    },
                ],
            })
        })
    })

    it('should mark unavailable data', async () => {
        const distributionsConfig = {
            fetchCurrentDistribution: jest
                .fn()
                .mockResolvedValue({ data: workloadData }),
            fetchPreviousDistribution: jest
                .fn()
                .mockResolvedValue({ data: [] }),
            labelPrefix,
            metricFormat: 'decimal' as const,
        }

        const { result } = renderHook(() =>
            useDistributionTrendReportData(
                defaultStatsFilters,
                'UTC',
                distributionsConfig,
            ),
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                data: [
                    {
                        label: `${labelPrefix} - ${emailResult.label}`,
                        value: formatMetricValue(emailResult.value),
                        prevValue: formatMetricValue(undefined),
                    },
                    {
                        label: `${labelPrefix} - ${facebookResult.label}`,
                        value: formatMetricValue(facebookResult.value),
                        prevValue: formatMetricValue(undefined),
                    },
                ],
            })
        })
    })

    it('should return empty data on fetch error', async () => {
        const distributionsConfig = {
            fetchCurrentDistribution: jest.fn().mockRejectedValue({}),
            fetchPreviousDistribution: jest.fn().mockRejectedValue({}),
            labelPrefix,
            metricFormat: 'decimal' as const,
        }
        const { result } = renderHook(() =>
            useDistributionTrendReportData(
                defaultStatsFilters,
                'UTC',
                distributionsConfig,
            ),
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                data: [],
            })
        })
    })

    it('should return empty data when no fetch config provided', async () => {
        const { result } = renderHook(() =>
            useDistributionTrendReportData(
                defaultStatsFilters,
                'UTC',
                undefined,
            ),
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                data: [],
            })
        })
    })
})
