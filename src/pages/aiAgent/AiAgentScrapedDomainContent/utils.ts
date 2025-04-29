import { IngestionLog } from './types'

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
    const formatted = latestSyncDate.toLocaleString(
        Intl.DateTimeFormat().resolvedOptions().locale,
        dateTimeOptions,
    )

    return formatted
        .replace(',', '')
        .replace(/\s(am|pm)/i, (match) => match.toUpperCase())
}

export const isSyncLessThan24Hours = (latestSync: string | undefined) => {
    if (!latestSync) return false

    const latestSyncDate = new Date(latestSync)
    const now = new Date()

    const diffInHours =
        Math.abs(now.getTime() - latestSyncDate.getTime()) / 36e5
    return diffInHours < 24
}

export const getNextSyncDate = (latestSync: string | undefined) => {
    if (!latestSync) return null

    const latestSyncDate = new Date(latestSync)
    const nextSyncDate = new Date(latestSyncDate)
    nextSyncDate.setHours(nextSyncDate.getHours() + 24)

    return nextSyncDate
        .toLocaleString(
            Intl.DateTimeFormat().resolvedOptions().locale,
            dateTimeOptions,
        )
        .replace(',', '')
        .replace(/\s(am|pm)/i, (match) => match.toUpperCase())
}

export const getTheLatestIngestionLog = (ingestionLogs?: IngestionLog[]) => {
    if (!ingestionLogs || ingestionLogs.length === 0) {
        return undefined
    }

    const latestIngestionLog = ingestionLogs?.reduce((latest, current) => {
        return new Date(current.latest_sync) > new Date(latest.latest_sync)
            ? current
            : latest
    })

    return latestIngestionLog
}
