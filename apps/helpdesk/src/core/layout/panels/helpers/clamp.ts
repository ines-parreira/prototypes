export default function clamp(value: number, min: number, max: number) {
    if (max < min) {
        throw new Error('Maximum value should be larger than the minimum value')
    }

    return Math.min(Math.max(value, min), max)
}
