import type { HorizontalGridLineProps } from '../types'

const isXAxisBaseline = (
    yCoordinate?: number,
    offset?: HorizontalGridLineProps['offset'],
) =>
    typeof yCoordinate === 'number' &&
    !!offset &&
    Math.abs(yCoordinate - (offset.top + offset.height)) < 0.5

export const HorizontalGridLine = ({
    offset,
    stroke,
    strokeDasharray,
    strokeLinecap,
    strokeWidth,
    x1,
    x2,
    y1,
    y2,
}: HorizontalGridLineProps) => {
    if (isXAxisBaseline(y1, offset)) return <g />

    const resolvedStrokeDasharray = Array.isArray(strokeDasharray)
        ? strokeDasharray.join(' ')
        : strokeDasharray

    return (
        <line
            x1={x1}
            x2={x2}
            y1={y1}
            y2={y2}
            fill="none"
            stroke={stroke}
            strokeDasharray={resolvedStrokeDasharray}
            strokeLinecap={strokeLinecap}
            strokeWidth={strokeWidth}
        />
    )
}
