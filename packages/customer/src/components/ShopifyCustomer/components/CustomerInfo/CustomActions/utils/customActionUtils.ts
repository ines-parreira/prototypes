import { ensureHTTPS } from '@repo/utils'

import {
    DROPDOWN_VALUES_LIMIT,
    INITIAL_BODY,
    METHODS_WITH_BODY,
} from './customActionConstants'
import type { ButtonConfig, Parameter } from './customActionTypes'

export function removeDuplicates(params: Parameter[]): Parameter[] {
    const seen = new Set<string>()
    return params.filter((param) => {
        if (seen.has(param.key)) return false
        seen.add(param.key)
        return true
    })
}

export function trimLeftoverData(button: ButtonConfig): ButtonConfig {
    const action = {
        ...button.action,
        headers: removeDuplicates(button.action.headers),
        params: removeDuplicates(button.action.params),
    }

    if (!METHODS_WITH_BODY.includes(action.method)) {
        action.body = { ...INITIAL_BODY }
    } else if (action.body.contentType === 'application/json') {
        action.body = {
            ...action.body,
            'application/x-www-form-urlencoded': [],
        }
    } else {
        action.body = { ...action.body, 'application/json': {} }
    }

    return { ...button, action }
}

export function isValidActionUrl(url: string): boolean {
    const trimmed = url.trim()
    if (!trimmed) return false
    if (/\{\{.+?\}\}/.test(trimmed)) return true
    try {
        new URL(trimmed)
        return true
    } catch {
        return false
    }
}

export function isValidLinkUrl(url: string): boolean {
    if (!url.trim()) return false
    try {
        new URL(ensureHTTPS(url))
        return true
    } catch {
        return false
    }
}

export function applyParameterConstraints(param: Parameter): Parameter {
    const next = { ...param }
    if (next.type === 'dropdown') next.editable = true
    if (!next.editable) next.mandatory = false
    return next
}

export function validateDropdownValues(value?: string): string | undefined {
    if (!value) return undefined
    const parts = value.split(';').filter(Boolean)
    if (parts.length > DROPDOWN_VALUES_LIMIT)
        return `Limit reached: only the first ${DROPDOWN_VALUES_LIMIT} values will be saved.`
    return undefined
}
