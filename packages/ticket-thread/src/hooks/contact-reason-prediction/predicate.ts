import { contactReasonCustomFieldsSchema } from './schemas'
import type { ContactReasonCustomFields } from './types'

export function getContactReasonSuggestionCount(input: unknown): number {
    const parsed = contactReasonCustomFieldsSchema.safeParse(input)
    if (!parsed.success) {
        return 0
    }

    return Object.values(parsed.data).filter(
        (field) => field.prediction?.display === true,
    ).length
}

export function isContactReasonSuggestion(
    input: unknown,
): input is ContactReasonCustomFields {
    return getContactReasonSuggestionCount(input) > 0
}
