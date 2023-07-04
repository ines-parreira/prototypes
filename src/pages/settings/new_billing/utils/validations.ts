import {isEmail} from 'utils'

export const emptyError = (
    value: string,
    fieldName: string
): string | undefined => {
    return value === '' ? `${fieldName} cannot be empty` : undefined
}

export const emailError = (value: string): string | undefined => {
    return !isEmail(value) ? 'Email is invalid' : undefined
}
