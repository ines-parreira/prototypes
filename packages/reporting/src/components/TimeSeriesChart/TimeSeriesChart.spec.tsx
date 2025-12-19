import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import type { TimeSeriesDataItem } from '../ChartCard/types'
import {
    renderTimeSeriesTooltipContent,
    TimeSeriesChart,
} from './TimeSeriesChart'

beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    }
})

const mockData: TimeSeriesDataItem[] = [
    { date: 'Jan 1', value: 100 },
    { date: 'Jan 2', value: 150 },
    { date: 'Jan 3', value: 120 },
    { date: 'Jan 4', value: 180 },
]

describe('TimeSeriesChart', () => {
    describe('Loading state', () => {
        it('should render when loading', () => {
            const { container } = render(
                <TimeSeriesChart data={[]} isLoading={true} />,
            )

            expect(container.firstChild).toBeTruthy()
        })
    })

    describe('Data rendering', () => {
        it('should render chart component', () => {
            const { container } = render(<TimeSeriesChart data={mockData} />)

            expect(container.firstChild).toBeTruthy()
        })

        it('should render with empty data', () => {
            const { container } = render(<TimeSeriesChart data={[]} />)

            expect(container.firstChild).toBeTruthy()
        })
    })

    describe('renderTimeSeriesTooltipContent', () => {
        it('should return null when payload is empty', () => {
            const renderer = renderTimeSeriesTooltipContent()
            const result = renderer({ payload: [] })

            expect(result).toBeNull()
        })

        it('should return null when payload is undefined', () => {
            const renderer = renderTimeSeriesTooltipContent()
            const result = renderer({ payload: undefined })

            expect(result).toBeNull()
        })

        it('should render tooltip with data', () => {
            const renderer = renderTimeSeriesTooltipContent()
            const payload = [
                {
                    payload: { date: 'Jan 1', value: 100 },
                },
            ]

            const result = renderer({ payload })
            expect(result).not.toBeNull()
        })

        it('should pass valueFormatter to tooltip', () => {
            const valueFormatter = (value: number) => `$${value}`
            const renderer = renderTimeSeriesTooltipContent(valueFormatter)
            const payload = [
                {
                    payload: { date: 'Jan 1', value: 100 },
                },
            ]

            const result = renderer({ payload })
            render(<>{result}</>)

            expect(screen.getByText('$100')).toBeInTheDocument()
        })

        it('should render tooltip with date', () => {
            const renderer = renderTimeSeriesTooltipContent()
            const payload = [
                {
                    payload: { date: 'Jan 1', value: 100 },
                },
            ]

            const result = renderer({ payload })
            render(<>{result}</>)

            expect(screen.getByText('Jan 1')).toBeInTheDocument()
        })

        it('should pass dateFormatter to tooltip', () => {
            const dateFormatter = (date: string) => `Formatted: ${date}`
            const renderer = renderTimeSeriesTooltipContent(
                undefined,
                dateFormatter,
            )
            const payload = [
                {
                    payload: { date: 'Jan 1', value: 100 },
                },
            ]

            const result = renderer({ payload })
            render(<>{result}</>)

            expect(screen.getByText('Formatted: Jan 1')).toBeInTheDocument()
        })
    })

    describe('Edge cases', () => {
        it('should handle null values in data', () => {
            const dataWithNull: TimeSeriesDataItem[] = [
                { date: 'Jan 1', value: 100 },
                { date: 'Jan 2', value: null },
                { date: 'Jan 3', value: 120 },
            ]

            const { container } = render(
                <TimeSeriesChart data={dataWithNull} />,
            )

            expect(container.firstChild).toBeTruthy()
        })

        it('should handle single data point', () => {
            const singleData: TimeSeriesDataItem[] = [
                { date: 'Jan 1', value: 100 },
            ]

            const { container } = render(<TimeSeriesChart data={singleData} />)

            expect(container.firstChild).toBeTruthy()
        })

        it('should render without gradient when useGradient is false', () => {
            const { container } = render(
                <TimeSeriesChart
                    data={mockData}
                    useGradient={false}
                    color="#FF0000"
                />,
            )

            expect(container.firstChild).toBeTruthy()
        })
    })
})
