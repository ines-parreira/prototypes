import { Box } from '@gorgias/axiom'

import type { TicketThreadContactReasonSuggestionItem } from '../../hooks/contact-reason-prediction/types'
import type { TicketThreadRuleSuggestionItem } from '../../hooks/rules-suggestions/types'
import { TicketThreadItemTag } from '../../hooks/types'
import { assertNever } from '../../utils/assertNever'

type TicketThreadSuggestionItemProps = {
    item:
        | TicketThreadRuleSuggestionItem
        | TicketThreadContactReasonSuggestionItem
}

export function TicketThreadSuggestionItem({
    item,
}: TicketThreadSuggestionItemProps) {
    switch (item._tag) {
        case TicketThreadItemTag.RuleSuggestion:
            return <Box padding="md">{JSON.stringify(item.data)}</Box>
        case TicketThreadItemTag.ContactReasonSuggestion:
            return <Box padding="md">{JSON.stringify(item.data)}</Box>
        default:
            return assertNever(item)
    }
}
