import React from 'react'

import { relativeLighten } from 'gorgias-design-system/utils'

import css from './ProgressTracker.less'

const cleanPercentage = (percentage: number) => {
    const isNegativeOrNaN = !Number.isFinite(+percentage) || percentage < 0
    const isTooHigh = percentage > 100
    return isNegativeOrNaN ? 0 : isTooHigh ? 100 : +percentage
}

type CircleProps = {
    color: string
    percentage: number
    radius?: number
    strokeWidth?: number
}

const Circle = ({
    color,
    percentage,
    radius = 12,
    strokeWidth = 5,
}: CircleProps) => {
    const circ = 2 * Math.PI * radius
    const strokePct = ((100 - percentage) * circ) / 100
    const stroke = strokePct !== circ ? color : ''
    const cx = (radius + strokeWidth / 2) * -1
    const cy = radius + strokeWidth / 2

    return (
        <circle
            r={radius}
            cx={cx}
            cy={cy}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
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
    backgroundColor?: string
    radius?: number
    label?: string
    strokeWidth?: number
}

const TrackerCircle = ({
    percentage,
    color,
    backgroundColor,
    radius = 12,
    label,
    strokeWidth,
}: Props) => {
    const pct = cleanPercentage(percentage)
    const bgColor = backgroundColor ?? relativeLighten(color, 0.5)
    const strokeW = strokeWidth ?? radius / 2.5
    const size = (radius * 2 + strokeW) * 1.01
    const labelY = radius / 2 + strokeW / 2

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            className={css.circle}
        >
            <g transform={`rotate(-90)`}>
                <Circle
                    color={bgColor}
                    percentage={100}
                    radius={radius}
                    strokeWidth={strokeW}
                />
                <Circle
                    color={color}
                    percentage={pct}
                    radius={radius}
                    strokeWidth={strokeW}
                />
            </g>
            <foreignObject
                x={0}
                y={labelY}
                height={radius}
                width="100%"
                fontSize={radius / 1.5}
            >
                <div className={css.label}>{label}</div>
            </foreignObject>
        </svg>
    )
}

export default TrackerCircle
