import { assumeMock, render } from '@repo/testing'

import { useConfigureSuggestions } from '@gorgias/copilot'

import { CopilotConversationStarters } from './CopilotConversationStarters'

const mockUseConfigureSuggestions = assumeMock(useConfigureSuggestions)

type StaticConfigArg = {
    available: string
    suggestions: Array<{ title: string; message: string }>
}

function getLastRegisteredConfig(): StaticConfigArg {
    const lastCall = mockUseConfigureSuggestions.mock.calls.at(-1)?.[0]
    return lastCall as StaticConfigArg
}

function getLastRegisteredSuggestions() {
    return getLastRegisteredConfig()?.suggestions ?? []
}

describe('CopilotConversationStarters', () => {
    beforeEach(() => {
        mockUseConfigureSuggestions.mockClear()
    })

    it('registers no starters outside the AI Agent section', () => {
        render(<CopilotConversationStarters />, {
            initialEntries: ['/app/ticket/42'],
        })

        expect(getLastRegisteredSuggestions()).toEqual([])
    })

    it('registers the Skills list starter and universal on the Skills list view', () => {
        render(<CopilotConversationStarters />, {
            initialEntries: ['/app/ai-agent/shopify/acme/skills'],
        })

        expect(getLastRegisteredSuggestions().map((s) => s.message)).toEqual([
            'Audit my skills and tell me which ones to improve',
            'Optimize my AI Agent setup',
        ])
    })

    it('registers the detail-view starters on a Skill detail view', () => {
        render(<CopilotConversationStarters />, {
            initialEntries: ['/app/ai-agent/shopify/acme/skills/42'],
        })

        expect(getLastRegisteredSuggestions().map((s) => s.message)).toEqual([
            'Improve this skill based on recent handovers',
            "Find gaps in this skill's instructions",
            'Optimize my AI Agent setup',
        ])
    })

    it('registers the Knowledge migration starter on the Knowledge page', () => {
        render(<CopilotConversationStarters />, {
            initialEntries: ['/app/ai-agent/shopify/acme/knowledge/sources'],
        })

        expect(getLastRegisteredSuggestions().map((s) => s.message)).toEqual([
            'Help me migrate my guidance to skills',
            'Optimize my AI Agent setup',
        ])
    })

    it('registers no starters on a page marked as empty in the spec', () => {
        render(<CopilotConversationStarters />, {
            initialEntries: ['/app/ai-agent/shopify/acme/test'],
        })

        expect(getLastRegisteredSuggestions()).toEqual([])
    })

    it('uses the before-first-message availability', () => {
        render(<CopilotConversationStarters />, {
            initialEntries: ['/app/ai-agent/shopify/acme/skills'],
        })

        expect(getLastRegisteredConfig()?.available).toBe(
            'before-first-message',
        )
    })
})
