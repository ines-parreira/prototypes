import css from './CircularProgressBar.less'

type Props = {
    size: number
    thickness: number
    progress: number
}

const CircularProgressBar = ({ size, thickness, progress }: Props) => {
    const halfSize = size / 2
    const radius = halfSize - thickness
    const circumference = 2 * Math.PI * radius

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className={css.container}>
            <circle
                className={css.circleBackground}
                cx={halfSize}
                cy={halfSize}
                r={radius}
                fill="none"
                strokeWidth={thickness}
            ></circle>
            <circle
                className={css.circleForeground}
                cx={halfSize}
                cy={halfSize}
                r={radius}
                fill="none"
                strokeWidth={thickness}
                strokeDasharray={`${circumference * progress} ${circumference * (1 - progress)}`}
            ></circle>
        </svg>
    )
}

export default CircularProgressBar
