import { useLocalStorage } from '@repo/hooks'

const getStorageKey = (dashboardId: number) =>
    `show-metric-origin-dashboard-${dashboardId}`

export const getShowMetricOriginValue = (
    dashboardId: number,
    defaultValue = false,
): boolean => {
    try {
        const stored = localStorage.getItem(getStorageKey(dashboardId))
        return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
        return defaultValue
    }
}

export const useShowMetricOrigin = (
    dashboardId: number,
    defaultValue = false,
) => useLocalStorage(getStorageKey(dashboardId), defaultValue)
