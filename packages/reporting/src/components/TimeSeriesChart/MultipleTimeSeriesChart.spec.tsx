import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import type { MultipleTimeSeriesDataItem } from '../ChartCard/types'
import {
    MultipleTimeSeriesChart,
    MultipleTimeSeriesLegend,
    renderMultipleTimeSeriesTooltipContent,
} from './MultipleTimeSeriesChart'

beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    }
})

const mockData: MultipleTimeSeriesDataItem[] = [
    {
        label: 'Series A',
        values: [
            { date: 'Jan 1', value: 100 },
            { date: 'Jan 2', value: 150 },
            { date: 'Jan 3', value: 120 },
        ],
    },
    {
        label: 'Series B',
        values: [
            { date: 'Jan 1', value: 50 },
            { date: 'Jan 2', value: 80 },
            { date: 'Jan 3', value: 60 },
        ],
    },
]

describe('MultipleTimeSeriesChart', () => {
    describe('Loading state', () => {
        it('should render when loading', () => {
            const { container } = render(
                <MultipleTimeSeriesChart data={[]} isLoading={true} />,
            )

            expect(container.firstChild).toBeTruthy()
        })
    })

    describe('Data rendering', () => {
        it('should render chart component', () => {
            const { container } = render(
                <MultipleTimeSeriesChart data={mockData} />,
            )

            expect(container.firstChild).toBeTruthy()
        })

        it('should render with empty data', () => {
            const { container } = render(<MultipleTimeSeriesChart data={[]} />)

            expect(container.firstChild).toBeTruthy()
        })

        it('should render with a single series', () => {
            const { container } = render(
                <MultipleTimeSeriesChart data={[mockData[0]]} />,
            )

            expect(container.firstChild).toBeTruthy()
        })
    })

    describe('Legend', () => {
        it('should render legend by default', () => {
            render(<MultipleTimeSeriesChart data={mockData} />)

            expect(screen.getByText('Series A')).toBeInTheDocument()
            expect(screen.getByText('Series B')).toBeInTheDocument()
        })

        it('should not render legend when withLegend is false', () => {
            render(
                <MultipleTimeSeriesChart data={mockData} withLegend={false} />,
            )

            expect(screen.queryByText('Series A')).not.toBeInTheDocument()
            expect(screen.queryByText('Series B')).not.toBeInTheDocument()
        })
    })

    describe('Edge cases', () => {
        it('should handle null values in data', () => {
            const dataWithNull: MultipleTimeSeriesDataItem[] = [
                {
                    label: 'Series A',
                    values: [
                        { date: 'Jan 1', value: 100 },
                        { date: 'Jan 2', value: null },
                        { date: 'Jan 3', value: 120 },
                    ],
                },
            ]

            const { container } = render(
                <MultipleTimeSeriesChart data={dataWithNull} />,
            )

            expect(container.firstChild).toBeTruthy()
        })
    })
})

describe('MultipleTimeSeriesLegend', () => {
    it('should render series names', () => {
        const seriesWithColors = [
            { name: 'Series A', value: 0, color: '#800080' },
            { name: 'Series B', value: 0, color: '#FFA500' },
        ]

        render(<MultipleTimeSeriesLegend seriesWithColors={seriesWithColors} />)

        expect(screen.getByText('Series A')).toBeInTheDocument()
        expect(screen.getByText('Series B')).toBeInTheDocument()
    })
})

describe('renderMultipleTimeSeriesTooltipContent', () => {
    it('should return null when payload is empty', () => {
        const renderer = renderMultipleTimeSeriesTooltipContent()
        const result = renderer({ payload: [] })

        expect(result).toBeNull()
    })

    it('should return null when payload is undefined', () => {
        const renderer = renderMultipleTimeSeriesTooltipContent()
        const result = renderer({ payload: undefined })

        expect(result).toBeNull()
    })

    it('should render date from payload', () => {
        const renderer = renderMultipleTimeSeriesTooltipContent()
        const payload = [
            { dataKey: 'Series A', value: 100, payload: { date: 'Jan 1' } },
        ]

        const result = renderer({ payload })
        render(<>{result}</>)

        expect(screen.getByText('Jan 1')).toBeInTheDocument()
    })

    it('should render series label and value', () => {
        const renderer = renderMultipleTimeSeriesTooltipContent()
        const payload = [
            { dataKey: 'Series A', value: 100, payload: { date: 'Jan 1' } },
        ]

        const result = renderer({ payload })
        render(<>{result}</>)

        expect(screen.getByText('Series A:')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should render all series in a multi-series payload', () => {
        const renderer = renderMultipleTimeSeriesTooltipContent()
        const payload = [
            { dataKey: 'Series A', value: 100, payload: { date: 'Jan 1' } },
            { dataKey: 'Series B', value: 50, payload: { date: 'Jan 1' } },
        ]

        const result = renderer({ payload })
        render(<>{result}</>)

        expect(screen.getByText('Series A:')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
        expect(screen.getByText('Series B:')).toBeInTheDocument()
        expect(screen.getByText('50')).toBeInTheDocument()
    })

    it('should apply valueFormatter to values', () => {
        const valueFormatter = (value: number) => `$${value}`
        const renderer = renderMultipleTimeSeriesTooltipContent(valueFormatter)
        const payload = [
            { dataKey: 'Series A', value: 100, payload: { date: 'Jan 1' } },
        ]

        const result = renderer({ payload })
        render(<>{result}</>)

        expect(screen.getByText('$100')).toBeInTheDocument()
    })

    it('should apply dateFormatter to the date', () => {
        const dateFormatter = (date: string) => `Formatted: ${date}`
        const renderer = renderMultipleTimeSeriesTooltipContent(
            undefined,
            dateFormatter,
        )
        const payload = [
            { dataKey: 'Series A', value: 100, payload: { date: 'Jan 1' } },
        ]

        const result = renderer({ payload })
        render(<>{result}</>)

        expect(screen.getByText('Formatted: Jan 1')).toBeInTheDocument()
    })
})
