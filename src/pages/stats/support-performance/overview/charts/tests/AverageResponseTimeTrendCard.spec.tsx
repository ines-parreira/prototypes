import React from 'react'

import { render } from '@testing-library/react'

import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { MedianResponseTimeTrendCard } from 'pages/stats/support-performance/overview/charts/MedianResponseTimeTrendCard'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { OverviewChart } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/common/components/TrendCard')
const TrendCardMock = assumeMock(TrendCard)

describe('MedianResponseTimeTrendCard', () => {
    beforeEach(() => {
        TrendCardMock.mockImplementation(() => <div />)
    })

    it('should render Trend Card with metric config', () => {
        const chartId = OverviewChart.MedianResponseTimeTrendCard

        render(<MedianResponseTimeTrendCard chartId={chartId} />)

        expect(TrendCardMock).toHaveBeenCalledWith(
            {
                ...OverviewMetricConfig[OverviewMetric.MedianResponseTime],
                drillDownMetric: OverviewMetric.MedianResponseTime,
                chartId,
            },
            {},
        )
    })
})
