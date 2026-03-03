import {
    DROPDOWN_VALUES_LIMIT,
    INITIAL_BODY,
    METHODS_WITH_BODY,
} from './customActionConstants'
import type { ButtonConfig, Parameter } from './customActionTypes'

export function removeDuplicates(params: Parameter[]): Parameter[] {
    return params.filter(
        (paramA, index) =>
            params.findIndex((paramB) => paramA.key === paramB.key) === index,
    )
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

export function validateDropdownValues(value?: string): string | undefined {
    if (!value) return undefined
    const parts = value.split(';').filter(Boolean)
    if (parts.length > DROPDOWN_VALUES_LIMIT)
        return `Limit reached: only the first ${DROPDOWN_VALUES_LIMIT} values will be saved.`
    return undefined
}
