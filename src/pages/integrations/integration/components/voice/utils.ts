export function getAudioFileDuration(url: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const audio = new Audio(url)
        audio.addEventListener('error', () => reject(), false)
        audio.addEventListener(
            'canplaythrough',
            () => resolve(audio.duration),
            false
        )
    })
}

export const isValueInRange = (
    value: number,
    minValue: number,
    maxValue: number
) => {
    return value >= minValue && value <= maxValue
}
