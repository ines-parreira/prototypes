import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ChartTypeToggle } from '../ChartTypeToggle'

describe('ChartTypeToggle', () => {
    it('should render with donut chart selected by default', () => {
        const mockOnChange = jest.fn()

        render(
            <ChartTypeToggle
                chartType="donut"
                onChartTypeChange={mockOnChange}
            />,
        )

        const radioGroup = screen.getByRole('radiogroup')
        const buttons = within(radioGroup).getAllByRole('radio')

        expect(buttons[0]).toHaveAttribute('aria-checked', 'true')
        expect(buttons[1]).toHaveAttribute('aria-checked', 'false')
    })

    it('should render with bar chart selected', () => {
        const mockOnChange = jest.fn()

        render(
            <ChartTypeToggle
                chartType="bar"
                onChartTypeChange={mockOnChange}
            />,
        )

        const radioGroup = screen.getByRole('radiogroup')
        const buttons = within(radioGroup).getAllByRole('radio')

        expect(buttons[0]).toHaveAttribute('aria-checked', 'false')
        expect(buttons[1]).toHaveAttribute('aria-checked', 'true')
    })

    it('should call onChartTypeChange when donut button is clicked', async () => {
        const user = userEvent.setup()
        const mockOnChange = jest.fn()

        render(
            <ChartTypeToggle
                chartType="bar"
                onChartTypeChange={mockOnChange}
            />,
        )

        const radioGroup = screen.getByRole('radiogroup')
        const buttons = within(radioGroup).getAllByRole('radio')
        const donutButton = buttons[0]

        await act(() => user.click(donutButton))

        expect(mockOnChange).toHaveBeenCalledWith('donut')
    })

    it('should call onChartTypeChange when bar button is clicked', async () => {
        const user = userEvent.setup()
        const mockOnChange = jest.fn()

        render(
            <ChartTypeToggle
                chartType="donut"
                onChartTypeChange={mockOnChange}
            />,
        )

        const radioGroup = screen.getByRole('radiogroup')
        const buttons = within(radioGroup).getAllByRole('radio')
        const barButton = buttons[1]

        await act(() => user.click(barButton))

        expect(mockOnChange).toHaveBeenCalledWith('bar')
    })

    it('should have correct aria-labels for accessibility', () => {
        const mockOnChange = jest.fn()

        render(
            <ChartTypeToggle
                chartType="donut"
                onChartTypeChange={mockOnChange}
            />,
        )

        expect(
            screen.getByRole('img', { name: /chart-pie/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('img', { name: /chart-bar-vertical/i }),
        ).toBeInTheDocument()
    })
})
