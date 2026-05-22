export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (typeof error !== 'object' || error === null) {
        return fallback
    }
    const response = (error as { response?: unknown }).response
    if (typeof response !== 'object' || response === null) {
        return fallback
    }
    const data = (response as { data?: unknown }).data
    if (typeof data !== 'object' || data === null) {
        return fallback
    }
    const errorField = (data as { error?: unknown }).error
    if (typeof errorField !== 'object' || errorField === null) {
        return fallback
    }
    const msg = (errorField as { msg?: unknown }).msg
    return typeof msg === 'string' ? msg : fallback
}
