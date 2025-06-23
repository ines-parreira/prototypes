import { waitFor } from '@testing-library/react'

import { TicketChannel } from 'business/types/ticket'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import { formatPerDimensionTrendData } from 'hooks/reporting/common/useDistributionTrendReportData'
import {
    fetchWorkloadPerChannelDistribution,
    fetchWorkloadPerChannelDistributionForPreviousPeriod,
} from 'hooks/reporting/distributions'
import { useWorkloadChannelReport } from 'hooks/reporting/support-performance/overview/useWorkloadChannelReport'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import { WORKLOAD_BY_CHANNEL_LABEL } from 'services/reporting/constants'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/distributions')
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
                value: 200,
                label: TicketChannel.Email,
            },
            {
                value: 34,
                label: TicketChannel.Chat,
            },
            {
                value: 16,
                label: TicketChannel.Api,
            },
        ],
    }
    const workloadDistributionPrevious = {
        data: [
            {
                value: 200,
                label: TicketChannel.Email,
            },
            {
                value: 34,
                label: TicketChannel.Chat,
            },
        ],
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
