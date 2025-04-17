import React from 'react'

import { render, screen } from '@testing-library/react'

import {
    ChartTooltipContent,
    TOTAL_LABEL,
} from 'pages/stats/common/components/charts/ChartTooltipContent'

describe('<ChartTooltipContent />', () => {
    const tooltip = {
        labelColors: [
            {
                backgroundColor: 'red',
                borderWidth: '1',
                borderColor: 'blue',
                borderRadius: '0',
            },
            {
                backgroundColor: 'red',
                borderWidth: '1',
                borderColor: 'blue',
                borderRadius: '0',
            },
        ],
        dataPoints: [
            {
                dataset: {
                    label: 'Label_1',
                },
                formattedValue: 22,
            },
            {
                dataset: {
                    label: 'Label_2',
                },
                formattedValue: 8,
            },
        ],
    } as any

    it('should render the chart line tooltip', () => {
        render(<ChartTooltipContent tooltip={tooltip} />)

        expect(screen.getByText(/Label_1/)).toBeInTheDocument()
        expect(screen.getByText(/Label_2/)).toBeInTheDocument()
    })

    it('should display N/A when showZeroAsNA is true and value is 0', () => {
        const zeroTooltip = {
            labelColors: [
                {
                    backgroundColor: 'red',
                    borderWidth: '1',
                    borderColor: 'blue',
                    borderRadius: '0',
                },
            ],
            dataPoints: [
                {
                    dataset: {
                        label: 'Label',
                    },
                    formattedValue: '0',
                },
            ],
        } as any

        render(<ChartTooltipContent tooltip={zeroTooltip} showZeroAsNA />)

        expect(screen.getByText('N/A')).toBeInTheDocument()
    })

    it('should display total when withTotal is true', () => {
        render(<ChartTooltipContent tooltip={tooltip} withTotal />)

        expect(screen.getByText(TOTAL_LABEL)).toBeInTheDocument()
        expect(screen.getByText('30')).toBeInTheDocument() // 10 + 20
    })

    it('should not display total when withTotal is false', () => {
        render(<ChartTooltipContent tooltip={tooltip} />)

        expect(screen.getByText(/Label_1/)).toBeInTheDocument()
        expect(screen.getByText(/Label_2/)).toBeInTheDocument()
        expect(screen.queryByText(TOTAL_LABEL)).not.toBeInTheDocument()
    })

    it('should handle borderRadius correctly', () => {
        render(<ChartTooltipContent tooltip={tooltip} />)

        const tooltipItem = document.querySelector('.tooltipItemBox')
        expect(tooltipItem).toHaveAttribute(
            'style',
            'background-color: red; border-color: blue; border-radius: 2px;',
        )
    })
})
