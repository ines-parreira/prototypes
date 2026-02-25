import {
    isRuleSuggestionEmpty,
    shouldRenderRuleSuggestion,
} from '../transforms'
import type { RuleSuggestionMeta } from '../types'

function createRuleSuggestionMeta(actions: unknown[]): RuleSuggestionMeta {
    return {
        rule_suggestion: {
            actions,
        },
    }
}

describe('rule suggestion transforms', () => {
    it('returns true when rule suggestion has no renderable text or macro actions', () => {
        const ruleSuggestion = createRuleSuggestionMeta([
            { name: 'replyToTicket', args: null },
        ])

        expect(isRuleSuggestionEmpty(ruleSuggestion)).toBe(true)
    })

    it('returns false when rule suggestion has reply text', () => {
        const ruleSuggestion = createRuleSuggestionMeta([
            { name: 'replyToTicket', args: { body_text: 'hello' } },
        ])

        expect(isRuleSuggestionEmpty(ruleSuggestion)).toBe(false)
    })

    it('returns false when rule suggestion has a legacy macro action', () => {
        const ruleSuggestion = createRuleSuggestionMeta([
            { name: 'setStatus', args: { status: 'open' } },
        ])

        expect(isRuleSuggestionEmpty(ruleSuggestion)).toBe(false)
    })

    it('uses legacy demo filtering when deciding if rule suggestion should render', () => {
        const ruleSuggestion = createRuleSuggestionMeta([
            { name: 'setStatus', args: { status: 'open' } },
        ])

        expect(
            shouldRenderRuleSuggestion({
                ruleSuggestionMeta: ruleSuggestion,
                shouldDisplayDemoSuggestion: true,
            }),
        ).toBe(true)

        expect(
            shouldRenderRuleSuggestion({
                ruleSuggestionMeta: ruleSuggestion,
                shouldDisplayDemoSuggestion: false,
            }),
        ).toBe(false)
    })
})
