import { screen } from '@testing-library/react'

import { render } from '../../../../tests/render.utils'
import { TicketThreadItemTag } from '../../../../thread/itemTags'
import type { TicketThreadContactReasonSuggestionItem } from '../../../contact-reason-prediction/types'
import type { TicketThreadRuleSuggestionItem } from '../../../rule-suggestions/types'
import { TicketThreadSuggestionItem } from '../TicketThreadSuggestionItem'

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
