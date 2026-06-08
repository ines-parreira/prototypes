import { Box, Icon } from '@gorgias/axiom'

export type ProgressRingProps = {
    value: number
    total: number
    size?: number
}

const STROKE_WIDTH = 2

export function ProgressRing({ value, total, size = 16 }: ProgressRingProps) {
    const ratio = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0
    const label = `${value} of ${total} steps completed`

    if (ratio >= 1) {
        return (
            <Box
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
                role="img"
                aria-label={label}
            >
                <Icon
                    name="check-circle"
                    size="sm"
                    color="content-accent-default"
                />
            </Box>
        )
    }

    const radius = (size - STROKE_WIDTH) / 2
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference * (1 - ratio)
    const center = size / 2

    return (
        <Box
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            role="img"
            aria-label={label}
        >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    strokeWidth={STROKE_WIDTH}
                    style={{
                        stroke: 'var(--heat-2, var(--surface-neutral-secondary))',
                    }}
                />
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    strokeWidth={STROKE_WIDTH}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform={`rotate(-90 ${center} ${center})`}
                    style={{
                        stroke: 'var(--content-accent-default)',
                        transition: 'stroke-dashoffset 200ms ease',
                    }}
                />
            </svg>
        </Box>
    )
}
