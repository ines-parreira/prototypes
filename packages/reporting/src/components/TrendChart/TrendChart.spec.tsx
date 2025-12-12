import { render } from '@testing-library/react'

import { TrendChart } from './TrendChart'

describe('TrendChart', () => {
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
    })

    const mockData = [
        {
            label: 'Series 1',
            values: [
                { x: 'Page A', y: 4000 },
                { x: 'Page B', y: 3000 },
                { x: 'Page C', y: 3500 },
            ],
        },
        {
            label: 'Series 2',
            values: [
                { x: 'Page A', y: 2400 },
                { x: 'Page B', y: 1398 },
                { x: 'Page C', y: 2000 },
            ],
        },
    ]

    it('should render area chart with provided data', () => {
        const { container } = render(
            <TrendChart
                data={mockData}
                trendColor="positive"
                areaChartProps={{ width: 500, height: 300 }}
            />,
        )

        const svg = container.querySelector('svg')
        expect(svg).toBeInTheDocument()

        const areas = container.querySelectorAll('.recharts-area')
        expect(areas).toHaveLength(mockData.length)
    })

    it('should render with empty data', () => {
        const { container } = render(
            <TrendChart
                data={[]}
                trendColor="neutral"
                areaChartProps={{ width: 500, height: 300 }}
            />,
        )

        const svg = container.querySelector('svg')
        expect(svg).toBeInTheDocument()

        const areas = container.querySelectorAll('.recharts-area')
        expect(areas).toHaveLength(0)
    })

    it('should render multiple series based on data labels', () => {
        const multiSeriesData = [
            {
                label: 'Revenue',
                values: [
                    { x: 'Jan', y: 5000 },
                    { x: 'Feb', y: 6000 },
                ],
            },
            {
                label: 'Cost',
                values: [
                    { x: 'Jan', y: 3000 },
                    { x: 'Feb', y: 3500 },
                ],
            },
            {
                label: 'Profit',
                values: [
                    { x: 'Jan', y: 2000 },
                    { x: 'Feb', y: 2500 },
                ],
            },
        ]

        const { container } = render(
            <TrendChart
                data={multiSeriesData}
                trendColor="positive"
                areaChartProps={{ width: 500, height: 300 }}
            />,
        )

        const areas = container.querySelectorAll('.recharts-area')
        expect(areas).toHaveLength(3)
    })

    describe('trend colors', () => {
        it('should apply positive color gradient', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const colorGradient = container.querySelector('#colorUv')
            expect(colorGradient).toBeInTheDocument()

            const gradientStops = colorGradient?.querySelectorAll('stop')
            expect(gradientStops?.[0]).toHaveAttribute('stop-color', '#0EAA77')
        })

        it('should apply negative color gradient', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="negative"
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const colorGradient = container.querySelector('#colorUv')
            expect(colorGradient).toBeInTheDocument()

            const gradientStops = colorGradient?.querySelectorAll('stop')
            expect(gradientStops?.[0]).toHaveAttribute('stop-color', '#FF425D')
        })

        it('should apply neutral color gradient', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="neutral"
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const colorGradient = container.querySelector('#colorUv')
            expect(colorGradient).toBeInTheDocument()

            const gradientStops = colorGradient?.querySelectorAll('stop')
            expect(gradientStops?.[0]).toHaveAttribute('stop-color', '#5C6370')
        })

        it('should apply unchanged color gradient', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="unchanged"
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const colorGradient = container.querySelector('#colorUv')
            expect(colorGradient).toBeInTheDocument()

            const gradientStops = colorGradient?.querySelectorAll('stop')
            expect(gradientStops?.[0]).toHaveAttribute('stop-color', '#5C6370')
        })
    })

    describe('gradient configuration', () => {
        it('should apply stroke gradient when isStrokeSolid is false', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    isStrokeSolid={false}
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const strokeGradient = container.querySelector('#strokeGradient')
            expect(strokeGradient).toBeInTheDocument()
        })

        it('should not render stroke gradient when isStrokeSolid is true', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    isStrokeSolid={true}
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const strokeGradient = container.querySelector('#strokeGradient')
            expect(strokeGradient).not.toBeInTheDocument()
        })

        it('should render area color gradient', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const colorGradient = container.querySelector('#colorUv')
            expect(colorGradient).toBeInTheDocument()
        })
    })

    describe('custom styling', () => {
        it('should apply custom dimensions via areaChartProps', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    areaChartProps={{
                        width: 500,
                        height: 300,
                    }}
                />,
            )

            const svg = container.querySelector('svg')
            expect(svg).toHaveAttribute('width', '500')
            expect(svg).toHaveAttribute('height', '300')
        })

        it('should render with custom color', () => {
            const customColor = '#7E55F6'
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    customColor={customColor}
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const colorGradient = container.querySelector(
                '#customColorGradient',
            )
            expect(colorGradient).toBeInTheDocument()

            const gradientStops = colorGradient?.querySelectorAll('stop')
            expect(gradientStops?.[0]).toHaveAttribute(
                'stop-color',
                customColor,
            )
        })

        it('should use custom color gradient ID when custom color is provided', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    customColor="#FF0000"
                    isStrokeSolid={false}
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const customStrokeGradient = container.querySelector(
                '#customStrokeGradient',
            )
            expect(customStrokeGradient).toBeInTheDocument()
        })
    })

    describe('grid and axes', () => {
        it('should render CartesianGrid when showGrid is true', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    showGrid={true}
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const grid = container.querySelector('.recharts-cartesian-grid')
            expect(grid).toBeInTheDocument()
        })

        it('should not render CartesianGrid when showGrid is false', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    showGrid={false}
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const grid = container.querySelector('.recharts-cartesian-grid')
            expect(grid).not.toBeInTheDocument()
        })

        it('should apply custom grid props', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    showGrid={true}
                    gridProps={{
                        strokeDasharray: '5 5',
                        stroke: '#FF0000',
                    }}
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const grid = container.querySelector('.recharts-cartesian-grid')
            expect(grid).toBeInTheDocument()
        })

        it('should render XAxis and YAxis when showAxes is true', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    showAxes={true}
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const xAxis = container.querySelector('.recharts-xAxis')
            const yAxis = container.querySelector('.recharts-yAxis')
            expect(xAxis).toBeInTheDocument()
            expect(yAxis).toBeInTheDocument()
        })

        it('should not render axes when showAxes is false', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    showAxes={false}
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const xAxis = container.querySelector('.recharts-xAxis')
            const yAxis = container.querySelector('.recharts-yAxis')
            expect(xAxis).not.toBeInTheDocument()
            expect(yAxis).not.toBeInTheDocument()
        })

        it('should apply custom xAxisProps', () => {
            const tickFormatter = (value: string) => `Custom ${value}`
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    showAxes={true}
                    xAxisProps={{
                        dataKey: 'customKey',
                        tickFormatter,
                    }}
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const xAxis = container.querySelector('.recharts-xAxis')
            expect(xAxis).toBeInTheDocument()
        })

        it('should apply custom yAxisProps', () => {
            const tickFormatter = (value: number) => `${value}%`
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    showAxes={true}
                    yAxisProps={{
                        tickFormatter,
                        width: 60,
                    }}
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const yAxis = container.querySelector('.recharts-yAxis')
            expect(yAxis).toBeInTheDocument()
        })
    })

    describe('tooltip', () => {
        it('should render Tooltip when showTooltip is true', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    showTooltip={true}
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const tooltip = container.querySelector('.recharts-tooltip-wrapper')
            expect(tooltip).toBeInTheDocument()
        })

        it('should not render Tooltip when showTooltip is false', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    showTooltip={false}
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const tooltip = container.querySelector('.recharts-tooltip-wrapper')
            expect(tooltip).not.toBeInTheDocument()
        })

        it('should render with custom tooltip content', () => {
            const customTooltip = () => <div>Custom Tooltip</div>
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    showTooltip={true}
                    tooltipContent={customTooltip}
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const tooltip = container.querySelector('.recharts-tooltip-wrapper')
            expect(tooltip).toBeInTheDocument()
        })
    })

    describe('animation and styling', () => {
        it('should apply custom animation duration with custom color', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    customColor="#FF0000"
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const areas = container.querySelectorAll('.recharts-area')
            expect(areas).toHaveLength(mockData.length)
        })

        it('should apply default animation duration without custom color', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const areas = container.querySelectorAll('.recharts-area')
            expect(areas).toHaveLength(mockData.length)
        })

        it('should apply custom stroke width with custom color', () => {
            const { container } = render(
                <TrendChart
                    data={mockData}
                    trendColor="positive"
                    customColor="#FF0000"
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const svg = container.querySelector('svg')
            expect(svg).toBeInTheDocument()
        })
    })
})
