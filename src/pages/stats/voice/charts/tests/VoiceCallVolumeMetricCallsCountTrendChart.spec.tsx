import React from 'react'

import { render } from '@testing-library/react'

import '@testing-library/jest-dom/extend-expect'

import { agents } from 'fixtures/agents'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { ReportingGranularity } from 'models/reporting/types'
import { DashboardSchema } from 'pages/stats/dashboards/types'
import VoiceCallVolumeMetric from 'pages/stats/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric'
import { useNewVoiceStatsFilters } from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import { useVoiceCallCountTrend } from 'pages/stats/voice/hooks/useVoiceCallCountTrend'
import { fromLegacyStatsFilters } from 'state/stats/utils'
import { assumeMock } from 'utils/testing'

import VoiceCallVolumeMetricEmpty from '../../components/VoiceCallVolumeMetric/VoiceCallVolumeMetricEmpty'
import { VoiceCallVolumeMetricCallsCountTrendChart } from '../VoiceCallVolumeMetricCallsCountTrendChart'

jest.mock('pages/stats/voice/hooks/useNewVoiceStatsFilters')
jest.mock('pages/stats/voice/hooks/useVoiceCallCountTrend')
jest.mock(
    'pages/stats/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetric',
)
jest.mock(
    'pages/stats/voice/components/VoiceCallVolumeMetric/VoiceCallVolumeMetricEmpty',
)

const useNewVoiceStatsFiltersMock = assumeMock(useNewVoiceStatsFilters)
const useVoiceCallCountTrendMock = assumeMock(useVoiceCallCountTrend)
const VoiceCallVolumeMetricMock = assumeMock(VoiceCallVolumeMetric)
VoiceCallVolumeMetricMock.mockImplementation(({ title, hint }) => (
    <div>
        <h1>{title}</h1>
        <h2>{hint}</h2>
    </div>
))
const VoiceCallVolumeMetricEmptyMock = assumeMock(VoiceCallVolumeMetricEmpty)
VoiceCallVolumeMetricEmptyMock.mockImplementation(({ title, hint }) => (
    <div>
        <h1>{title}</h1>
        <h2>{hint}</h2>
    </div>
))

const dashboard: DashboardSchema = {
    id: 1,
    name: 'Test Report',
    emoji: '📊',
    children: [],
    analytics_filter_id: 123,
}

describe('VoiceCallVolumeMetricCallsCountTrendChart', () => {
    it.each([
        {
            additionalFilters: { agents: [agents[0].id] },
            hideWithAgentsFilter: false,
        },
        {
            additionalFilters: {},
            hideWithAgentsFilter: false,
        },
        {
            additionalFilters: {},
            hideWithAgentsFilter: true,
        },
    ])(
        'should render and pass correct props',
        ({ additionalFilters, hideWithAgentsFilter }) => {
            const metricTrend = {
                data: { prevValue: 10, value: 15 },
                isFetching: false,
                isError: false,
            }
            useVoiceCallCountTrendMock.mockReturnValue(metricTrend)

            const filters = {
                period: {
                    start_datetime: '2023-12-11T00:00:00.000Z',
                    end_datetime: '2023-12-11T23:59:59.999Z',
                },
                ...additionalFilters,
            }
            useNewVoiceStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: filters,
                granularity: ReportingGranularity.Day,
                userTimezone: 'UTC',
                isAnalyticsNewFilters: true,
            })

            const { getByText } = render(
                <VoiceCallVolumeMetricCallsCountTrendChart
                    chartId="test-chart-id"
                    dashboard={dashboard}
                    title="Metric Title"
                    hint="Metric Hint"
                    segment={VoiceCallSegment.inboundUnansweredCalls}
                    hideWithAgentsFilter={hideWithAgentsFilter}
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
        useNewVoiceStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: filters,
            granularity: ReportingGranularity.Day,
            userTimezone: 'UTC',
            isAnalyticsNewFilters: true,
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
