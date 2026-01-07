import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ChartHeader } from './ChartHeader'

describe('ChartHeader', () => {
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
    })

    describe('basic rendering', () => {
        it('should render with title only', () => {
            render(<ChartHeader title="Test Chart" />)

            expect(screen.getByText('Test Chart')).toBeInTheDocument()
        })

        it('should render with title and numeric value', () => {
            render(<ChartHeader title="Automation Rate" value={0.42} />)

            expect(screen.getByText('Automation Rate')).toBeInTheDocument()
            expect(screen.getByText('0.42')).toBeInTheDocument()
        })

        it('should render with title and string value', () => {
            render(<ChartHeader title="Total Tickets" value={1234} />)

            expect(screen.getByText('Total Tickets')).toBeInTheDocument()
            expect(screen.getByText('1,234')).toBeInTheDocument()
        })

        it('should render placeholder when value is undefined', () => {
            const { container } = render(<ChartHeader title="Test Chart" />)

            const headings = container.querySelectorAll(
                'h1, h2, h3, h4, h5, h6',
            )
            expect(headings.length).toBe(1)
            expect(headings[0].textContent).toBe('-')
        })
    })

    describe('metrics dropdown', () => {
        const mockMetrics = [
            { id: '1', label: 'Metric 1' },
            { id: '2', label: 'Metric 2' },
            { id: '3', label: 'Metric 3' },
        ]

        it('should show metrics dropdown when multiple metrics provided', () => {
            const mockOnMetricChange = vi.fn()

            render(
                <ChartHeader
                    title="Metric 1"
                    metrics={mockMetrics}
                    onMetricChange={mockOnMetricChange}
                />,
            )

            const selectButton = screen.getByRole('button', {
                name: /metric 1/i,
            })
            expect(selectButton).toBeInTheDocument()
        })

        it('should not show metrics dropdown when only one metric provided', () => {
            const mockOnMetricChange = vi.fn()

            render(
                <ChartHeader
                    title="Single Metric"
                    metrics={[{ id: '1', label: 'Single Metric' }]}
                    onMetricChange={mockOnMetricChange}
                />,
            )

            expect(
                screen.queryByRole('button', { name: /single metric/i }),
            ).not.toBeInTheDocument()
            expect(screen.getByText('Single Metric')).toBeInTheDocument()
        })

        it('should not show metrics dropdown when metrics is empty', () => {
            const mockOnMetricChange = vi.fn()

            render(
                <ChartHeader
                    title="Test Chart"
                    metrics={[]}
                    onMetricChange={mockOnMetricChange}
                />,
            )

            expect(screen.getByText('Test Chart')).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /test chart/i }),
            ).not.toBeInTheDocument()
        })

        it('should not show metrics dropdown when onMetricChange is not provided', () => {
            render(<ChartHeader title="Test Chart" metrics={mockMetrics} />)

            expect(screen.getByText('Test Chart')).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /test chart/i }),
            ).not.toBeInTheDocument()
        })

        it('should render regular title when metrics is undefined', () => {
            render(<ChartHeader title="Test Chart" />)

            expect(screen.getByText('Test Chart')).toBeInTheDocument()
        })
    })

    describe('trend badge', () => {
        it('should render trend badge when value and prevValue are provided', () => {
            render(
                <ChartHeader
                    title="Automation Rate"
                    value={0.42}
                    prevValue={0.4}
                />,
            )

            expect(screen.getByText('Automation Rate')).toBeInTheDocument()
            expect(screen.getByText('0.42')).toBeInTheDocument()
        })

        it('should not render trend badge when prevValue is undefined', () => {
            render(<ChartHeader title="Automation Rate" value={0.42} />)

            expect(screen.getByText('0.42')).toBeInTheDocument()
        })

        it('should not render trend badge when value is undefined', () => {
            render(<ChartHeader title="Automation Rate" prevValue={0.4} />)

            expect(screen.getByText('Automation Rate')).toBeInTheDocument()
        })

        it('should pass metricFormat to TrendBadge', () => {
            render(
                <ChartHeader
                    title="Automation Rate"
                    value={0.42}
                    prevValue={0.4}
                    metricFormat="decimal-to-percent"
                />,
            )

            expect(screen.getByText('Automation Rate')).toBeInTheDocument()
        })

        it('should pass currency to TrendBadge', () => {
            render(
                <ChartHeader
                    title="Revenue"
                    value={1000}
                    prevValue={900}
                    metricFormat="currency"
                    currency="USD"
                />,
            )

            expect(screen.getByText('Revenue')).toBeInTheDocument()
        })

        it('should pass interpretAs to TrendBadge', () => {
            render(
                <ChartHeader
                    title="Response Time"
                    value={50}
                    prevValue={60}
                    interpretAs="less-is-better"
                />,
            )

            expect(screen.getByText('Response Time')).toBeInTheDocument()
        })

        it('should default interpretAs to neutral', () => {
            render(
                <ChartHeader title="Test Metric" value={100} prevValue={100} />,
            )

            expect(screen.getByText('Test Metric')).toBeInTheDocument()
        })

        it('should pass tooltipData to TrendBadge', () => {
            render(
                <ChartHeader
                    title="Test Metric"
                    value={100}
                    prevValue={90}
                    tooltipData={{ period: 'Jan 1 - Jan 31' }}
                />,
            )

            expect(screen.getByText('Test Metric')).toBeInTheDocument()
        })

        it('should convert string value to number for TrendBadge', () => {
            render(
                <ChartHeader title="Test Metric" value={150} prevValue={100} />,
            )

            expect(screen.getByText('Test Metric')).toBeInTheDocument()
        })
    })

    describe('chart controls', () => {
        it('should render chart controls when provided with data', () => {
            const controls = <button>Toggle Chart</button>

            render(
                <ChartHeader
                    title="Test Chart"
                    value={100}
                    chartControls={controls}
                />,
            )

            expect(screen.getByText('Toggle Chart')).toBeInTheDocument()
        })

        it('should not render chart controls when not provided', () => {
            render(<ChartHeader title="Test Chart" value={100} />)

            expect(
                screen.queryByRole('button', { name: /toggle/i }),
            ).not.toBeInTheDocument()
        })

        it('should not render chart controls when no data', () => {
            const controls = <button>Toggle Chart</button>

            render(<ChartHeader title="Test Chart" chartControls={controls} />)

            expect(screen.queryByText('Toggle Chart')).not.toBeInTheDocument()
        })

        it('should render multiple chart controls', () => {
            const controls = (
                <>
                    <button>Control 1</button>
                    <button>Control 2</button>
                </>
            )

            render(
                <ChartHeader
                    title="Test Chart"
                    value={100}
                    chartControls={controls}
                />,
            )

            expect(screen.getByText('Control 1')).toBeInTheDocument()
            expect(screen.getByText('Control 2')).toBeInTheDocument()
        })
    })

    describe('value formatting', () => {
        it('should format decimal-to-percent', () => {
            render(
                <ChartHeader
                    title="Rate"
                    value={0.42}
                    metricFormat="decimal-to-percent"
                />,
            )

            expect(screen.getByText('42%')).toBeInTheDocument()
        })

        it('should format decimal', () => {
            render(
                <ChartHeader
                    title="Score"
                    value={123.456}
                    metricFormat="decimal"
                />,
            )

            expect(screen.getByText('123.46')).toBeInTheDocument()
        })

        it('should format currency', () => {
            render(
                <ChartHeader
                    title="Revenue"
                    value={1234.56}
                    metricFormat="currency"
                    currency="USD"
                />,
            )

            expect(screen.getByText('$1,234.56')).toBeInTheDocument()
        })

        it('should handle string values without formatting', () => {
            render(<ChartHeader title="Count" value={1234} />)

            expect(screen.getByText('1,234')).toBeInTheDocument()
        })

        it('should handle zero value', () => {
            render(<ChartHeader title="Count" value={0} />)

            expect(screen.getByText('0')).toBeInTheDocument()
        })
    })

    describe('combined props', () => {
        it('should render with all props together', () => {
            const mockOnMetricChange = vi.fn()
            const mockMetrics = [
                { id: '1', label: 'Metric 1' },
                { id: '2', label: 'Metric 2' },
            ]
            const controls = <button>Export</button>

            render(
                <ChartHeader
                    title="Metric 1"
                    value={0.42}
                    prevValue={0.4}
                    metrics={mockMetrics}
                    metricFormat="decimal-to-percent"
                    currency="USD"
                    interpretAs="more-is-better"
                    onMetricChange={mockOnMetricChange}
                    chartControls={controls}
                    tooltipData={{ period: 'Last 7 days' }}
                />,
            )

            expect(
                screen.getByRole('button', { name: /metric 1/i }),
            ).toBeInTheDocument()
            expect(screen.getByText('42%')).toBeInTheDocument()
            expect(screen.getByText('Export')).toBeInTheDocument()
        })

        it('should render with minimal props', () => {
            render(<ChartHeader title="Simple Chart" />)

            expect(screen.getByText('Simple Chart')).toBeInTheDocument()
        })

        it('should render with value but no formatting', () => {
            render(<ChartHeader title="Raw Value" value={42} />)

            expect(screen.getByText('42')).toBeInTheDocument()
        })

        it('should render with metrics and controls', () => {
            const mockOnMetricChange = vi.fn()
            const mockMetrics = [
                { id: '1', label: 'Metric 1' },
                { id: '2', label: 'Metric 2' },
            ]
            const controls = <button>Settings</button>

            render(
                <ChartHeader
                    title="Metric 1"
                    value={100}
                    metrics={mockMetrics}
                    onMetricChange={mockOnMetricChange}
                    chartControls={controls}
                />,
            )

            expect(
                screen.getByRole('button', { name: /metric 1/i }),
            ).toBeInTheDocument()
            expect(screen.getByText('Settings')).toBeInTheDocument()
        })
    })

    describe('edge cases', () => {
        it('should handle negative values', () => {
            render(<ChartHeader title="Loss" value={-100} />)

            expect(screen.getByText('-100')).toBeInTheDocument()
        })

        it('should handle very large values', () => {
            render(<ChartHeader title="Large Number" value={1000000} />)

            expect(screen.getByText('1,000,000')).toBeInTheDocument()
        })

        it('should handle value of 0 with prevValue', () => {
            render(<ChartHeader title="Metric" value={0} prevValue={100} />)

            expect(screen.getByText('0')).toBeInTheDocument()
        })

        it('should handle prevValue of 0', () => {
            render(<ChartHeader title="Metric" value={100} prevValue={0} />)

            expect(screen.getByText('100')).toBeInTheDocument()
        })
    })

    describe('loading state', () => {
        it('should render skeleton when isLoading is true', () => {
            const { container } = render(
                <ChartHeader title="Test Chart" isLoading={true} />,
            )

            const skeletons = container.querySelectorAll('[class*="skeleton"]')
            expect(skeletons.length).toBeGreaterThan(0)
        })

        it('should render skeleton with percentage sign when loading', () => {
            render(<ChartHeader title="Test Chart" isLoading={true} />)

            expect(screen.getByText('%')).toBeInTheDocument()
        })

        it('should not render value when loading', () => {
            const { container } = render(
                <ChartHeader title="Test Chart" value={42} isLoading={true} />,
            )

            expect(screen.queryByText('42')).not.toBeInTheDocument()
            const headings = container.querySelectorAll(
                'h1, h2, h3, h4, h5, h6',
            )
            expect(headings.length).toBe(0)
        })

        it('should not render trend badge when loading', () => {
            render(
                <ChartHeader
                    title="Test Chart"
                    value={42}
                    prevValue={40}
                    isLoading={true}
                />,
            )

            expect(screen.queryByText('42')).not.toBeInTheDocument()
        })

        it('should render value when isLoading is false', () => {
            render(
                <ChartHeader title="Test Chart" value={42} isLoading={false} />,
            )

            expect(screen.getByText('42')).toBeInTheDocument()
        })
    })
})
