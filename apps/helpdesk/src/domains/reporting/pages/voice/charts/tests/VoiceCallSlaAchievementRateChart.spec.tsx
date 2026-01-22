import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { VoiceCallSlaAchievementRateChart } from 'domains/reporting/pages/voice/charts/VoiceCallSlaAchievementRateChart'
import VoiceCallVolumeMetric from 'domains/reporting/pages/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import {
    SLA_ACHIEVEMENT_RATE_METRIC_HINT,
    SLA_ACHIEVEMENT_RATE_METRIC_TITLE,
} from 'domains/reporting/pages/voice/constants/liveVoice'
import { useVoiceCallSlaAchievementRateTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallSlaAchievementRateTrend'

jest.mock(
    'domains/reporting/pages/voice/hooks/useVoiceCallSlaAchievementRateTrend',
)
const useVoiceCallSlaAchievementRateTrendMock = assumeMock(
    useVoiceCallSlaAchievementRateTrend,
)

jest.mock(
    'domains/reporting/pages/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric',
)
const VoiceCallVolumeMetricMock = assumeMock(VoiceCallVolumeMetric)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

describe('VoiceCallSlaAchievementRateChart', () => {
    const dashboard: DashboardSchema = {
        id: 1,
        name: 'Test Report',
        emoji: '📊',
        children: [],
        analytics_filter_id: 123,
    }

    beforeEach(() => {
        VoiceCallVolumeMetricMock.mockImplementation(({ title, hint }) => (
            <div>
                <h1>{title}</h1>
                <h2>{hint}</h2>
            </div>
        ))
    })

    it('should render and pass correct props', () => {
        const metricTrend = {
            data: { prevValue: 0.75, value: 0.85 },
            isFetching: false,
            isError: false,
        }
        useVoiceCallSlaAchievementRateTrendMock.mockReturnValue(metricTrend)

        const filters: StatsFilters = {
            period: {
                start_datetime: '2023-12-11T00:00:00.000Z',
                end_datetime: '2023-12-11T23:59:59.999Z',
            },
        }
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: filters,
            granularity: ReportingGranularity.Day,
            userTimezone: 'UTC',
        })

        const { getByText } = render(
            <VoiceCallSlaAchievementRateChart
                chartId="test-chart-id"
                dashboard={dashboard}
            />,
        )

        expect(getByText(SLA_ACHIEVEMENT_RATE_METRIC_TITLE)).toBeInTheDocument()
        expect(getByText(SLA_ACHIEVEMENT_RATE_METRIC_HINT)).toBeInTheDocument()

        expect(VoiceCallVolumeMetricMock).toHaveBeenLastCalledWith(
            {
                title: SLA_ACHIEVEMENT_RATE_METRIC_TITLE,
                hint: SLA_ACHIEVEMENT_RATE_METRIC_HINT,
                statsFilters: filters,
                metricTrend: metricTrend,
                chartId: 'test-chart-id',
                dashboard,
                metricValueFormat: 'percent',
            },
            {},
        )
    })

    it('should call useVoiceCallSlaAchievementRateTrend with correct parameters', () => {
        const metricTrend = {
            data: { prevValue: 0.8, value: 0.9 },
            isFetching: false,
            isError: false,
        }
        useVoiceCallSlaAchievementRateTrendMock.mockReturnValue(metricTrend)

        const filters: StatsFilters = {
            period: {
                start_datetime: '2023-12-11T00:00:00.000Z',
                end_datetime: '2023-12-11T23:59:59.999Z',
            },
        }
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: filters,
            granularity: ReportingGranularity.Day,
            userTimezone: 'America/New_York',
        })

        render(
            <VoiceCallSlaAchievementRateChart
                chartId="test-chart-id"
                dashboard={dashboard}
            />,
        )

        expect(useVoiceCallSlaAchievementRateTrendMock).toHaveBeenCalledWith(
            filters,
            'America/New_York',
        )
    })
})
