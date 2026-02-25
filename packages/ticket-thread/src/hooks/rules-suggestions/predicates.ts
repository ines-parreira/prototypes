import {
    messageMetaWithRuleSuggestionSlugSchema,
    ruleSuggestionMetaSchema,
} from './schemas'
import type { RuleSuggestionMeta } from './types'

export function isRuleSuggestion(input: unknown): input is RuleSuggestionMeta {
    return ruleSuggestionMetaSchema.safeParse(input).success
}

export function isMessageMetaWithRuleSuggestionSlug(input: unknown): boolean {
    return messageMetaWithRuleSuggestionSlugSchema.safeParse(input).success
}
