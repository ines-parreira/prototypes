/**
 * Convert days to hours.
 */
export default function daysToHours(days = 0): number {
    if (typeof days !== 'number') {
        return 0
    }

    return 24 * days
}
