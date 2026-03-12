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
        chartType: 'donut' as const,
        useChartData: () => ({
            data: [{ name: 'Support', value: 10 }],
            isLoading: false,
        }),
    }

    const channelGrouping = {
        id: 'by_channel',
        name: 'Channel',
        chartType: 'bar' as const,
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
