import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { SelectableCharts } from 'domains/reporting/pages/dashboards/DashboardsModal/SelectableCharts'
import { ChartType } from 'domains/reporting/pages/dashboards/types'

const mockChartComponent = () => <div />

const defaultProps = {
    checkedCharts: [],
    setCheckedCharts: jest.fn(),
}

describe('SelectableCharts', () => {
    it('renders the chart label', () => {
        render(
            <SelectableCharts
                {...defaultProps}
                charts={{
                    chart1: {
                        chartComponent: mockChartComponent,
                        label: 'Automation Rate',
                        csvProducer: null,
                        chartType: ChartType.Card,
                    },
                }}
            />,
        )

        expect(screen.getByText('Automation Rate')).toBeInTheDocument()
    })

    it('renders description from the description field', () => {
        render(
            <SelectableCharts
                {...defaultProps}
                charts={{
                    chart1: {
                        chartComponent: mockChartComponent,
                        label: 'Overview',
                        description: 'Legacy description text',
                        csvProducer: null,
                        chartType: ChartType.Card,
                    },
                }}
            />,
        )

        expect(screen.getByText('Legacy description text')).toBeInTheDocument()
    })

    it('renders description from tooltipConfig caption when description is absent', () => {
        render(
            <SelectableCharts
                {...defaultProps}
                charts={{
                    chart1: {
                        chartComponent: mockChartComponent,
                        label: 'Automation Rate',
                        tooltipConfig: {
                            title: 'AI Agent automation rate',
                            caption:
                                'Percentage of interactions fully handled by AI Agent.',
                        },
                        csvProducer: null,
                        chartType: ChartType.Card,
                    },
                }}
            />,
        )

        expect(
            screen.getByText(
                'Percentage of interactions fully handled by AI Agent.',
            ),
        ).toBeInTheDocument()
    })

    it('prefers description over tooltipConfig caption when both are present', () => {
        render(
            <SelectableCharts
                {...defaultProps}
                charts={{
                    chart1: {
                        chartComponent: mockChartComponent,
                        label: 'Automation Rate',
                        description: 'Explicit description',
                        tooltipConfig: {
                            title: 'Tooltip title',
                            caption: 'Tooltip caption',
                        },
                        csvProducer: null,
                        chartType: ChartType.Card,
                    },
                }}
            />,
        )

        expect(screen.getByText('Explicit description')).toBeInTheDocument()
        expect(screen.queryByText('Tooltip caption')).not.toBeInTheDocument()
    })
})
