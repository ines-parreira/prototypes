import { usePlotArea } from 'recharts'

import type { HoverCursorProps } from '../types'

const TRIANGLE_HALF_WIDTH = 5.5
const TRIANGLE_HEIGHT = 8

export const HoverCursor = ({ points }: HoverCursorProps) => {
    if (!points || points.length < 2) return null

    const [top, bottom] = points
    const cx = top.x

    const trianglePoints = [
        `${cx - TRIANGLE_HALF_WIDTH},${bottom.y + TRIANGLE_HEIGHT}`,
        `${cx + TRIANGLE_HALF_WIDTH},${bottom.y + TRIANGLE_HEIGHT}`,
        `${cx},${bottom.y}`,
    ].join(' ')

    return (
        <g pointerEvents="none">
            <line
                x1={cx}
                y1={top.y}
                x2={cx}
                y2={bottom.y}
                stroke="#000000"
                strokeDasharray="4 4"
                strokeWidth={1}
            />
            <polygon fill="#000000" points={trianglePoints} />
        </g>
    )
}

type HoverCursorLayerProps = {
    cursorX: number | null
}

export const HoverCursorLayer = ({ cursorX }: HoverCursorLayerProps) => {
    const plotArea = usePlotArea()

    if (cursorX === null || !plotArea) return null

    return (
        <HoverCursor
            points={[
                { x: cursorX, y: plotArea.y },
                { x: cursorX, y: plotArea.y + plotArea.height },
            ]}
        />
    )
}
