import type { FullShopifyMetafield } from './types'

export const TEXT_TRUNCATE_LENGTH = 80

function parseJsonMetafieldValue(value: unknown): unknown {
    if (typeof value === 'string') {
        try {
            return JSON.parse(value)
        } catch {
            return value
        }
    }
    return value
}

export function normalizeMetafields(
    metafields: FullShopifyMetafield[] | undefined,
): FullShopifyMetafield[] | undefined {
    return metafields?.map((metafield) => ({
        ...metafield,
        value: parseJsonMetafieldValue(metafield.value),
    })) as FullShopifyMetafield[] | undefined
}

export function formatDate(value: string): string {
    try {
        return new Date(value).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    } catch {
        return value
    }
}

export function formatDateTime(value: string): string {
    try {
        const date = new Date(value)
        const dateStr = date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
        const timeStr = date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
        })
        return `${dateStr} ${timeStr}`
    } catch {
        return value
    }
}

export function formatDimensionUnit(unit: string): string {
    if (unit === 'l') return 'L'
    return unit.replace(/_/g, ' ').replace(/us/g, '').replace(/3/g, '³')
}

export function extractRichText(node: Record<string, unknown>): string {
    if (node.type === 'text' && 'value' in node) return String(node.value)
    if (Array.isArray(node.children)) {
        return (node.children as Record<string, unknown>[])
            .map(extractRichText)
            .join(' ')
    }
    return ''
}
