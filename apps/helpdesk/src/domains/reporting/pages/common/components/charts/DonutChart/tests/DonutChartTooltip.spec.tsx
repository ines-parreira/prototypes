import React from 'react'

import { render } from '@testing-library/react'
import { TooltipModel } from 'chart.js'

import { DonutChartTooltip } from 'domains/reporting/pages/common/components/charts/DonutChart/DonutChartTooltip'

jest.mock(
    'domains/reporting/pages/common/components/charts/DonutChart/DonutChartTooltip.less',
    () => ({
        container: 'container-class',
        tooltipColorBox: 'tooltipColorBox-class',
        tooltipText: 'tooltipText-class',
    }),
)

describe('DonutChartTooltip', () => {
    const mockTooltip = {
        labelColors: [
            {
                backgroundColor: 'red',
                borderWidth: 2,
                borderColor: 'black',
                borderRadius: 4,
            },
        ],
        dataPoints: [
            {
                label: 'Test Label',
                raw: 50,
                formattedValue: '50',
            },
        ],
    } as unknown as TooltipModel

    test('renders the tooltip with correct text', () => {
        const { getByText } = render(
            <DonutChartTooltip tooltip={mockTooltip} total={100} />,
        )

        expect(getByText('Test Label:')).toBeInTheDocument()
        expect(getByText('50/100 (50%)')).toBeInTheDocument()
    })

    test('applies correct styles to color box', () => {
        const { container } = render(
            <DonutChartTooltip tooltip={mockTooltip} total={100} />,
        )

        const colorBox = container.querySelector('.tooltipColorBox-class')

        expect(colorBox).toBeInTheDocument()
        expect(colorBox).toHaveStyle({
            backgroundColor: 'red',
            borderWidth: '2px',
            borderColor: 'black',
            borderRadius: '4px',
        })
    })

    test('applies correct fallback styles to color box if labelColors are not provided', () => {
        const mockTooltip = {
            labelColors: [{}],
            dataPoints: [
                {
                    label: 'Test Label',
                    raw: 50,
                    formattedValue: '50',
                },
            ],
        } as unknown as TooltipModel

        const { container } = render(
            <DonutChartTooltip tooltip={mockTooltip} total={100} />,
        )

        const colorBox = container.querySelector('.tooltipColorBox-class')

        expect(colorBox).toBeInTheDocument()
        expect(colorBox).toHaveStyle({
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderRadius: 0,
        })
    })

    test('calculates percentage correctly', () => {
        const { getByText } = render(
            <DonutChartTooltip tooltip={mockTooltip} total={200} />,
        )

        expect(getByText('50/200 (25%)')).toBeInTheDocument()
    })
})
