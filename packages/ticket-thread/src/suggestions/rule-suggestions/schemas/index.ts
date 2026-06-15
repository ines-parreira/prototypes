import { z } from 'zod'

export const ruleSuggestionMetaSchema = z
    .object({ rule_suggestion: z.unknown() })
    .refine((data) => !!data.rule_suggestion)
export type RuleSuggestionMetaSchema = z.infer<typeof ruleSuggestionMetaSchema>

export const messageMetaWithRuleSuggestionSlugSchema = z
    .object({
        rule_suggestion_slug: z.unknown(),
    })
    .refine((data) => Boolean(data.rule_suggestion_slug))
export type MessageMetaWithRuleSuggestionSlugSchema = z.infer<
    typeof messageMetaWithRuleSuggestionSlugSchema
>
