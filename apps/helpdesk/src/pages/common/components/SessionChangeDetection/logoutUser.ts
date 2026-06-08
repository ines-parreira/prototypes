import { clearPersistedQueryCache } from '@repo/api-resources'
import { Duration } from '@gorgias/toolkit'

export function logoutUser(seconds: number) {
    return window.setTimeout(async () => {
        await clearPersistedQueryCache()
        window.location.href = `/logout?csrf-token=${window.CSRF_TOKEN}&next=${window.location.href}`
    }, Duration.seconds(seconds))
}
