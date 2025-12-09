import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { TicketChannel } from 'business/types/ticket'
import { formatPerDimensionTrendData } from 'domains/reporting/hooks/common/useDistributionTrendReportData'
import {
    fetchWorkloadPerChannelDistribution,
    fetchWorkloadPerChannelDistributionForPreviousPeriod,
} from 'domains/reporting/hooks/distributions'
import { useWorkloadChannelReport } from 'domains/reporting/hooks/support-performance/overview/useWorkloadChannelReport'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { TagFilterInstanceId } from 'domains/reporting/models/stat/types'
import { WORKLOAD_BY_CHANNEL_LABEL } from 'domains/reporting/services/constants'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'

jest.mock('domains/reporting/hooks/distributions')
const fetchWorkloadPerChannelDistributionMock = assumeMock(
    fetchWorkloadPerChannelDistribution,
)
const fetchWorkloadPerChannelDistributionForPreviousPeriodMock = assumeMock(
    fetchWorkloadPerChannelDistributionForPreviousPeriod,
)

// TODO(React18): Remove this once we upgrade to React 18
describe.skip('useWorkloadChannelReport', () => {
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
    const workloadDistribution = {
        data: [
            {
                dimension: 'email',
                value: 200,
                label: TicketChannel.Email,
                decile: 0,
            },
            {
                dimension: 'chat',
                value: 34,
                label: TicketChannel.Chat,
                decile: 0,
            },
            {
                dimension: 'api',
                value: 16,
                label: TicketChannel.Api,
                decile: 0,
            },
        ],
        isFetching: false,
        isError: false,
    }
    const workloadDistributionPrevious = {
        data: [
            {
                value: 200,
                label: TicketChannel.Email,
                dimension: 'email',
                decile: 0,
            },
            {
                value: 34,
                label: TicketChannel.Chat,
                dimension: 'chat',
                decile: 0,
            },
        ],
        isFetching: false,
        isError: false,
    }

    beforeEach(() => {
        fetchWorkloadPerChannelDistributionMock.mockResolvedValue(
            workloadDistribution,
        )
        fetchWorkloadPerChannelDistributionForPreviousPeriodMock.mockResolvedValue(
            workloadDistributionPrevious,
        )
    })

    it('should fetch and format data', async () => {
        const { result } = renderHook(() =>
            useWorkloadChannelReport(defaultStatsFilters, 'UTC'),
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                data: formatPerDimensionTrendData(
                    workloadDistribution.data,
                    workloadDistributionPrevious.data,
                    WORKLOAD_BY_CHANNEL_LABEL,
                    'decimal',
                ),
            })
        })
    })

    it('should return partial data when fetching limited', async () => {
        fetchWorkloadPerChannelDistributionForPreviousPeriodMock.mockRejectedValue(
            {},
        )
        const { result } = renderHook(() =>
            useWorkloadChannelReport(defaultStatsFilters, 'UTC', false),
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                data: formatPerDimensionTrendData(
                    workloadDistribution.data,
                    [],
                    WORKLOAD_BY_CHANNEL_LABEL,
                    'decimal',
                ),
            })
        })
    })

    it('should return empty on failed request', async () => {
        fetchWorkloadPerChannelDistributionForPreviousPeriodMock.mockRejectedValue(
            {},
        )
        const { result } = renderHook(() =>
            useWorkloadChannelReport(defaultStatsFilters, 'UTC'),
        )

        await waitFor(() => {
            expect(result.current).toEqual({
                isFetching: false,
                data: [],
            })
        })
    })
})
