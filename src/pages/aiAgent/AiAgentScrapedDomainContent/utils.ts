const dateOptions: Intl.DateTimeFormatOptions = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
}
const dateTimeOptions: Intl.DateTimeFormatOptions = {
    ...dateOptions,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
}

export const getFormattedSyncDate = (latestSync: string | undefined) => {
    if (!latestSync) return null

    const latestSyncDate = new Date(latestSync)
    return latestSyncDate?.toLocaleDateString(
        Intl.DateTimeFormat().resolvedOptions().locale,
        dateOptions,
    )
}

export const getFormattedSyncDatetime = (latestSync: string | undefined) => {
    if (!latestSync) return null

    const latestSyncDate = new Date(latestSync)
    return latestSyncDate?.toLocaleDateString(
        Intl.DateTimeFormat().resolvedOptions().locale,
        dateTimeOptions,
    )
}
