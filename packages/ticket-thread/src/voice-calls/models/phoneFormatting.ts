import { parsePhoneNumberWithError } from 'libphonenumber-js'

export const formatPhoneNumberInternational = (
    phoneNumber?: string,
): string => {
    if (!phoneNumber) {
        return ''
    }

    try {
        const parsed = parsePhoneNumberWithError(phoneNumber)
        return parsed.formatInternational()
    } catch {
        return phoneNumber
    }
}
