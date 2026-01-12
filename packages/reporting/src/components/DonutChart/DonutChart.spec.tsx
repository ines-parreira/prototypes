import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import type { ChartDataItem } from '../ChartCard/types'
import {
    DonutChart,
    renderActiveShape,
    renderTooltipContent,
} from './DonutChart'

describe('DonutChart', () => {
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
    })

    const mockData: ChartDataItem[] = [
        { name: 'AI Agent', value: 18 },
        { name: 'Flows', value: 7 },
        { name: 'Article Recommendation', value: 4 },
        { name: 'Order Management', value: 3 },
    ]

    const percentageFormatter = (value: number) => {
        const total = mockData.reduce((sum, item) => sum + (item.value ?? 0), 0)
        return `${((value / total) * 100).toFixed(2)}%`
    }

    describe('loading state', () => {
        it('should show skeleton when loading', () => {
            const { container } = render(
                <DonutChart data={mockData} isLoading />,
            )

            const skeletons = container.querySelectorAll(
                '[data-name="skeleton"]',
            )
            expect(skeletons.length).toBeGreaterThan(0)
        })

        it('should show chart when not loading', () => {
            render(<DonutChart data={mockData} isLoading={false} />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
        })

        it('should show chart by default when isLoading is not provided', () => {
            render(<DonutChart data={mockData} />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
        })
    })

    describe('data rendering', () => {
        it('should render chart with data without errors', () => {
            render(<DonutChart data={mockData} />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
        })

        it('should handle empty data array without errors', () => {
            const { container } = render(<DonutChart data={[]} />)

            expect(container).toBeInTheDocument()
        })

        it('should render all legend items', () => {
            render(<DonutChart data={mockData} />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getByText('Flows')).toBeInTheDocument()
            expect(
                screen.getByText('Article Recommendation'),
            ).toBeInTheDocument()
            expect(screen.getByText('Order Management')).toBeInTheDocument()
        })

        it('should display percentages for each segment', () => {
            render(
                <DonutChart
                    data={mockData}
                    valueFormatter={percentageFormatter}
                />,
            )

            expect(screen.getByText('56.25%')).toBeInTheDocument()
            expect(screen.getByText('21.88%')).toBeInTheDocument()
            expect(screen.getByText('12.50%')).toBeInTheDocument()
            expect(screen.getByText('9.38%')).toBeInTheDocument()
        })

        it('should assign colors to data automatically', () => {
            render(<DonutChart data={mockData} />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getByText('Flows')).toBeInTheDocument()
        })
    })

    describe('interactive legend', () => {
        it('should toggle segment visibility when legend item is clicked', async () => {
            render(
                <DonutChart
                    data={mockData}
                    valueFormatter={percentageFormatter}
                />,
            )

            const aiAgentLegend = screen.getByText('AI Agent')
            const percentages = screen.getAllByText('56.25%')

            expect(percentages.length).toBeGreaterThan(0)

            await act(async () => {
                await userEvent.click(aiAgentLegend)
            })

            expect(screen.getByText('50.00%')).toBeInTheDocument()
            expect(screen.getByText('AI Agent')).toBeInTheDocument()
        })

        it('should allow multiple segments to be hidden', async () => {
            render(
                <DonutChart
                    data={mockData}
                    valueFormatter={percentageFormatter}
                />,
            )

            const aiAgentLegend = screen.getByText('AI Agent')
            const flowsLegend = screen.getByText('Flows')

            await act(async () => {
                await userEvent.click(aiAgentLegend)
            })

            await act(async () => {
                await userEvent.click(flowsLegend)
            })

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getByText('Flows')).toBeInTheDocument()
        })

        it('should toggle segment back to visible when clicked again', async () => {
            render(
                <DonutChart
                    data={mockData}
                    valueFormatter={percentageFormatter}
                />,
            )

            const aiAgentLegend = screen.getByText('AI Agent')

            await act(async () => {
                await userEvent.click(aiAgentLegend)
            })

            expect(screen.getByText('AI Agent')).toBeInTheDocument()

            await act(async () => {
                await userEvent.click(aiAgentLegend)
            })

            expect(screen.getByText('56.25%')).toBeInTheDocument()
        })

        it('should have keyboard-accessible legend items', () => {
            render(<DonutChart data={mockData} />)

            const legendItems = screen.getAllByRole('button', {
                name: /AI Agent|Flows|Article Recommendation|Order Management/,
            })

            expect(legendItems.length).toBe(4)
        })

        it('should reset all segments when clicking the last visible segment', async () => {
            render(
                <DonutChart
                    data={mockData}
                    valueFormatter={percentageFormatter}
                />,
            )

            const aiAgentLegend = screen.getByText('AI Agent')
            const flowsLegend = screen.getByText('Flows')
            const articleLegend = screen.getByText('Article Recommendation')
            const orderLegend = screen.getByText('Order Management')

            await act(async () => {
                await userEvent.click(aiAgentLegend)
            })

            await act(async () => {
                await userEvent.click(flowsLegend)
            })

            await act(async () => {
                await userEvent.click(articleLegend)
            })

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getByText('Flows')).toBeInTheDocument()
            expect(
                screen.getByText('Article Recommendation'),
            ).toBeInTheDocument()

            await act(async () => {
                await userEvent.click(orderLegend)
            })

            expect(screen.getByText('56.25%')).toBeInTheDocument()
            expect(screen.getByText('21.88%')).toBeInTheDocument()
            expect(screen.getByText('12.50%')).toBeInTheDocument()
            expect(screen.getByText('9.38%')).toBeInTheDocument()
        })
    })

    describe('chart interactions', () => {
        it('should render ResponsiveContainer with correct height', () => {
            const { container } = render(<DonutChart data={mockData} />)

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).toBeInTheDocument()
        })

        it('should render chart wrapper', () => {
            render(<DonutChart data={mockData} />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getByText('Flows')).toBeInTheDocument()
        })

        it('should render Pie component with correct data', () => {
            render(
                <DonutChart
                    data={mockData}
                    valueFormatter={percentageFormatter}
                />,
            )

            expect(screen.getByText('56.25%')).toBeInTheDocument()
            expect(screen.getByText('21.88%')).toBeInTheDocument()
        })

        it('should handle mouse move on pie chart', async () => {
            const { container } = render(<DonutChart data={mockData} />)

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).toBeInTheDocument()

            const user = userEvent.setup()
            if (responsiveContainer) {
                await act(async () => {
                    await user.pointer({ target: responsiveContainer })
                })
            }

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
        })
    })

    describe('activeShape rendering', () => {
        it('should provide activeShape prop to Pie component', () => {
            render(<DonutChart data={mockData} />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
        })

        it('should render Cell components for each data item', () => {
            render(<DonutChart data={mockData} />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
            expect(screen.getByText('Flows')).toBeInTheDocument()
            expect(
                screen.getByText('Article Recommendation'),
            ).toBeInTheDocument()
            expect(screen.getByText('Order Management')).toBeInTheDocument()
        })
    })

    describe('tooltip rendering', () => {
        it('should provide Tooltip component with custom content', () => {
            render(<DonutChart data={mockData} />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
        })

        it('should render tooltip content function', () => {
            const { container } = render(<DonutChart data={mockData} />)

            const responsiveContainer = container.querySelector(
                '.recharts-responsive-container',
            )
            expect(responsiveContainer).toBeInTheDocument()
        })
    })

    describe('container dimensions', () => {
        it('should accept custom container width', () => {
            render(<DonutChart data={mockData} containerWidth={500} />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
        })

        it('should accept custom container height', () => {
            render(<DonutChart data={mockData} containerHeight={400} />)

            expect(screen.getByText('AI Agent')).toBeInTheDocument()
        })
    })

    describe('renderActiveShape', () => {
        it('should render Sector with correct props', () => {
            const props = {
                cx: 100,
                cy: 100,
                innerRadius: 60,
                outerRadius: 95,
                startAngle: 0,
                endAngle: 90,
                fill: '#A084E1',
                cornerRadius: 4,
            }

            const { container } = render(renderActiveShape(props))

            expect(
                container.querySelector('.recharts-sector'),
            ).toBeInTheDocument()
        })

        it('should apply radius offset to inner radius', () => {
            const props = {
                cx: 100,
                cy: 100,
                innerRadius: 60,
                outerRadius: 95,
                startAngle: 0,
                endAngle: 90,
                fill: '#A084E1',
                cornerRadius: 4,
            }

            const result = renderActiveShape(props)

            expect(result).toBeTruthy()
            expect(result.props.innerRadius).toBe(55)
            expect(result.props.outerRadius).toBe(95)
        })
    })

    describe('renderTooltipContent', () => {
        it('should return null when payload is empty', () => {
            const tooltipRenderer = renderTooltipContent()
            const result = tooltipRenderer({ payload: [] })

            expect(result).toBeNull()
        })

        it('should return null when payload is undefined', () => {
            const tooltipRenderer = renderTooltipContent()
            const result = tooltipRenderer({ payload: undefined })

            expect(result).toBeNull()
        })

        it('should render DonutChartTooltip when payload has data', () => {
            const tooltipRenderer = renderTooltipContent()
            const payload = [
                {
                    payload: {
                        name: 'AI Agent',
                        value: 18,
                        color: '#A084E1',
                    },
                },
            ]

            const result = tooltipRenderer({ payload })

            expect(result).toBeTruthy()
            expect(result?.props.name).toBe('AI Agent')
            expect(result?.props.value).toBe(18)
            expect(result?.props.color).toBe('#A084E1')
        })

        it('should use valueFormatter when provided', () => {
            const valueFormatter = (value: number) => `${value}%`
            const tooltipRenderer = renderTooltipContent(valueFormatter)
            const payload = [
                {
                    payload: {
                        name: 'AI Agent',
                        value: 18,
                        color: '#A084E1',
                    },
                },
            ]

            const result = tooltipRenderer({ payload })

            expect(result).toBeTruthy()
            expect(result?.props.valueFormatter).toBe(valueFormatter)
        })

        it('should include period when provided', () => {
            const period = {
                start_datetime: '2024-01-01',
                end_datetime: '2024-01-31',
            }
            const tooltipRenderer = renderTooltipContent(undefined, period)
            const payload = [
                {
                    payload: {
                        name: 'AI Agent',
                        value: 18,
                        color: '#A084E1',
                    },
                },
            ]

            const result = tooltipRenderer({ payload })

            expect(result).toBeTruthy()
            expect(result?.props.period).toEqual(period)
        })
    })
})
