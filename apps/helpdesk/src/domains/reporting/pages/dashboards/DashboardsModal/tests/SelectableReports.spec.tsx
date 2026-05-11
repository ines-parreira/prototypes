import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import { SelectableReports } from 'domains/reporting/pages/dashboards/DashboardsModal/SelectableReports'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { OverviewChart } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'

const mockChartComponent = () => <div />

const visibleChildConfig = {
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
}

const hiddenChildConfig = {
    id: ReportsIDs.AiAgentAnalyticsOverview,
    reportName: 'Hidden Report',
    reportPath: '/hidden',
    charts: {
        hiddenChart1: {
            chartComponent: mockChartComponent,
            label: 'AI Overview',
            csvProducer: null,
            description: '',
            chartType: ChartType.Card,
        },
    },
    reportFilters: { optional: [], persistent: [] },
}

const config = [
    {
        category: 'Test Category',
        children: [
            { type: OverviewChart, config: visibleChildConfig },
            { type: OverviewChart, hidden: true, config: hiddenChildConfig },
        ],
    },
]

const defaultProps = {
    config,
    checkedCharts: [],
    selectedReport: null,
    setSelectedReport: jest.fn(),
}

describe('SelectableReports', () => {
    it('renders report names for visible reports', () => {
        render(<SelectableReports {...defaultProps} />)

        expect(screen.getByText('Visible Report')).toBeInTheDocument()
    })

    it('does not render report names for hidden reports', () => {
        render(<SelectableReports {...defaultProps} />)

        expect(screen.queryByText('Hidden Report')).not.toBeInTheDocument()
    })

    it('returns nothing when config is null', () => {
        const { container } = render(
            <SelectableReports {...defaultProps} config={null} />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('marks only the report with a matching id as selected', () => {
        const sharedReportPath = '/shared-path'
        const reportA = {
            id: ReportsIDs.AiAgentAnalyticsAllAgents,
            reportName: 'All Agents',
            reportPath: sharedReportPath,
            charts: {},
            reportFilters: { optional: [], persistent: [] },
        }
        const reportB = {
            id: ReportsIDs.AiAgentAnalyticsShoppingAssistant,
            reportName: 'Shopping Assistant',
            reportPath: sharedReportPath,
            charts: {},
            reportFilters: { optional: [], persistent: [] },
        }
        const sharedPathConfig = [
            {
                category: 'AI & automation',
                children: [
                    { type: OverviewChart, config: reportA },
                    { type: OverviewChart, config: reportB },
                ],
            },
        ]

        render(
            <SelectableReports
                {...defaultProps}
                config={sharedPathConfig}
                selectedReport={reportA}
            />,
        )

        expect(
            screen.getByText('All Agents').closest('.isSelected'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Shopping Assistant').closest('.isSelected'),
        ).toBeNull()
    })
})
