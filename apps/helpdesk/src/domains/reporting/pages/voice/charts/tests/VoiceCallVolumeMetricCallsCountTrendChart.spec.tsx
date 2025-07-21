import React from 'react'

import { render } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { StatsFilters } from 'domains/reporting/models/stat/types'

import '@testing-library/jest-dom/extend-expect'

import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { VoiceCallVolumeMetricCallsCountTrendChart } from 'domains/reporting/pages/voice/charts/VoiceCallVolumeMetricCallsCountTrendChart'
import VoiceCallVolumeMetric from 'domains/reporting/pages/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import VoiceCallVolumeMetricEmpty from 'domains/reporting/pages/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetricEmpty'
import { useVoiceCallCountTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallCountTrend'
import { fromLegacyStatsFilters } from 'domains/reporting/state/stats/utils'
import { agents } from 'fixtures/agents'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/pages/voice/hooks/useVoiceCallCountTrend')
const useVoiceCallCountTrendMock = assumeMock(useVoiceCallCountTrend)
jest.mock(
    'domains/reporting/pages/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric',
)
const VoiceCallVolumeMetricMock = assumeMock(VoiceCallVolumeMetric)
jest.mock(
    'domains/reporting/pages/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetricEmpty',
)
const VoiceCallVolumeMetricEmptyMock = assumeMock(VoiceCallVolumeMetricEmpty)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

describe('VoiceCallVolumeMetricCallsCountTrendChart', () => {
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

        VoiceCallVolumeMetricEmptyMock.mockImplementation(({ title, hint }) => (
            <div>
                <h1>{title}</h1>
                <h2>{hint}</h2>
            </div>
        ))
    })

    it.each([
        {
            additionalFilters: {
                agents: withDefaultLogicalOperator([agents[0].id]),
            },
            hideWithAgentsFilter: false,
            multiFormat: false,
        },
        {
            additionalFilters: {},
            hideWithAgentsFilter: false,
            multiFormat: true,
        },
        {
            additionalFilters: {},
            hideWithAgentsFilter: true,
        },
    ])(
        'should render and pass correct props',
        ({ additionalFilters, hideWithAgentsFilter, multiFormat }) => {
            const metricTrend = {
                data: { prevValue: 10, value: 15 },
                isFetching: false,
                isError: false,
            }
            useVoiceCallCountTrendMock.mockReturnValue(metricTrend)

            const filters: StatsFilters = {
                period: {
                    start_datetime: '2023-12-11T00:00:00.000Z',
                    end_datetime: '2023-12-11T23:59:59.999Z',
                },
                ...additionalFilters,
            }
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: filters,
                granularity: ReportingGranularity.Day,
                userTimezone: 'UTC',
            })

            const { getByText } = render(
                <VoiceCallVolumeMetricCallsCountTrendChart
                    chartId="test-chart-id"
                    dashboard={dashboard}
                    title="Metric Title"
                    hint="Metric Hint"
                    segment={VoiceCallSegment.inboundUnansweredCalls}
                    hideWithAgentsFilter={hideWithAgentsFilter}
                    multiFormat={multiFormat}
                />,
            )

            expect(getByText('Metric Title')).toBeInTheDocument()
            expect(getByText('Metric Hint')).toBeInTheDocument()

            expect(VoiceCallVolumeMetricMock).toHaveBeenLastCalledWith(
                {
                    title: 'Metric Title',
                    hint: 'Metric Hint',
                    statsFilters: filters,
                    metricTrend: metricTrend,
                    chartId: 'test-chart-id',
                    dashboard,
                    moreIsBetter: false,
                    multiFormat,
                },
                {},
            )
        },
    )

    it('should render empty page when filtering by agent', () => {
        const filters = fromLegacyStatsFilters({
            period: {
                start_datetime: '2023-12-11T00:00:00.000Z',
                end_datetime: '2023-12-11T23:59:59.999Z',
            },
            agents: [agents[0].id],
        })
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: filters,
            granularity: ReportingGranularity.Day,
            userTimezone: 'UTC',
        })

        const { getByText } = render(
            <VoiceCallVolumeMetricCallsCountTrendChart
                chartId="test-chart-id"
                dashboard={dashboard}
                title="Metric Title"
                hint="Metric Hint"
                segment={VoiceCallSegment.inboundUnansweredCalls}
                hideWithAgentsFilter={true}
            />,
        )

        expect(getByText('Metric Title')).toBeInTheDocument()
        expect(getByText('Metric Hint')).toBeInTheDocument()

        expect(VoiceCallVolumeMetricEmptyMock).toHaveBeenLastCalledWith(
            {
                title: 'Metric Title',
                hint: 'Metric Hint',
                chartId: 'test-chart-id',
                dashboard,
            },
            {},
        )
    })
})
