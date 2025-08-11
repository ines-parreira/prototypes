import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { AnalyticsBarChart, DataArrayType } from './AnalyticsBarChart'

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
        {
            dateRange: {
                startDate: '2025-07-09T00:00:00Z',
                endDate: '2025-07-14T23:59:59Z',
            },
            value: [
                {
                    label: 'Total Revenue',
                    value: 15,
                    prevValue: null,
                    interpretAs: 'more-is-better' as
                        | 'more-is-better'
                        | 'less-is-better'
                        | 'neutral',
                    metricFormat: 'currency',
                    currency: 'USD',
                    isLoading: false,
                },
                {
                    label: 'Total Orders',
                    value: 10,
                    prevValue: 0,
                    interpretAs: 'more-is-better' as
                        | 'more-is-better'
                        | 'less-is-better'
                        | 'neutral',
                    metricFormat: 'decimal-precision-1',
                    isLoading: false,
                },
                {
                    label: 'Conversion rate',
                    value: 20,
                    prevValue: 0,
                    interpretAs: 'more-is-better' as
                        | 'more-is-better'
                        | 'less-is-better'
                        | 'neutral',
                    metricFormat: 'percent',
                    isLoading: false,
                },
                {
                    label: 'Click Through Rate',
                    value: 30,
                    prevValue: 0,
                    interpretAs: 'more-is-better' as
                        | 'more-is-better'
                        | 'less-is-better'
                        | 'neutral',
                    metricFormat: 'percent',
                    currency: 'USD',
                    isLoading: false,
                },
            ],
        },
    ] as DataArrayType[]

    it('renders the correct number of bars', () => {
        const { container } = render(
            <AnalyticsBarChart dataArray={dataArray} metricIndex={1} />,
        )
        const bars = container.querySelectorAll('.bar')
        expect(bars.length).toBe(dataArray.length)
    })

    it('shows tooltip on bar hover', async () => {
        const { container } = render(
            <AnalyticsBarChart dataArray={dataArray} metricIndex={1} />,
        )
        const bars = container.querySelectorAll('.bar')
        await userEvent.hover(bars[0])
        expect(screen.getByTestId('tooltip')).toBeInTheDocument()
        expect(screen.getByText('Jul 9 - Jul 14')).toBeInTheDocument()
        expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('hides tooltip when not hovering', async () => {
        const { container } = render(
            <AnalyticsBarChart dataArray={dataArray} metricIndex={1} />,
        )
        const bars = container.querySelectorAll('.bar')
        await userEvent.hover(bars[0])
        expect(screen.getByTestId('tooltip')).toBeInTheDocument()
        await userEvent.unhover(bars[0])
        expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
    })

    it('returns empty array when dataArray is empty', () => {
        const { container } = render(
            <AnalyticsBarChart dataArray={[]} metricIndex={0} />,
        )

        const bars = container.querySelectorAll('.bar')
        expect(bars.length).toBe(0)
    })
})
