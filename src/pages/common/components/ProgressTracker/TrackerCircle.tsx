import cn from 'classnames'

import { gorgiasColors } from 'gorgias-design-system/styles'

import css from './TrackerCircle.less'

const cleanPercentage = (percentage: number) => {
    const isNegativeOrNaN = !Number.isFinite(+percentage) || percentage < 0
    const isTooHigh = percentage > 100
    return isNegativeOrNaN ? 0 : isTooHigh ? 100 : +percentage
}

type CircleProps = {
    className?: string
    color: string
    percentage?: number
    radius?: number
    strokeWidth?: number
    opacity?: number
}

const Circle = ({
    className,
    color,
    percentage = 100,
    radius = 18,
    strokeWidth = 3,
    opacity = 1,
}: CircleProps) => {
    const circ = 2 * Math.PI * radius
    const progressValue = (percentage * circ) / 100
    const cx = radius + strokeWidth / 2
    const cy = radius + strokeWidth / 2

    return (
        <circle
            className={cn(
                css.circle,
                { [css.hidden]: percentage === 0 },
                className,
            )}
            r={radius}
            cx={cx}
            cy={cy}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${progressValue} ${circ}`}
            strokeOpacity={opacity}
            strokeLinecap="round"
            shapeRendering="geometricPrecision"
        />
    )
}

type Props = {
    className?: string
    percentage: number
    label?: string
    color?: string
    radius?: number
    strokeWidth?: number
}

const TrackerCircle = ({
    className,
    percentage,
    label,
    color = gorgiasColors.accessoryMagenta25,
    radius = 18,
    strokeWidth = 4,
}: Props) => {
    const pct = cleanPercentage(percentage)
    const size = radius * 2 + strokeWidth

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            className={cn(css.trackerCircle, className)}
            style={{ overflow: 'visible' }}
        >
            <Circle
                color={color}
                radius={radius}
                strokeWidth={strokeWidth}
                opacity={0.32}
            />
            <Circle
                className={css.progressCircle}
                color={color}
                percentage={pct}
                radius={radius}
                strokeWidth={strokeWidth}
            />
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
