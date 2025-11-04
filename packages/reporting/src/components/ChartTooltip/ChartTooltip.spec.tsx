import { render, screen } from '@testing-library/react'

import { ChartTooltip } from './ChartTooltip'

describe('CustomTooltip', () => {
    const mockPayload = [
        {
            color: '#8884d8',
            dataKey: 'value1',
            name: 'Series 1',
            value: 100,
        },
        {
            color: '#82ca9d',
            dataKey: 'value2',
            name: 'Series 2',
            value: 200,
        },
    ]
    const mockCoordinate = { x: 100, y: 50 }

    describe('visibility', () => {
        it('should be hidden when not active', () => {
            const { container } = render(
                <ChartTooltip
                    active={false}
                    payload={mockPayload}
                    label="2024-01"
                    coordinate={mockCoordinate}
                    accessibilityLayer={false}
                />,
            )

            const tooltip = container.querySelector('div')
            expect(tooltip).toHaveStyle({ visibility: 'hidden' })
        })

        it('should be hidden when payload is empty', () => {
            const { container } = render(
                <ChartTooltip
                    active
                    payload={[]}
                    label="2024-01"
                    coordinate={mockCoordinate}
                    accessibilityLayer={false}
                />,
            )

            const tooltip = container.querySelector('div')
            expect(tooltip).toHaveStyle({ visibility: 'hidden' })
        })

        it('should be hidden when payload is undefined', () => {
            const { container } = render(
                <ChartTooltip
                    active
                    payload={[]}
                    label="2024-01"
                    coordinate={mockCoordinate}
                    accessibilityLayer={false}
                />,
            )

            const tooltip = container.querySelector('div')
            expect(tooltip).toHaveStyle({ visibility: 'hidden' })
        })

        it('should be visible when active and payload has data', () => {
            const { container } = render(
                <ChartTooltip
                    active
                    payload={mockPayload}
                    label="2024-01"
                    coordinate={mockCoordinate}
                    accessibilityLayer={false}
                />,
            )

            const tooltip = container.querySelector('div')
            expect(tooltip).toHaveStyle({ visibility: 'visible' })
        })
    })

    describe('content rendering', () => {
        it('should render label', () => {
            render(
                <ChartTooltip
                    active
                    payload={mockPayload}
                    label="2024-01"
                    coordinate={mockCoordinate}
                    accessibilityLayer={false}
                />,
            )

            expect(screen.getByText('2024-01')).toBeInTheDocument()
        })

        it('should render all payload entries', () => {
            render(
                <ChartTooltip
                    active
                    payload={mockPayload}
                    label="2024-01"
                    coordinate={mockCoordinate}
                    accessibilityLayer={false}
                />,
            )

            expect(screen.getByText('Series 1')).toBeInTheDocument()
            expect(screen.getByText('100')).toBeInTheDocument()
            expect(screen.getByText('Series 2')).toBeInTheDocument()
            expect(screen.getByText('200')).toBeInTheDocument()
        })

        it('should render with color indicators', () => {
            const { container } = render(
                <ChartTooltip
                    active
                    payload={mockPayload}
                    label="2024-01"
                    coordinate={mockCoordinate}
                    accessibilityLayer={false}
                />,
            )

            const dots = container.querySelectorAll(
                'div[style*="background-color"]',
            )
            expect(dots.length).toBeGreaterThanOrEqual(2)
            expect(dots[0]).toHaveStyle({ backgroundColor: '#8884d8' })
            expect(dots[1]).toHaveStyle({ backgroundColor: '#82ca9d' })
        })
    })

    describe('formatter', () => {
        it('should format value when formatter returns a string', () => {
            const formatter = (value: string | number) => `${value}$`

            render(
                <ChartTooltip
                    active
                    payload={mockPayload}
                    label="2024-01"
                    formatter={formatter}
                    coordinate={mockCoordinate}
                    accessibilityLayer={false}
                />,
            )

            expect(screen.getByText('100$')).toBeInTheDocument()
            expect(screen.getByText('200$')).toBeInTheDocument()
            expect(screen.getByText('Series 1')).toBeInTheDocument()
            expect(screen.getByText('Series 2')).toBeInTheDocument()
        })

        it('should format both value and name when formatter returns an array', () => {
            const formatter = (value: string | number, name: string) => [
                `${value}$`,
                `${name}🎉️`,
            ]

            render(
                <ChartTooltip
                    active
                    payload={mockPayload}
                    label="2024-01"
                    formatter={formatter}
                    coordinate={mockCoordinate}
                    accessibilityLayer={false}
                />,
            )

            expect(screen.getByText('100$')).toBeInTheDocument()
            expect(screen.getByText('200$')).toBeInTheDocument()
            expect(screen.getByText('Series 1🎉️')).toBeInTheDocument()
            expect(screen.getByText('Series 2🎉️')).toBeInTheDocument()
        })

        it('should skip entry when formatter returns null', () => {
            const formatter = (value: string | number, name: string) =>
                name === 'Series 1' ? null : value

            render(
                <ChartTooltip
                    active
                    payload={mockPayload}
                    label="2024-01"
                    formatter={formatter}
                    coordinate={mockCoordinate}
                    accessibilityLayer={false}
                />,
            )

            expect(screen.queryByText('Series 1')).not.toBeInTheDocument()
            expect(screen.queryByText('100')).not.toBeInTheDocument()
            expect(screen.getByText('Series 2')).toBeInTheDocument()
            expect(screen.getByText('200')).toBeInTheDocument()
        })

        it('should use original values when no formatter is provided', () => {
            render(
                <ChartTooltip
                    active
                    payload={mockPayload}
                    label="2024-01"
                    coordinate={mockCoordinate}
                    accessibilityLayer={false}
                />,
            )

            expect(screen.getByText('100')).toBeInTheDocument()
            expect(screen.getByText('200')).toBeInTheDocument()
            expect(screen.getByText('Series 1')).toBeInTheDocument()
            expect(screen.getByText('Series 2')).toBeInTheDocument()
        })
    })
})
