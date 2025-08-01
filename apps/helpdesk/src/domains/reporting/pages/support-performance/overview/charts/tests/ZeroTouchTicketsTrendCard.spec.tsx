import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import { ZeroTouchTicketsTrendCard } from 'domains/reporting/pages/support-performance/overview/charts/ZeroTouchTicketsTrendCard'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { OverviewChart } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'

jest.mock('domains/reporting/pages/common/components/TrendCard')
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
