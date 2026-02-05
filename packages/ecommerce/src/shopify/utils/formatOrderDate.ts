export function formatOrderDate(
    createdDatetime: string,
    now: Date = new Date(),
): string {
    const created = new Date(createdDatetime)
    const diffMs = now.getTime() - created.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`
    }

    if (diffHours < 24) {
        return `${diffHours}hr ago`
    }

    if (diffDays < 7) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    }

    const month = String(created.getMonth() + 1).padStart(2, '0')
    const day = String(created.getDate()).padStart(2, '0')
    const year = String(created.getFullYear()).slice(-2)

    return `${month}/${day}/${year}`
}
