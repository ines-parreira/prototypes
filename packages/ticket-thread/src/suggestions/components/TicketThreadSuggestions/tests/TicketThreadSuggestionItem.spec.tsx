import { screen } from '@testing-library/react'

import { TicketThreadSuggestionItem } from '#suggestions/components/TicketThreadSuggestions/TicketThreadSuggestionItem'
import type { TicketThreadContactReasonSuggestionItem } from '#suggestions/contact-reason-prediction/types'
import type { TicketThreadRuleSuggestionItem } from '#suggestions/rule-suggestions/types'
import { render } from '#tests/render.utils'
import { TicketThreadItemTag } from '#thread/itemTags'

const ruleSuggestionData = { rule_suggestion: { id: 1 } }

function renderItem(
    item:
        | TicketThreadRuleSuggestionItem
        | TicketThreadContactReasonSuggestionItem,
) {
    return render(<TicketThreadSuggestionItem item={item} />)
}

describe('TicketThreadSuggestionItem', () => {
    it('renders a rule suggestion item', () => {
        renderItem({
            _tag: TicketThreadItemTag.RuleSuggestion,
            data: ruleSuggestionData,
        } as TicketThreadRuleSuggestionItem)

        expect(
            screen.getByText(JSON.stringify(ruleSuggestionData)),
        ).toBeInTheDocument()
    })

    it('renders a contact reason suggestion item', () => {
        renderItem({
            _tag: TicketThreadItemTag.ContactReasonSuggestion,
            data: null,
        })

        expect(screen.getByText('null')).toBeInTheDocument()
    })
})
