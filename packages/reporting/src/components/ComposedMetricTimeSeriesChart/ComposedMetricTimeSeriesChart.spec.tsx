import { render, screen, waitFor } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { getColorValue } from '@gorgias/axiom'

import {
    ComposedMetricTimeSeriesChart,
    renderComposedMetricTimeSeriesTooltipContent,
} from './ComposedMetricTimeSeriesChart'
import type {
    ComposedMetricTimeSeriesDataItem,
    ComposedMetricTimeSeriesMarker,
} from './types'

beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    }
})

const mockData: ComposedMetricTimeSeriesDataItem[] = [
    {
        date: '2026-04-20',
        ticketVolume: 120,
        successRate: 72,
    },
    {
        date: '2026-04-21',
        ticketVolume: 150,
        successRate: 76,
    },
]

const mockTwentyEightDayData: ComposedMetricTimeSeriesDataItem[] = Array.from(
    { length: 28 },
    (_, index) => {
        const day = String(index + 1).padStart(2, '0')

        return {
            date: `2026-04-${day}`,
            ticketVolume: 100 + index,
            successRate: 70 + index / 10,
        }
    },
)

const mockMarkers: ComposedMetricTimeSeriesMarker[] = [
    {
        id: 'published-1',
        date: '2026-04-21',
        label: 'Changes published',
        description: 'v12 was published',
        actionHref: '/app/skills/published-1',
    },
]

const MARKER_COLOR = getColorValue('dataviz-purple')

const defaultProps = {
    data: mockData,
    barMetric: {
        dataKey: 'ticketVolume',
        label: 'Tickets',
        valueFormatter: (value: number) => `${value} tickets`,
    },
    lineMetric: {
        dataKey: 'successRate',
        label: 'Success rate',
        valueFormatter: (value: number) => `${value}%`,
    },
}

const propsWithNumericAxisDomains = {
    ...defaultProps,
    barMetric: {
        ...defaultProps.barMetric,
        yAxisDomain: [0, 200] as [number, number],
    },
    lineMetric: {
        ...defaultProps.lineMetric,
        yAxisDomain: [0, 100] as [number, number],
    },
}

const getSvgTranslateY = (element: Element | null) => {
    const transform = element?.getAttribute('transform')
    const match = transform?.match(/translate\([^,]+,\s*([^)]+)\)/)

    if (!match) throw new Error('Expected SVG translate transform')

    return Number(match[1])
}

describe('ComposedMetricTimeSeriesChart', () => {
    describe('loading state', () => {
        it('should render skeleton when loading', () => {
            const { container } = render(
                <ComposedMetricTimeSeriesChart
                    {...defaultProps}
                    isLoading={true}
                />,
            )

            expect(container.firstChild).toBeTruthy()
        })
    })

    describe('data rendering', () => {
        it('should render a responsive composed chart', () => {
            const { container } = render(
                <ComposedMetricTimeSeriesChart {...defaultProps} />,
            )

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).toBeInTheDocument()
        })

        it('should render with empty data', () => {
            const { container } = render(
                <ComposedMetricTimeSeriesChart {...defaultProps} data={[]} />,
            )

            expect(container.firstChild).toBeTruthy()
        })

        it('should render dotted horizontal scale lines without vertical grid lines', () => {
            const { container } = render(
                <ComposedMetricTimeSeriesChart
                    {...propsWithNumericAxisDomains}
                    containerWidth={600}
                />,
            )

            const horizontalScaleLines = container.querySelectorAll(
                '.recharts-cartesian-grid-horizontal line',
            )
            const bottomAxisLine = container.querySelector(
                '.recharts-xAxis .recharts-cartesian-axis-line',
            )
            const bottomAxisLineY = bottomAxisLine?.getAttribute('y1')

            expect(horizontalScaleLines).toHaveLength(5)
            horizontalScaleLines.forEach((line) => {
                expect(line).toHaveAttribute('stroke-dasharray', '1 5')
                expect(line).not.toHaveAttribute('y1', bottomAxisLineY)
            })
            expect(
                container.querySelector('.recharts-cartesian-grid-vertical'),
            ).not.toBeInTheDocument()
        })

        it('should not render a dotted baseline when axis domains are inferred', () => {
            const { container } = render(
                <ComposedMetricTimeSeriesChart
                    {...defaultProps}
                    containerWidth={600}
                />,
            )

            const bottomAxisLineY = container
                .querySelector('.recharts-xAxis .recharts-cartesian-axis-line')
                ?.getAttribute('y1')
            const hasDottedBaseline = Array.from(
                container.querySelectorAll(
                    '.recharts-cartesian-grid-horizontal line',
                ),
            ).some((line) => line.getAttribute('y1') === bottomAxisLineY)

            expect(hasDottedBaseline).toBe(false)
        })

        it('should render a solid bottom baseline at zero', () => {
            const { container } = render(
                <ComposedMetricTimeSeriesChart
                    {...propsWithNumericAxisDomains}
                    containerWidth={600}
                />,
            )

            const bottomAxisLine = container.querySelector(
                '.recharts-xAxis .recharts-cartesian-axis-line',
            )

            expect(bottomAxisLine).toBeInTheDocument()
            expect(bottomAxisLine).not.toHaveAttribute('stroke-dasharray')
            expect(bottomAxisLine).toHaveAttribute('stroke-width', '1')
            expect(bottomAxisLine).toHaveAttribute(
                'stroke',
                'var(--border-neutral-tertiary)',
            )
        })

        it('should render vertical x-axis tick markers centered above day labels', async () => {
            const { container } = render(
                <ComposedMetricTimeSeriesChart
                    {...propsWithNumericAxisDomains}
                    containerWidth={600}
                    dateFormatter={(date) => date.slice(5)}
                />,
            )

            await waitFor(() => {
                expect(screen.getByText('04-20')).toBeInTheDocument()
                expect(screen.getByText('04-21')).toBeInTheDocument()
            })

            const xAxisTicks = Array.from(
                document.querySelectorAll(
                    '.recharts-cartesian-axis-tick-label',
                ),
            ).filter((tick) => tick.textContent?.startsWith('04-'))

            expect(xAxisTicks).toHaveLength(mockData.length)
            xAxisTicks.forEach((tick) => {
                const tickLine = tick.querySelector('line')
                const tickLabel = tick.querySelector('text')
                const tickLineStartY = Number(tickLine?.getAttribute('y1') ?? 0)
                const tickGlobalStartY =
                    getSvgTranslateY(tick.querySelector('g')) + tickLineStartY
                const xAxisLineY = Number(
                    container
                        .querySelector(
                            '.recharts-xAxis .recharts-cartesian-axis-line',
                        )
                        ?.getAttribute('y1'),
                )

                expect(tickLine).toHaveAttribute('x1', '0')
                expect(tickLine).toHaveAttribute('x2', '0')
                expect(tickLine).toHaveAttribute('y1', '0')
                expect(tickLine).toHaveAttribute('y2', '6')
                expect(tickLine).toHaveAttribute(
                    'stroke',
                    'var(--border-neutral-tertiary)',
                )
                expect(tickGlobalStartY).toBe(xAxisLineY)
                expect(tickLabel).toHaveAttribute('text-anchor', 'middle')
            })
        })

        it('should sample x-axis labels when the full date range cannot fit', async () => {
            render(
                <ComposedMetricTimeSeriesChart
                    {...propsWithNumericAxisDomains}
                    data={mockTwentyEightDayData}
                    containerWidth={600}
                    dateFormatter={(date) => date.slice(5)}
                />,
            )

            await waitFor(() => {
                expect(screen.getByText('04-01')).toBeInTheDocument()
                expect(screen.getByText('04-28')).toBeInTheDocument()
            })

            const xAxisTicks = Array.from(
                document.querySelectorAll(
                    '.recharts-cartesian-axis-tick-label',
                ),
            ).filter((tick) => tick.textContent?.startsWith('04-'))

            expect(xAxisTicks).toHaveLength(8)
            expect(xAxisTicks.length).toBeLessThan(
                mockTwentyEightDayData.length,
            )
            expect(screen.queryByText('04-02')).not.toBeInTheDocument()
        })

        it('should render event markers as points on the line metric instead of reference lines', () => {
            const { container } = render(
                <ComposedMetricTimeSeriesChart
                    {...defaultProps}
                    containerWidth={600}
                    markers={mockMarkers}
                    markerColor={MARKER_COLOR}
                />,
            )

            expect(
                container.querySelector('.recharts-reference-line'),
            ).not.toBeInTheDocument()
            expect(
                container.querySelector(`circle[fill="${MARKER_COLOR}"]`),
            ).toBeInTheDocument()
        })
    })

    describe('legend', () => {
        it('should render metric labels by default', () => {
            render(<ComposedMetricTimeSeriesChart {...defaultProps} />)

            expect(screen.getByText('Tickets')).toBeInTheDocument()
            expect(screen.getByText('Success rate')).toBeInTheDocument()
        })

        it('should render marker legend after the line and bar metrics', () => {
            const { container } = render(
                <ComposedMetricTimeSeriesChart
                    {...defaultProps}
                    markerColor={MARKER_COLOR}
                    markerLegendLabel="Changes published in skill"
                    markers={mockMarkers}
                />,
            )

            const content = container.textContent ?? ''

            expect(
                screen.getByText('Changes published in skill'),
            ).toBeInTheDocument()
            expect(
                container.querySelectorAll('[data-legend-glyph="checkbox"]'),
            ).toHaveLength(2)
            expect(content.indexOf('Success rate')).toBeLessThan(
                content.indexOf('Tickets'),
            )
            expect(content.indexOf('Tickets')).toBeLessThan(
                content.indexOf('Changes published in skill'),
            )
        })

        it('should apply configured spacing between the chart and legend', () => {
            render(
                <ComposedMetricTimeSeriesChart
                    {...defaultProps}
                    legendGap={36}
                />,
            )

            expect(
                screen.getByText('Tickets').parentElement?.parentElement,
            ).toHaveStyle({
                marginTop: '36px',
            })
        })

        it('should hide metric labels when withLegend is false', () => {
            render(
                <ComposedMetricTimeSeriesChart
                    {...defaultProps}
                    withLegend={false}
                />,
            )

            expect(screen.queryByText('Tickets')).not.toBeInTheDocument()
            expect(screen.queryByText('Success rate')).not.toBeInTheDocument()
        })
    })

    describe('renderComposedMetricTimeSeriesTooltipContent', () => {
        it('should return null when payload is empty', () => {
            const renderer = renderComposedMetricTimeSeriesTooltipContent({
                barMetric: defaultProps.barMetric,
                lineMetric: defaultProps.lineMetric,
            })

            expect(renderer({ payload: [] })).toBeNull()
        })

        it('should render configured labels and formatted values', () => {
            const renderer = renderComposedMetricTimeSeriesTooltipContent({
                barMetric: defaultProps.barMetric,
                lineMetric: defaultProps.lineMetric,
            })

            const result = renderer({
                payload: [
                    {
                        dataKey: 'ticketVolume',
                        value: 150,
                        payload: mockData[1],
                    },
                    {
                        dataKey: 'successRate',
                        value: 76,
                        payload: mockData[1],
                    },
                ],
            })

            render(<>{result}</>)

            expect(screen.getByText('2026-04-21')).toBeInTheDocument()
            expect(screen.getByText('Tickets')).toBeInTheDocument()
            expect(screen.getByText('150 tickets')).toBeInTheDocument()
            expect(screen.getByText('Success rate')).toBeInTheDocument()
            expect(screen.getByText('76%')).toBeInTheDocument()
        })

        it('should render markers for the active date', () => {
            const renderer = renderComposedMetricTimeSeriesTooltipContent({
                barMetric: defaultProps.barMetric,
                lineMetric: defaultProps.lineMetric,
                markers: mockMarkers,
            })

            const result = renderer({
                payload: [
                    {
                        dataKey: 'ticketVolume',
                        value: 150,
                        payload: mockData[1],
                    },
                ],
            })

            render(<>{result}</>)

            expect(screen.getByText('Changes published')).toBeInTheDocument()
            expect(screen.getByText('v12 was published')).toBeInTheDocument()
            expect(
                screen.getByRole('link', { name: /View this version/ }),
            ).toHaveAttribute('href', '/app/skills/published-1')
        })

        it('should call a custom tooltip renderer with shaped metric data', () => {
            const renderTooltip = vi.fn(() => <div>Custom tooltip</div>)
            const renderer = renderComposedMetricTimeSeriesTooltipContent({
                barMetric: defaultProps.barMetric,
                lineMetric: defaultProps.lineMetric,
                markers: mockMarkers,
                renderTooltip,
            })

            const result = renderer({
                payload: [
                    {
                        dataKey: 'ticketVolume',
                        value: 150,
                        payload: mockData[1],
                    },
                    {
                        dataKey: 'successRate',
                        value: 76,
                        payload: mockData[1],
                    },
                ],
            })

            render(<>{result}</>)

            expect(screen.getByText('Custom tooltip')).toBeInTheDocument()
            expect(renderTooltip).toHaveBeenCalledWith({
                date: '2026-04-21',
                barMetric: expect.objectContaining({
                    label: 'Tickets',
                    value: 150,
                    formattedValue: '150 tickets',
                }),
                lineMetric: expect.objectContaining({
                    label: 'Success rate',
                    value: 76,
                    formattedValue: '76%',
                }),
                markerColor: expect.any(String),
                markers: mockMarkers,
            })
        })
    })
})
