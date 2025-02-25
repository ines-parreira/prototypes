import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { Chart } from 'chart.js'

import { ChartLegend } from 'pages/stats/common/components/charts/ChartLegend'

jest.mock('chart.js')
jest.mock(
    'pages/stats/Legend',
    () =>
        ({
            items,
            className,
        }: {
            items: [
                {
                    label: string
                    onChange: () => void
                },
            ]
            className: string
            toggleLegend: boolean
        }) => {
            return (
                <div className={`Legend ${className}`}>
                    {items.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.onChange}
                            data-testid={`legend-item-${index}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )
        },
)

const initialProps = {
    data: [],
    chartColors: jest.fn(),
    linesVisibility: null,
    setLinesVisibility: jest.fn(),
    chart: new Chart('bar', {
        type: 'bar',
        data: {
            labels: ['l1', 'l2'],
            datasets: [
                {
                    data: [
                        [300, 200],
                        [500, 200],
                    ],
                },
            ],
        },
    }) as unknown as Chart,
}

const setup = (props = {}) => {
    return render(<ChartLegend {...{ ...initialProps, ...props }} />)
}

describe('ChartLegend Component', () => {
    it('should not render when displayLegend is false', () => {
        setup()
        expect(screen.queryByTestId('legend-item-0')).not.toBeInTheDocument()
    })

    it('should render correctly when displayLegend is true', () => {
        setup({
            displayLegend: true,
            data: [{ label: 'Test Label', tooltip: 'Test Tooltip' }],
        })
        expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('applies correct classes based on legendOnLeft prop', () => {
        const { rerender } = setup({
            data: [{ label: 'Legend' }],
            displayLegend: true,
            legendOnLeft: true,
        })
        expect(screen.getByText('Legend').parentElement).toHaveClass(
            'legendOnLeft',
        )
        rerender(
            <ChartLegend
                {...initialProps}
                data={[{ label: 'Legend', values: [{ x: '0', y: 0 }] }]}
                displayLegend={true}
                legendOnLeft={false}
            />,
        )
        expect(screen.getByText('Legend')).not.toHaveClass('legendOnLeft')
    })

    it('should toggle line visibility on item click when toggleLegend is true', () => {
        const setLinesVisibility = jest.fn()
        const chartMock = {
            isDatasetVisible: jest.fn().mockReturnValue(true),
            setDatasetVisibility: jest.fn(),
            update: jest.fn(),
        }

        setup({
            displayLegend: true,
            data: [{ label: 'Item 1', tooltip: 'Tooltip 1' }],
            chartColors: () => '#000',
            toggleLegend: true,
            chart: chartMock,
            setLinesVisibility,
        })

        fireEvent.click(screen.getByTestId('legend-item-0'))
        expect(chartMock.setDatasetVisibility).toHaveBeenCalledWith(0, false)
        expect(setLinesVisibility).toHaveBeenCalled()
        expect(chartMock.update).toHaveBeenCalled()
    })
})
