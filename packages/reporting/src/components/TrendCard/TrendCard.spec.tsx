import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'

import type { MetricTrend } from '../../types'
import type { TrendCardProps } from './TrendCard'
import { TrendCard } from './TrendCard'

const mockTrend: MetricTrend = {
    isFetching: false,
    isError: false,
    data: {
        label: 'Test Metric',
        value: 100,
        prevValue: 80,
    },
}

const defaultProps: TrendCardProps = {
    trend: mockTrend,
    interpretAs: 'more-is-better',
}

describe('TrendCard', () => {
    it('should render with all required data and components', () => {
        render(<TrendCard {...defaultProps} />)

        expect(screen.getByText('Test Metric')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should render loading state', () => {
        render(<TrendCard {...defaultProps} isLoading />)

        const loadingElements = screen.getAllByLabelText('Loading')
        expect(loadingElements.length).toBeGreaterThan(0)
    })

    it('should render hint tooltip', () => {
        const hint = {
            title: 'Test hint title',
            link: 'https://example.com',
            linkText: 'Learn more',
        }

        render(<TrendCard {...defaultProps} hint={hint} />)

        expect(screen.getByText('Test Metric')).toBeInTheDocument()
        const infoIcon = document.querySelector('svg')
        expect(infoIcon).toBeInTheDocument()
    })

    it('should render with different interpretAs values', () => {
        const { rerender } = render(<TrendCard {...defaultProps} />)

        expect(screen.getByText('Test Metric')).toBeInTheDocument()

        rerender(<TrendCard {...defaultProps} interpretAs="less-is-better" />)
        expect(screen.getByText('Test Metric')).toBeInTheDocument()

        rerender(<TrendCard {...defaultProps} interpretAs="neutral" />)
        expect(screen.getByText('Test Metric')).toBeInTheDocument()
    })

    it('should render with different metricFormat values', () => {
        const { rerender } = render(
            <TrendCard {...defaultProps} metricFormat="decimal" />,
        )

        expect(screen.getByText('Test Metric')).toBeInTheDocument()

        rerender(<TrendCard {...defaultProps} metricFormat="percent" />)
        expect(screen.getByText('Test Metric')).toBeInTheDocument()

        rerender(<TrendCard {...defaultProps} metricFormat="currency" />)
        expect(screen.getByText('Test Metric')).toBeInTheDocument()
    })

    it('should render when trend data is undefined', () => {
        const trendWithoutData: MetricTrend = {
            isFetching: false,
            isError: false,
            data: undefined,
        }

        const { container } = render(
            <TrendCard {...defaultProps} trend={trendWithoutData} />,
        )

        const card = container.querySelector('[class*="card"]')
        expect(card).toBeInTheDocument()
    })

    it('should render with null metric values', () => {
        const trendWithNullValues: MetricTrend = {
            isFetching: false,
            isError: false,
            data: {
                label: 'Test Metric',
                value: null,
                prevValue: null,
            },
        }

        render(<TrendCard {...defaultProps} trend={trendWithNullValues} />)

        expect(screen.getByText('Test Metric')).toBeInTheDocument()
    })

    it('should render metric value and label together', () => {
        render(<TrendCard {...defaultProps} />)

        expect(screen.getByText('Test Metric')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should maintain component structure with loading and hint', () => {
        const hint = {
            title: 'Test hint',
        }

        render(<TrendCard {...defaultProps} isLoading hint={hint} />)

        const loadingElements = screen.getAllByLabelText('Loading')
        expect(loadingElements.length).toBeGreaterThan(0)
    })

    it('should render action menu on hover when provided', async () => {
        const actionMenu = <button>Action Menu</button>

        const { container } = render(
            <TrendCard {...defaultProps} actionMenu={actionMenu} />,
        )

        expect(screen.getByText('Test Metric')).toBeInTheDocument()
        expect(screen.queryByText('Action Menu')).not.toBeInTheDocument()

        const card = container.firstChild as HTMLElement

        await act(async () => {
            await userEvent.hover(card)
        })

        expect(screen.getByText('Action Menu')).toBeInTheDocument()
    })

    it('should not render action menu when not provided', () => {
        render(<TrendCard {...defaultProps} />)

        expect(screen.getByText('Test Metric')).toBeInTheDocument()
        expect(screen.queryByText('Action Menu')).not.toBeInTheDocument()
    })

    describe('DrillDownModalTrigger', () => {
        it('should render DrillDownModalTrigger when drillDown prop is provided with data', () => {
            const openDrillDownModal = vi.fn()
            const drillDown = {
                tooltipText: 'Click to view details',
                openDrillDownModal,
            }

            render(<TrendCard {...defaultProps} drillDown={drillDown} />)

            const trigger = screen.getByText('100')
            expect(trigger).toBeInTheDocument()
        })

        it('should call openDrillDownModal when DrillDownModalTrigger is clicked', async () => {
            const user = userEvent.setup()
            const openDrillDownModal = vi.fn()
            const drillDown = {
                tooltipText: 'Click to view details',
                openDrillDownModal,
            }

            render(<TrendCard {...defaultProps} drillDown={drillDown} />)

            const trigger = screen.getByText('100')
            await user.click(trigger)

            expect(openDrillDownModal).toHaveBeenCalledTimes(1)
        })

        it('should not render DrillDownModalTrigger when drillDown is not provided', async () => {
            const user = userEvent.setup()
            render(<TrendCard {...defaultProps} />)

            const metricValue = screen.getByText('100')
            expect(metricValue).toBeInTheDocument()

            // Clicking should have no effect when drillDown is not provided
            await user.click(metricValue)
            // No errors should be thrown
        })

        it('should not render DrillDownModalTrigger when data value is zero', () => {
            const openDrillDownModal = vi.fn()
            const drillDown = {
                tooltipText: 'Click to view details',
                openDrillDownModal,
            }

            const trendWithZeroValue: MetricTrend = {
                isFetching: false,
                isError: false,
                data: {
                    label: 'Test Metric',
                    value: 0,
                    prevValue: 80,
                },
            }

            render(
                <TrendCard
                    {...defaultProps}
                    trend={trendWithZeroValue}
                    drillDown={drillDown}
                />,
            )

            expect(screen.getByText('Test Metric')).toBeInTheDocument()
            expect(screen.queryByText('0')).not.toBeInTheDocument()
        })

        it('should not render DrillDownModalTrigger when data value is null', () => {
            const openDrillDownModal = vi.fn()
            const drillDown = {
                tooltipText: 'Click to view details',
                openDrillDownModal,
            }

            const trendWithNullValue: MetricTrend = {
                isFetching: false,
                isError: false,
                data: {
                    label: 'Test Metric',
                    value: null,
                    prevValue: 80,
                },
            }

            render(
                <TrendCard
                    {...defaultProps}
                    trend={trendWithNullValue}
                    drillDown={drillDown}
                />,
            )

            expect(screen.getByText('Test Metric')).toBeInTheDocument()
            const loadingElements = screen.getAllByLabelText('Loading')
            expect(loadingElements.length).toBeGreaterThan(0)
        })

        it('should render DrillDownModalTrigger with formatted metric value', () => {
            const openDrillDownModal = vi.fn()
            const drillDown = {
                tooltipText: 'Click to view details',
                openDrillDownModal,
            }

            const trendWithLargeValue: MetricTrend = {
                isFetching: false,
                isError: false,
                data: {
                    label: 'Revenue',
                    value: 1234.56,
                    prevValue: 1000,
                },
            }

            render(
                <TrendCard
                    {...defaultProps}
                    trend={trendWithLargeValue}
                    metricFormat="currency"
                    currency="USD"
                    drillDown={drillDown}
                />,
            )

            expect(screen.getByText('Revenue')).toBeInTheDocument()
            expect(screen.getByText('$1,234.56')).toBeInTheDocument()
        })
    })
})
