import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'

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
    const data = [
        {
            dateTime: '2023-07-03',
            value: 10,
        },
        {
            dateTime: '2023-07-10',
            value: 0,
        },
        {
            dateTime: '2023-07-17',
            value: 15,
        },
        {
            dateTime: '2023-07-24',
            value: 22,
        },
    ] as TimeSeriesDataItem[]

    it('renders the correct number of bars', () => {
        const { container } = render(
            <AnalyticsBarChart
                data={data}
                metricFormat={'currency'}
                currency={'USD'}
                period={{ start: '2023-07-03', end: '2023-07-26' }}
            />,
        )
        const bars = container.querySelectorAll('.bar')
        expect(bars.length).toBe(data.length)
    })

    it('shows tooltip on bar hover', async () => {
        const { container } = render(
            <AnalyticsBarChart
                data={data}
                metricFormat={'currency'}
                currency={'USD'}
                period={{ start: '2023-07-03', end: '2023-07-26' }}
            />,
        )
        const bars = container.querySelectorAll('.bar')

        await act(async () => {
            await userEvent.hover(bars[0])
        })
        expect(screen.getByTestId('tooltip')).toBeInTheDocument()
        expect(screen.getByText('Jul 3 - Jul 9')).toBeInTheDocument()
        expect(screen.getByText('$10')).toBeInTheDocument()
        await act(async () => {
            await userEvent.unhover(bars[0])
        })

        await act(async () => {
            await userEvent.hover(bars[3])
        })
        expect(screen.getByTestId('tooltip')).toBeInTheDocument()
        expect(screen.getByText('Jul 24 - Jul 26')).toBeInTheDocument()
        expect(screen.getByText('$22')).toBeInTheDocument()
    })

    it('hides tooltip when not hovering', async () => {
        const { container } = render(
            <AnalyticsBarChart
                data={data}
                metricFormat={'currency'}
                currency={'USD'}
                period={{ start: '2023-07-03', end: '2023-07-26' }}
            />,
        )
        const bars = container.querySelectorAll('.bar')
        await act(async () => {
            await userEvent.hover(bars[0])
        })
        expect(screen.getByTestId('tooltip')).toBeInTheDocument()
        await act(async () => {
            await userEvent.unhover(bars[0])
        })
        expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
    })

    it('returns empty array when dataArray is empty', () => {
        const { container } = render(
            <AnalyticsBarChart
                data={[]}
                currency={'USD'}
                metricFormat={'currency'}
                period={{ start: '2023-07-03', end: '2023-07-26' }}
            />,
        )

        const bars = container.querySelectorAll('.bar')
        expect(bars.length).toBe(0)
    })
})
