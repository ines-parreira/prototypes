import { useMemo } from 'react'

import { Box } from '@gorgias/axiom'

import { assertNever } from '#shared/assertNever'
import type { TicketThreadContactReasonSuggestionItem } from '#suggestions/contact-reason-prediction/types'
import type { TicketThreadRuleSuggestionItem } from '#suggestions/rule-suggestions/types'
import { TicketThreadItemTag } from '#thread/itemTags'

type TicketThreadSuggestionItemProps = {
    item:
        | TicketThreadRuleSuggestionItem
        | TicketThreadContactReasonSuggestionItem
}

export function TicketThreadSuggestionItem({
    item,
}: TicketThreadSuggestionItemProps) {
    const content = useMemo(() => {
        switch (item._tag) {
            case TicketThreadItemTag.RuleSuggestion:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.ContactReasonSuggestion:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            default:
                return assertNever(item)
        }
    }, [item])

    return (
        <Box alignSelf="flex-end" paddingBottom="xxxs" paddingTop="xxxs">
            {content}
        </Box>
    )
}
