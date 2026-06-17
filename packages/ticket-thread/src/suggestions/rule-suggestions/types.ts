import type { Prettify } from '@repo/types'

import type { TicketThreadItemTag } from '#thread/itemTags'
import type { RuleSuggestionMetaSchema } from './schemas'

export type TicketThreadRuleSuggestionItem = {
    _tag: typeof TicketThreadItemTag.RuleSuggestion
    data: Prettify<RuleSuggestionMetaSchema & RuleSuggestionMeta>
}

export type RuleSuggestionMeta = Record<string, unknown> & {
    rule_suggestion: unknown
}
