import cn from 'classnames'

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
    opacity?: number
}

const Circle = ({
    color,
    percentage,
    radius = 12,
    strokeWidth = 5,
    opacity = 1,
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
            strokeOpacity={opacity}
            strokeLinecap="round"
            shapeRendering="geometricPrecision"
        />
    )
}

type Props = {
    className?: string
    percentage: number
    color: string
    backgroundColor?: string
    radius?: number
    label?: string
    strokeWidth?: number
}

const TrackerCircle = ({
    className,
    percentage,
    color,
    radius = 12,
    label,
    strokeWidth,
}: Props) => {
    const pct = cleanPercentage(percentage)
    const strokeW = strokeWidth ?? radius / 2.5
    const size = (radius * 2 + strokeW) * 1.01

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            className={cn(css.circle, className)}
        >
            <g transform={`rotate(-90)`}>
                <Circle
                    color={color}
                    percentage={100}
                    radius={radius}
                    strokeWidth={strokeW}
                    opacity={0.32}
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
                y={0}
                height="100%"
                width="100%"
                fontSize={radius / 1.5}
            >
                <div className={css.labelContainer}>
                    <span className={css.label} title={label}>
                        {label}
                    </span>
                </div>
            </foreignObject>
        </svg>
    )
}

export default TrackerCircle
