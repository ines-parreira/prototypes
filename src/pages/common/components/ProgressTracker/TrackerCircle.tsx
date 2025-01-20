import React from 'react'

import {relativeLighten} from 'gorgias-design-system/utils'

const cleanPercentage = (percentage: number) => {
    const isNegativeOrNaN = !Number.isFinite(+percentage) || percentage < 0
    const isTooHigh = percentage > 100
    return isNegativeOrNaN ? 0 : isTooHigh ? 100 : +percentage
}

type CircleProps = {
    color: string
    percentage: number
}

const Circle = ({color, percentage}: CircleProps) => {
    const r = 12
    const circ = 2 * Math.PI * r
    const strokePct = ((100 - percentage) * circ) / 100
    const stroke = strokePct !== circ ? color : ''
    return (
        <circle
            r={r}
            cx={16}
            cy={16}
            fill="none"
            stroke={stroke}
            strokeWidth={5}
            strokeDasharray={circ}
            strokeDashoffset={percentage ? strokePct : 0}
            strokeLinecap="round"
            shapeRendering="geometricPrecision"
        />
    )
}

type Props = {
    percentage: number
    color: string
}

const TrackerCircle = ({percentage, color}: Props) => {
    const pct = cleanPercentage(percentage)
    const backgroundColor = relativeLighten(color, 0.5)
    return (
        <svg width={32} height={32} viewBox="0 0 32 32" fill="none">
            <g transform={`rotate(-90 ${'16 16'})`}>
                <Circle color={backgroundColor} percentage={100} />
                <Circle color={color} percentage={pct} />
            </g>
        </svg>
    )
}

export default TrackerCircle
