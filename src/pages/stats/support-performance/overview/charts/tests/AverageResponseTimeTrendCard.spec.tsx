import React from 'react'

import { render } from '@testing-library/react'

import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { AverageResponseTimeTrendCard } from 'pages/stats/support-performance/overview/charts/AverageResponseTimeTrendCard'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { OverviewChart } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/common/components/TrendCard')
const TrendCardMock = assumeMock(TrendCard)

describe('AverageResponseTimeTrendCard', () => {
    beforeEach(() => {
        TrendCardMock.mockImplementation(() => <div />)
    })
    it('should render Trend Card with metric config', () => {
        const chartId = OverviewChart.AverageResponseTimeTrendCard

        render(<AverageResponseTimeTrendCard chartId={chartId} />)

        expect(TrendCardMock).toHaveBeenCalledWith(
            {
                ...OverviewMetricConfig[OverviewMetric.AverageResponseTime],
                drillDownMetric: OverviewMetric.AverageResponseTime,
                chartId,
            },
            {},
        )
    })
})
