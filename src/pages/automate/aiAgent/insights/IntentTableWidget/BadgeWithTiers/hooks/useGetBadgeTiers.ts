import {useMemo} from 'react'

export interface BadgeTiers {
    range: [number, number]
    background: string
    color: string
}

const LOW_TIERS_BACKGROUND_COLOR = '#FDF6FF'
const LOW_TIERS_COLOR = 'var(--accessory-magenta-3)'

const MID_TIRES_BACKGROUND_COLOR = 'var(--accessory-magenta-1)'
const MID_TIRES_COLOR = 'var(--accessory-magenta-3)'

const HIGH_TIRES_BACKGROUND_COLOR = 'var(--accessory-magenta-2)'
const HIGH_TIRES_COLOR = 'var(--accessory-magenta-3)'

const calculateTierRange = (
    min: number,
    max: number,
    tierIndex: number,
    tiersCount: number = 3
): [number, number] => {
    const range = max - min
    const tierSize = range / tiersCount

    const start = min + tierSize * tierIndex
    const end = min + tierSize * (tierIndex + 1)

    const startRounded = Math.round(start * 100) / 100
    const endRounded = Math.round(end * 100) / 100

    return [startRounded, endRounded]
}

const createTier = (
    range: [number, number],
    background: string,
    color: string
): BadgeTiers => ({
    range,
    background,
    color,
})

const createSingleTier = (value: number): BadgeTiers[] => {
    const singleTier = createTier(
        [value, value],
        LOW_TIERS_BACKGROUND_COLOR,
        LOW_TIERS_COLOR
    )
    return [singleTier]
}

const useGetBadgeTiers = (values: number[]) => {
    const metricTiers = useMemo(() => {
        if (values.length === 0) {
            return createSingleTier(0)
        }

        const uniqueValues = Array.from(new Set(values))
        if (uniqueValues.length === 1) {
            return createSingleTier(uniqueValues[0])
        }

        const minRate = Math.min(...values)
        const maxRate = Math.max(...values)

        const tiersCount = Math.min(uniqueValues.length, 3)
        const tiers = Array.from({length: tiersCount}, (_, tierIndex) => {
            const range = calculateTierRange(
                minRate,
                maxRate,
                tierIndex,
                tiersCount
            )
            const background = [
                LOW_TIERS_BACKGROUND_COLOR,
                MID_TIRES_BACKGROUND_COLOR,
                HIGH_TIRES_BACKGROUND_COLOR,
            ][tierIndex]
            const color = [LOW_TIERS_COLOR, MID_TIRES_COLOR, HIGH_TIRES_COLOR][
                tierIndex
            ]
            return createTier(range, background, color)
        })

        return tiers
    }, [values])

    return metricTiers
}

export default useGetBadgeTiers
