import { IngestionLogStatus } from './constant'
import type { IngestionLog } from './types'

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

export const getFormattedSyncDate = (
    latestSync: number | string | undefined | null,
) => {
    if (!latestSync) return null

    const latestSyncDate = new Date(latestSync)
    return latestSyncDate?.toLocaleDateString(
        Intl.DateTimeFormat().resolvedOptions().locale,
        dateOptions,
    )
}

export const getFormattedSyncDatetime = (
    latestSync: number | string | undefined | null,
) => {
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

export const isSyncLessThan24Hours = (
    latestSync: number | string | undefined | null,
) => {
    if (!latestSync) return false

    const latestSyncDate = new Date(latestSync)
    const now = new Date()

    const diffInHours =
        Math.abs(now.getTime() - latestSyncDate.getTime()) / 36e5
    return diffInHours < 24
}

export const getNextSyncDate = (
    latestSync: number | string | undefined | null,
) => {
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

export function getEffectiveSyncTime(log?: IngestionLog): number | undefined {
    if (!log) return undefined

    if (log.status === IngestionLogStatus.Pending) {
        return Date.now()
    }

    return log.latest_sync ? new Date(log.latest_sync).getTime() : undefined
}

export const getTheLatestIngestionLog = (ingestionLogs?: IngestionLog[]) => {
    if (!ingestionLogs || ingestionLogs.length === 0) {
        return undefined
    }

    const latestIngestionLog = ingestionLogs.reduce<IngestionLog | undefined>(
        (latest, current) => {
            if (!latest) return current

            const latestTime = getEffectiveSyncTime(latest)
            const currentTime = getEffectiveSyncTime(current)

            if (latestTime === undefined) return current
            if (currentTime === undefined) return latest

            return currentTime > latestTime ? current : latest
        },
        undefined,
    )

    return latestIngestionLog
}

export const hasSuccessfullySyncedOnce = (ingestionLogs?: IngestionLog[]) => {
    return (
        ingestionLogs?.some(
            (log) => !!log.latest_sync && log.status === 'SUCCESSFUL',
        ) ?? false
    )
}
