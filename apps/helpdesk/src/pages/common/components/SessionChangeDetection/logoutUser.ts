import { clearPersistedQueryCache } from '@repo/api-resources'

export function logoutUser(seconds: number) {
    return window.setTimeout(async () => {
        await clearPersistedQueryCache()
        window.location.href = `/logout?csrf-token=${window.CSRF_TOKEN}&next=${window.location.href}`
    }, seconds * 1000)
}
