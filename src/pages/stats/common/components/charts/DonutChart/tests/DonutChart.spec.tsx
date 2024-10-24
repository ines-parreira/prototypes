import colorTokens from '@gorgias/design-tokens/dist/tokens/colors.json'
import {render, screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import DonutChart from '../DonutChart'

const mockDoughnutProps = jest.fn()

jest.mock('react-chartjs-2', () => ({
    Doughnut: (props: unknown) => {
        mockDoughnutProps(props)

        return <>mock Doughnut</>
    },
}))

const renderComponent = (props: Partial<ComponentProps<typeof DonutChart>>) => {
    render(<DonutChart data={[]} showTooltip={false} {...props} />)
}

describe('<DonutChart />', () => {
    beforeEach(() => {
        mockDoughnutProps.mockClear()
    })

    it('should render loader', () => {
        renderComponent({isLoading: true})

        expect(mockDoughnutProps).not.toHaveBeenCalled()
        expect(document.querySelector('.skeleton')).toBeInTheDocument()
    })

    it('should pass correct data and config', () => {
        renderComponent({
            data: [
                {label: 'Label 1', value: 11},
                {label: 'Label 2', value: 12},
            ],
            width: 300,
            height: 300,
        })

        expect(mockDoughnutProps).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    labels: ['Label 1', 'Label 2'],
                    datasets: [
                        expect.objectContaining({
                            data: [11, 12],
                        }),
                    ],
                }),
                width: 300,
                height: 300,
            })
        )
    })

    it('should pass custom colors', () => {
        const customColors = [
            colorTokens['📺 Classic'].Neutral.Grey_0.value,
            colorTokens['📺 Classic'].Neutral.Grey_6.value,
        ]
        renderComponent({
            data: [
                {label: 'Label 1', value: 11},
                {label: 'Label 2', value: 12},
            ],
            customColors,
        })

        expect(mockDoughnutProps).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    datasets: [
                        expect.objectContaining({
                            backgroundColor: customColors,
                        }),
                    ],
                }),
            })
        )
    })

    it('should hide displayLegend when it disabled', () => {
        renderComponent({
            data: [
                {label: 'Label 1', value: 11},
                {label: 'Label 2', value: 12},
            ],
            displayLegend: false,
        })

        expect(screen.queryByText('Label 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Label 2')).not.toBeInTheDocument()
    })

    it('should show displayLegend when it enabled', () => {
        renderComponent({
            data: [
                {label: 'Label 1', value: 11},
                {label: 'Label 2', value: 12},
            ],
            displayLegend: true,
        })

        expect(screen.getByText('Label 1')).toBeInTheDocument()
        expect(screen.getByText('Label 2')).toBeInTheDocument()
    })
})
