import React from 'react'

import { render } from '@testing-library/react'

import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { ZeroTouchTicketsTrendCard } from 'pages/stats/support-performance/overview/charts/ZeroTouchTicketsTrendCard'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { OverviewChart } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/common/components/TrendCard')
const TrendCardMock = assumeMock(TrendCard)

describe('ZeroTouchTicketsTrendCard', () => {
    beforeEach(() => {
        TrendCardMock.mockImplementation(() => <div />)
    })
    it('should render Trend Card with metric config', () => {
        const chartId = OverviewChart.ZeroTouchTicketsTrendCard

        render(<ZeroTouchTicketsTrendCard chartId={chartId} />)

        expect(TrendCardMock).toHaveBeenCalledWith(
            {
                ...OverviewMetricConfig[OverviewMetric.ZeroTouchTickets],
                drillDownMetric: OverviewMetric.ZeroTouchTickets,
                chartId,
            },
            {},
        )
    })
})
