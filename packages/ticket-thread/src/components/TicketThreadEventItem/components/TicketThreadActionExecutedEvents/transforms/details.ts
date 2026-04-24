import type { ActionExecutedDetailsEntry, ActionExecutedPayload } from './types'

export type HttpActionModalSection = {
    title: string
    entries: ActionExecutedDetailsEntry[]
}

export type CustomHttpActionPayload = {
    url?: string
    headers?: Record<string, unknown>
    params?: Record<string, unknown>
    form?: Record<string, unknown>
    json?: Record<string, unknown>
    content_type?: string
    response?: {
        status_code?: number
        body?: string
    }
}

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

function toObjectEntries(
    obj: Record<string, unknown>,
): ActionExecutedDetailsEntry[] {
    return Object.entries(obj).map(([k, v]) => ({
        key: k,
        value: getPayloadValueAsText(v),
    }))
}

export function getHttpActionModalSections(
    payload: CustomHttpActionPayload,
): HttpActionModalSection[] {
    const sections: HttpActionModalSection[] = []

    if (payload.url) {
        sections.push({
            title: '',
            entries: [{ key: 'Url', value: payload.url }],
        })
    }

    if (payload.headers && Object.keys(payload.headers).length > 0) {
        sections.push({
            title: 'Headers',
            entries: toObjectEntries(payload.headers),
        })
    }

    if (payload.params && Object.keys(payload.params).length > 0) {
        sections.push({
            title: 'URL Parameters',
            entries: toObjectEntries(payload.params),
        })
    }

    const isJson =
        payload.content_type?.includes('json') ||
        (payload.json != null && payload.form == null)

    if (
        !isJson &&
        payload.form != null &&
        Object.keys(payload.form).length > 0
    ) {
        sections.push({
            title: 'Form Data',
            entries: toObjectEntries(payload.form),
        })
    } else if (
        isJson &&
        payload.json != null &&
        Object.keys(payload.json).length > 0
    ) {
        sections.push({
            title: 'JSON Data',
            entries: [
                { key: '', value: JSON.stringify(payload.json, null, 2) },
            ],
        })
    }

    if (payload.response != null) {
        const responseEntries: ActionExecutedDetailsEntry[] = []
        if (payload.response.status_code != null) {
            responseEntries.push({
                key: 'Status code',
                value: String(payload.response.status_code),
            })
        }
        if (payload.response.body) {
            responseEntries.push({ key: 'Body', value: payload.response.body })
        }
        if (responseEntries.length > 0) {
            sections.push({ title: 'Response', entries: responseEntries })
        }
    }

    return sections
}
