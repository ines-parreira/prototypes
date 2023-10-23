/**
 * Convert hours to seconds.
 */
export default function hoursToSeconds(hours: number | string = 0): number {
    if (typeof hours !== 'number') {
        return 0
    }

    return 60 * 60 * hours
}
