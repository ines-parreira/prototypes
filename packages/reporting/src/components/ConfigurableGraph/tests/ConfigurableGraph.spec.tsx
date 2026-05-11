import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { ConfigurableGraph } from '../ConfigurableGraph'
import type { ConfigurableGraphMetricConfig } from '../types'

vi.mock('../components/ConfigurableGraphContent', () => ({
    ConfigurableGraphContent: () => <div>ChartContent</div>,
}))

// axiom Select renders both visual popup items and a hidden native <select>,
// so we target the visual element by excluding the native <option>.
const getVisualItem = (text: string) => {
    const elements = screen.getAllByText(text)
    return elements.find((el) => el.tagName !== 'OPTION')!
}

describe('ConfigurableChart', () => {
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        }

        Element.prototype.getAnimations = function () {
            return []
        }
    })

    const featureGrouping = {
        id: 'by_feature',
        name: 'Feature',
        configurableGraphType: 'donut' as const,
        useChartData: () => ({
            data: [{ name: 'Support', value: 10 }],
            isLoading: false,
        }),
    }

    const channelGrouping = {
        id: 'by_channel',
        name: 'Channel',
        configurableGraphType: 'bar' as const,
        useChartData: () => ({
            data: [{ name: 'Email', value: 5 }],
            isLoading: false,
        }),
    }

    describe('rendering', () => {
        it('renders the initial metric title', () => {
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping],
                },
            ]

            render(<ConfigurableGraph metrics={metrics} />)

            expect(screen.getByText('Automation Rate')).toBeInTheDocument()
        })

        it('shows a metric selector button when multiple metrics are provided', () => {
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping],
                },
                {
                    measure: 'resolution_time',
                    name: 'Resolution Time',
                    metricFormat: 'duration',
                    dimensions: [channelGrouping],
                },
            ]

            render(<ConfigurableGraph metrics={metrics} />)

            expect(
                screen.getByRole('button', { name: /Automation Rate/i }),
            ).toBeInTheDocument()
        })
    })

    describe('trend data', () => {
        it('renders trend value when useTrendData provides data', () => {
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping],
                    useTrendData: () => ({
                        isFetching: false,
                        isError: false,
                        data: { value: 0.42, prevValue: 0.35 },
                    }),
                },
            ]

            render(<ConfigurableGraph metrics={metrics} />)

            expect(screen.getByText('42%')).toBeInTheDocument()
        })

        it('does not render a trend value when useTrendData is not provided', () => {
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping],
                },
            ]

            render(<ConfigurableGraph metrics={metrics} />)

            expect(screen.queryByText('%')).not.toBeInTheDocument()
        })

        it('renders chart content instead of NoDataPlaceholder when useTrendData is not provided', () => {
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping],
                },
            ]

            render(<ConfigurableGraph metrics={metrics} />)

            expect(screen.getByText('ChartContent')).toBeInTheDocument()
            expect(screen.queryByText('No data found')).not.toBeInTheDocument()
        })

        it('does not render a trend badge when useTrendData is not provided', () => {
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping],
                },
            ]

            const { container } = render(
                <ConfigurableGraph metrics={metrics} />,
            )

            const icons = container.querySelectorAll('svg')
            const hasTrendIcon = Array.from(icons).some((icon) =>
                icon.getAttribute('aria-label')?.includes('trending'),
            )
            expect(hasTrendIcon).toBe(false)
        })

        it('renders NoDataPlaceholder when useTrendData is provided but value is absent', () => {
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping],
                    useTrendData: () => ({
                        isFetching: false,
                        isError: false,
                        data: undefined,
                    }),
                },
            ]

            render(<ConfigurableGraph metrics={metrics} />)

            expect(screen.getByText('No data found')).toBeInTheDocument()
        })
    })

    describe('MetricGroupingSelect visibility', () => {
        it('does not show grouping selector when there is a single grouping', () => {
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping],
                },
            ]

            render(<ConfigurableGraph metrics={metrics} />)

            expect(
                screen.queryByRole('button', { name: /Feature/i }),
            ).not.toBeInTheDocument()
        })

        it('shows grouping selector when there are multiple groupings', () => {
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping, channelGrouping],
                },
            ]

            render(<ConfigurableGraph metrics={metrics} />)

            expect(
                screen.getByRole('button', { name: /Feature/i }),
            ).toBeInTheDocument()
        })
    })

    describe('ActionMenu visibility', () => {
        it('shows ChartTypeToggle when the active grouping is donut-or-bar', () => {
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping],
                },
            ]

            render(<ConfigurableGraph metrics={metrics} actionMenu={'hello'} />)

            expect(screen.getByText('hello')).toBeInTheDocument()
        })
    })

    describe('initial selection', () => {
        it('uses the first metric and first dimension by default', () => {
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping, channelGrouping],
                },
                {
                    measure: 'resolution_time',
                    name: 'Resolution Time',
                    metricFormat: 'duration',
                    dimensions: [channelGrouping],
                },
            ]

            render(<ConfigurableGraph metrics={metrics} />)

            expect(
                screen.getByRole('button', { name: /Automation Rate/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Feature/i }),
            ).toBeInTheDocument()
        })

        it('renders the metric matching initialMeasure as the selected metric', () => {
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping],
                },
                {
                    measure: 'resolution_time',
                    name: 'Resolution Time',
                    metricFormat: 'duration',
                    dimensions: [channelGrouping],
                },
            ]

            render(
                <ConfigurableGraph
                    metrics={metrics}
                    initialMeasure="resolution_time"
                />,
            )

            expect(
                screen.getByRole('button', { name: /Resolution Time/i }),
            ).toBeInTheDocument()
        })

        it('renders the grouping matching initialDimension as the selected grouping', () => {
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping, channelGrouping],
                },
            ]

            render(
                <ConfigurableGraph
                    metrics={metrics}
                    initialDimension="by_channel"
                />,
            )

            expect(
                screen.getByRole('button', { name: /Channel/i }),
            ).toBeInTheDocument()
        })

        it('restores both measure and dimension from saved selection', () => {
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping, channelGrouping],
                },
                {
                    measure: 'resolution_time',
                    name: 'Resolution Time',
                    metricFormat: 'duration',
                    dimensions: [featureGrouping, channelGrouping],
                },
            ]

            render(
                <ConfigurableGraph
                    metrics={metrics}
                    initialMeasure="resolution_time"
                    initialDimension="by_channel"
                />,
            )

            expect(
                screen.getByRole('button', { name: /Resolution Time/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Channel/i }),
            ).toBeInTheDocument()
        })

        it('falls back to the first metric when initialMeasure does not match any metric', () => {
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping],
                },
                {
                    measure: 'resolution_time',
                    name: 'Resolution Time',
                    metricFormat: 'duration',
                    dimensions: [channelGrouping],
                },
            ]

            render(
                <ConfigurableGraph
                    metrics={metrics}
                    initialMeasure="stale_measure_that_no_longer_exists"
                />,
            )

            expect(
                screen.getByRole('button', { name: /Automation Rate/i }),
            ).toBeInTheDocument()
        })

        it('falls back to the first dimension when initialDimension does not match any grouping', () => {
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping, channelGrouping],
                },
            ]

            render(
                <ConfigurableGraph
                    metrics={metrics}
                    initialDimension="stale_dimension_that_no_longer_exists"
                />,
            )

            expect(
                screen.getByRole('button', { name: /Feature/i }),
            ).toBeInTheDocument()
        })
    })

    describe('grouping selection', () => {
        it('calls onSelect with the new grouping when grouping changes', async () => {
            const user = userEvent.setup()
            const onSelect = vi.fn()
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping, channelGrouping],
                },
            ]

            render(<ConfigurableGraph metrics={metrics} onSelect={onSelect} />)

            await user.click(screen.getByRole('button', { name: /Feature/i }))
            await user.click(getVisualItem('Channel'))

            expect(onSelect).toHaveBeenCalledWith({
                measure: 'automation_rate',
                dimension: 'by_channel',
            })
        })
    })

    describe('metric selection', () => {
        it('calls onSelect with the first grouping of the new metric when metric changes', async () => {
            const user = userEvent.setup()
            const onSelect = vi.fn()
            const metrics: ConfigurableGraphMetricConfig[] = [
                {
                    measure: 'automation_rate',
                    name: 'Automation Rate',
                    metricFormat: 'decimal-to-percent',
                    dimensions: [featureGrouping],
                },
                {
                    measure: 'resolution_time',
                    name: 'Resolution Time',
                    metricFormat: 'duration',
                    dimensions: [channelGrouping],
                },
            ]

            render(<ConfigurableGraph metrics={metrics} onSelect={onSelect} />)

            await user.click(
                screen.getByRole('button', { name: /Automation Rate/i }),
            )
            await user.click(getVisualItem('Resolution Time'))

            expect(onSelect).toHaveBeenCalledWith({
                measure: 'resolution_time',
                dimension: 'by_channel',
            })
        })
    })
})
