import { render } from '@testing-library/react'

import { AreaChart } from './AreaChart'

describe('AreaChart', () => {
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
            <AreaChart
                data={mockData}
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
            <AreaChart
                data={[]}
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
            <AreaChart
                data={multiSeriesData}
                areaChartProps={{ width: 500, height: 300 }}
            />,
        )

        const areas = container.querySelectorAll('.recharts-area')
        expect(areas).toHaveLength(3)
    })

    describe('gradient configuration', () => {
        it('should apply stroke gradient when isStrokeSolid is false', () => {
            const { container } = render(
                <AreaChart
                    data={mockData}
                    isStrokeSolid={false}
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const strokeGradient = container.querySelector('#strokeGradient')
            expect(strokeGradient).toBeInTheDocument()
        })

        it('should not render stroke gradient when isStrokeSolid is true', () => {
            const { container } = render(
                <AreaChart
                    data={mockData}
                    isStrokeSolid={true}
                    areaChartProps={{ width: 500, height: 300 }}
                />,
            )

            const strokeGradient = container.querySelector('#strokeGradient')
            expect(strokeGradient).not.toBeInTheDocument()
        })

        it('should render area color gradient', () => {
            const { container } = render(
                <AreaChart
                    data={mockData}
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
                <AreaChart
                    data={mockData}
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
    })
})
