import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { AnalyticsBarChart } from './AnalyticsBarChart'

jest.mock('../Tooltip/Tooltip', () => ({
    Tooltip: ({ date, info }: { date: string; info: string }) => (
        <div data-testid="tooltip">
            <span>{date}</span>
            <span>{info}</span>
        </div>
    ),
}))

describe('<AnalyticsBarChart />', () => {
    const dataArray = [
        { value: 10, dateRange: 'Jun 26th - Jun 31st' },
        { value: 20, dateRange: 'Jun 21st - Jun 25th' },
        { value: 30, dateRange: 'Jun 16th - Jun 20th' },
    ]

    it('renders the correct number of bars', () => {
        const { container } = render(
            <AnalyticsBarChart dataArray={dataArray} />,
        )
        const bars = container.querySelectorAll('.bar')
        expect(bars.length).toBe(dataArray.length)
    })

    it('shows tooltip on bar hover', async () => {
        const { container } = render(
            <AnalyticsBarChart dataArray={dataArray} />,
        )
        const bars = container.querySelectorAll('.bar')
        await userEvent.hover(bars[1])
        expect(screen.getByTestId('tooltip')).toBeInTheDocument()
        expect(screen.getByText('Jun 21st - Jun 25th')).toBeInTheDocument()
        expect(screen.getByText('20')).toBeInTheDocument()
    })

    it('hides tooltip when not hovering', async () => {
        const { container } = render(
            <AnalyticsBarChart dataArray={dataArray} />,
        )
        const bars = container.querySelectorAll('.bar')
        await userEvent.hover(bars[0])
        expect(screen.getByTestId('tooltip')).toBeInTheDocument()
        await userEvent.unhover(bars[0])
        expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
    })
})
