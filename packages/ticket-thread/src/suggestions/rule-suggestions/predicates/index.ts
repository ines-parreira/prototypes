import {
    messageMetaWithRuleSuggestionSlugSchema,
    ruleSuggestionMetaSchema,
} from '#suggestions/rule-suggestions/schemas'
import type { RuleSuggestionMeta } from '#suggestions/rule-suggestions/types'

export function isRuleSuggestion(input: unknown): input is RuleSuggestionMeta {
    return ruleSuggestionMetaSchema.safeParse(input).success
}

export function isMessageMetaWithRuleSuggestionSlug(input: unknown): boolean {
    return messageMetaWithRuleSuggestionSlugSchema.safeParse(input).success
}
