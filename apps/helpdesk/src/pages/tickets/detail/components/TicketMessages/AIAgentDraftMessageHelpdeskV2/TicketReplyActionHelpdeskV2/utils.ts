import _startCase from 'lodash/startCase'

import type { MacroAction } from 'models/macroAction/types'
import { getActionTemplate } from 'utils'

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isListDictEntry(
    value: unknown,
): value is { key: string; value?: string | number | boolean | null } {
    return isRecord(value) && typeof value.key === 'string'
}

export function isNamedEntry(value: unknown): value is { name: string } {
    return isRecord(value) && typeof value.name === 'string'
}

export function hasRenderableValue(value: unknown): boolean {
    if (value === null || value === undefined) {
        return false
    }

    if (typeof value === 'string') {
        return value.trim().length > 0
    }

    if (Array.isArray(value)) {
        return value.length > 0
    }

    if (isRecord(value)) {
        return Object.keys(value).length > 0
    }

    return true
}

export function formatValue(value: string | number | boolean): string {
    if (typeof value === 'boolean') {
        return value ? 'Enabled' : 'Disabled'
    }

    return String(value)
}

export function getActionTitle(action: MacroAction): string {
    return getActionTemplate(action.name)?.title ?? action.title
}

export function getFallbackArgumentLabel(
    action: MacroAction,
    key: string,
): string {
    const templateArgument = getActionTemplate(action.name)?.arguments?.[key]
    return templateArgument?.label ?? _startCase(key)
}

export function getFallbackSummaries(action: MacroAction): string[] {
    return Object.entries(action.arguments).flatMap(([key, value]) => {
        if (
            key === 'attachments' ||
            key === 'body_html' ||
            key === 'body_text' ||
            !hasRenderableValue(value)
        ) {
            return []
        }

        const label = getFallbackArgumentLabel(action, key)

        if (Array.isArray(value)) {
            return value.flatMap((entry) => {
                if (!hasRenderableValue(entry)) {
                    return []
                }

                if (isListDictEntry(entry)) {
                    return `${label}: ${entry.key}: ${String(entry.value ?? '')}`
                }

                if (isNamedEntry(entry)) {
                    return `${label}: ${entry.name}`
                }

                return `${label}: ${JSON.stringify(entry)}`
            })
        }

        if (isRecord(value)) {
            if (typeof value.name === 'string') {
                return `${label}: ${value.name}`
            }

            return `${label}: ${JSON.stringify(value)}`
        }

        return `${label}: ${formatValue(value as string | number | boolean)}`
    })
}
