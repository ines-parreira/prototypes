import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as Recharts from 'recharts'

vi.mock('recharts', async (importOriginal) => {
    const original = await importOriginal<typeof Recharts>()
    return {
        ...original,
        usePlotArea: vi.fn(),
    }
})

import { HoverCursor, HoverCursorLayer } from './HoverCursor'

describe('HoverCursor', () => {
    it('renders nothing when points is undefined', () => {
        const { container } = render(
            <svg>
                <HoverCursor />
            </svg>,
        )

        expect(container.querySelector('line')).not.toBeInTheDocument()
        expect(container.querySelector('polygon')).not.toBeInTheDocument()
    })

    it('renders nothing when points has fewer than 2 items', () => {
        const { container } = render(
            <svg>
                <HoverCursor points={[{ x: 50, y: 10 }]} />
            </svg>,
        )

        expect(container.querySelector('line')).not.toBeInTheDocument()
        expect(container.querySelector('polygon')).not.toBeInTheDocument()
    })

    it('renders a dashed vertical black line with correct attributes', () => {
        const { container } = render(
            <svg>
                <HoverCursor
                    points={[
                        { x: 100, y: 20 },
                        { x: 100, y: 180 },
                    ]}
                />
            </svg>,
        )

        const line = container.querySelector('line')

        expect(line).toBeInTheDocument()
        expect(line).toHaveAttribute('x1', '100')
        expect(line).toHaveAttribute('y1', '20')
        expect(line).toHaveAttribute('x2', '100')
        expect(line).toHaveAttribute('y2', '180')
        expect(line).toHaveAttribute('stroke', '#000000')
        expect(line).toHaveAttribute('stroke-dasharray', '4 4')
        expect(line).toHaveAttribute('stroke-width', '1')
    })

    it('renders an upward-pointing triangle polygon with the tip at bottom.y', () => {
        const top = { x: 50, y: 10 }
        const bottom = { x: 50, y: 200 }

        const { container } = render(
            <svg>
                <HoverCursor points={[top, bottom]} />
            </svg>,
        )

        const polygon = container.querySelector('polygon')

        expect(polygon).toBeInTheDocument()
        expect(polygon).toHaveAttribute('fill', '#000000')

        const pointsAttr = polygon?.getAttribute('points') ?? ''
        const coords = pointsAttr.split(' ').map((pair) => {
            const [x, y] = pair.split(',').map(Number)
            return { x, y }
        })

        const tip = coords.find((c) => c.y === bottom.y)
        expect(tip).toBeDefined()
        expect(tip?.x).toBe(50)

        const base = coords.filter((c) => c.y > bottom.y)
        expect(base).toHaveLength(2)

        expect(base[0].x).toBeLessThan(50)
        expect(base[1].x).toBeGreaterThan(50)
    })

    it('uses the x coordinate from the top point for the line and triangle cx', () => {
        const { container } = render(
            <svg>
                <HoverCursor
                    points={[
                        { x: 75, y: 5 },
                        { x: 75, y: 195 },
                    ]}
                />
            </svg>,
        )

        const line = container.querySelector('line')
        expect(line).toHaveAttribute('x1', '75')
        expect(line).toHaveAttribute('x2', '75')

        const polygon = container.querySelector('polygon')
        const pointsAttr = polygon?.getAttribute('points') ?? ''
        expect(pointsAttr).toContain('75,195')
    })
})

describe('HoverCursorLayer', () => {
    let mockUsePlotArea: ReturnType<typeof vi.fn>

    beforeEach(async () => {
        const { usePlotArea } = await import('recharts')
        mockUsePlotArea = vi.mocked(usePlotArea)
    })

    it('renders nothing when cursorX is null', () => {
        mockUsePlotArea.mockReturnValue({
            x: 0,
            y: 10,
            width: 400,
            height: 200,
        })

        const { container } = render(
            <svg>
                <HoverCursorLayer cursorX={null} />
            </svg>,
        )

        expect(container.querySelector('line')).not.toBeInTheDocument()
        expect(container.querySelector('polygon')).not.toBeInTheDocument()
    })

    it('renders nothing when usePlotArea returns undefined', () => {
        mockUsePlotArea.mockReturnValue(undefined as any)

        const { container } = render(
            <svg>
                <HoverCursorLayer cursorX={120} />
            </svg>,
        )

        expect(container.querySelector('line')).not.toBeInTheDocument()
        expect(container.querySelector('polygon')).not.toBeInTheDocument()
    })

    it('renders a HoverCursor with points derived from the plot area when cursorX is set', () => {
        mockUsePlotArea.mockReturnValue({
            x: 0,
            y: 15,
            width: 400,
            height: 250,
        })

        const { container } = render(
            <svg>
                <HoverCursorLayer cursorX={120} />
            </svg>,
        )

        const line = container.querySelector('line')

        expect(line).toBeInTheDocument()
        expect(line).toHaveAttribute('x1', '120')
        expect(line).toHaveAttribute('x2', '120')
        expect(line).toHaveAttribute('y1', '15')
        expect(line).toHaveAttribute('y2', '265')
    })
})
