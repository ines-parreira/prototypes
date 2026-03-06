import { fireEvent, render, screen } from '@testing-library/react'

import { REPORTS_CONFIG } from 'domains/reporting/pages/dashboards/config'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import {
    getSearchConfig,
    ModalSearchBar,
} from 'domains/reporting/pages/dashboards/DashboardsModal/ModalSearchBar'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import type { ReportsModalConfig } from 'domains/reporting/pages/dashboards/types'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'

const setConfig = jest.fn()
const setSelectedReport = jest.fn()
const props = {
    config: REPORTS_CONFIG,
    setConfig,
    setSelectedReport,
}

const mockChartComponent = () => <div />

const searchTestConfig: ReportsModalConfig = [
    {
        category: 'Test Category',
        children: [
            {
                type: OverviewChart,
                config: {
                    id: ReportsIDs.SupportPerformanceOverviewReportConfig,
                    reportName: 'Visible Report',
                    reportPath: '/visible',
                    charts: {
                        chart1: {
                            chartComponent: mockChartComponent,
                            label: 'Messages Sent',
                            csvProducer: null,
                            description: '',
                            chartType: ChartType.Card,
                        },
                    },
                    reportFilters: { optional: [], persistent: [] },
                },
            },
            {
                type: OverviewChart,
                hidden: true,
                config: {
                    id: ReportsIDs.AiAgentAnalyticsOverview,
                    reportName: 'Hidden Report',
                    reportPath: '/hidden',
                    charts: {
                        hiddenChart1: {
                            chartComponent: mockChartComponent,
                            label: 'Messages Sent',
                            csvProducer: null,
                            description: '',
                            chartType: ChartType.Card,
                        },
                    },
                    reportFilters: { optional: [], persistent: [] },
                },
            },
        ],
    },
]

describe('getSearchConfig', () => {
    it('excludes hidden reports from search results even when charts match the search value', () => {
        const result = getSearchConfig(searchTestConfig, 'Messages Sent')

        expect(result).toHaveLength(1)
        expect(result![0].children).toHaveLength(1)
        expect(result![0].children[0].config.reportPath).toBe('/visible')
    })

    it('includes visible reports when charts match the search value', () => {
        const result = getSearchConfig(searchTestConfig, 'Messages Sent')

        expect(result![0].children[0].config.reportName).toBe('Visible Report')
    })
})

describe('ModalSearchBar', () => {
    it('should call the setters on value change', async () => {
        render(<ModalSearchBar {...props} />, {})

        const value = 'Messages'

        const inputElement = screen.getByRole('textbox')
        fireEvent.change(inputElement, { target: { value } })

        const calledCharts = {
            ...SupportPerformanceOverviewReportConfig,
            charts: {
                [OverviewChart.MessagesPerTicketTrendCard]:
                    SupportPerformanceOverviewReportConfig.charts[
                        OverviewChart.MessagesPerTicketTrendCard
                    ],
                [OverviewChart.MessagesSentGraph]:
                    SupportPerformanceOverviewReportConfig.charts[
                        OverviewChart.MessagesSentGraph
                    ],
                [OverviewChart.MessagesSentTrendCard]:
                    SupportPerformanceOverviewReportConfig.charts[
                        OverviewChart.MessagesSentTrendCard
                    ],
                [OverviewChart.MessagesReceivedTrendCard]:
                    SupportPerformanceOverviewReportConfig.charts[
                        OverviewChart.MessagesReceivedTrendCard
                    ],
            },
        }

        expect(setConfig).toHaveBeenLastCalledWith([
            {
                category: 'Support Performance',
                children: [
                    {
                        type: OverviewChart,
                        config: calledCharts,
                    },
                ],
            },
        ])
        expect(setSelectedReport).toHaveBeenLastCalledWith(calledCharts)
    })

    it('should clear all values on clear', async () => {
        render(<ModalSearchBar {...props} />, {})

        const value = 'Messages'

        const inputElement = screen.getByRole('textbox')
        fireEvent.change(inputElement, { target: { value } })

        fireEvent.click(screen.getByText('close'))

        expect(screen.getByRole('textbox')).toHaveValue('')
        expect(setSelectedReport).toHaveBeenCalledWith(null)
        expect(setConfig).toHaveBeenCalledWith(REPORTS_CONFIG)
    })

    it('should manage no result case', async () => {
        render(<ModalSearchBar {...props} />, {})

        const value = 'NONEXISTENT_VALUE'

        const inputElement = screen.getByRole('textbox')
        fireEvent.change(inputElement, { target: { value } })

        expect(setConfig).toHaveBeenLastCalledWith(null)
        expect(setSelectedReport).toHaveBeenLastCalledWith(null)
    })
})
