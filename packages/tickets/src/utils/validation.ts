import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js'

/**
 * Migrated from: apps/helpdesk/src/pages/phoneNumbers/utils.tsx
 * In a future PR, this can be migrated to @repo/utils.
 */
export function formatPhoneNumberInternational(number?: string): string {
    if (!number) return ''

    return number && isValidPhoneNumber(number)
        ? (parsePhoneNumber(number)?.formatInternational() ?? '')
        : number
}

/**
 * Migrated from: apps/helpdesk/src/utils.ts
 * In a future PR, this can be migrated to @repo/utils.
 */
export function isEmail(string: string): boolean {
    if (typeof string !== 'string') {
        return false
    }

    return /^[\w\.\-\+]+@[\w\.\-]+\.\w+$/i.test(string)
}

export function validateChannelField(
    fieldType: 'email' | 'phone',
    value: string,
): string | undefined {
    if (!value.trim()) {
        return undefined
    }

    switch (fieldType) {
        case 'email':
            return isEmail(value) ? undefined : 'Invalid email address'
        case 'phone':
            return isValidPhoneNumber(value)
                ? undefined
                : 'Invalid phone number'
        default:
            return undefined
    }
}
