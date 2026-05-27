import { AXIS_COLOR, BASELINE_STROKE_WIDTH, TICK_COLOR } from '../constants'
import type { XAxisTickProps } from '../types'
import { formatXAxisValue } from '../utils'

const X_AXIS_TICK_LAYOUT = {
    height: 34,
    labelYOffset: 18,
    lineHeight: 6,
} as const

export const X_AXIS_HEIGHT = X_AXIS_TICK_LAYOUT.height

export const ComposedMetricTimeSeriesXAxisTick = ({
    x,
    y,
    payload,
    dateFormatter,
}: XAxisTickProps) => {
    if (typeof x !== 'number' || typeof y !== 'number' || !payload) {
        return null
    }

    const formattedValue = formatXAxisValue(payload.value, dateFormatter)

    return (
        <g transform={`translate(${x},${y})`}>
            <line
                x1={0}
                x2={0}
                y1={0}
                y2={X_AXIS_TICK_LAYOUT.lineHeight}
                stroke={AXIS_COLOR}
                strokeWidth={BASELINE_STROKE_WIDTH}
                strokeLinecap="round"
            />
            <text
                x={0}
                y={X_AXIS_TICK_LAYOUT.labelYOffset}
                textAnchor="middle"
                fill={TICK_COLOR}
                fontSize={12}
            >
                {formattedValue}
            </text>
        </g>
    )
}
