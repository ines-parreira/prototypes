import type { ActionExecutedDetailsEntry, ActionExecutedPayload } from './types'

function getPayloadValueAsText(value: unknown): string {
    if (typeof value === 'string') {
        return value
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return value.toString()
    }

    if (value == null) {
        return 'null'
    }

    if (typeof value === 'object') {
        return JSON.stringify(value)
    }

    return String(value)
}

function formatPayloadKey(key: string): string {
    return key
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function getActionExecutedPayloadEntries(
    payload: ActionExecutedPayload,
): ActionExecutedDetailsEntry[] {
    return Object.entries(payload)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => ({
            key: formatPayloadKey(key),
            value: getPayloadValueAsText(value),
        }))
}

export function getActionExecutedErrorMessage({
    status,
    message,
}: {
    status: string | undefined
    message: string | undefined
}): string | null {
    if (!message) {
        return null
    }

    const normalizedStatus = status?.toLowerCase()
    const isError =
        normalizedStatus?.includes('error') ||
        normalizedStatus?.includes('fail')

    return isError ? message : null
}
