import { getCopilotConversationStarters } from './conversationStarters'

const SHOP_PREFIX = '/app/ai-agent/shopify/acme'

describe('getCopilotConversationStarters', () => {
    describe('outside the AI Agent section', () => {
        it.each([
            '/',
            '/app',
            '/app/ticket/42',
            '/app/help-center/articles',
            '/app/stats/ai-agent',
            '/app/ai-agent',
            '/app/ai-agent/shopify',
        ])('returns no starters for %s', (pathname) => {
            expect(getCopilotConversationStarters(pathname)).toEqual([])
        })
    })

    describe('Analyze section', () => {
        it.each([SHOP_PREFIX, `${SHOP_PREFIX}/`, `${SHOP_PREFIX}/intents`])(
            'shows only the universal starter on %s',
            (pathname) => {
                const starters = getCopilotConversationStarters(pathname)
                expect(starters).toHaveLength(1)
                expect(starters[0].message).toBe('Optimize my AI Agent setup')
            },
        )

        it.each([
            `${SHOP_PREFIX}/opportunities`,
            `${SHOP_PREFIX}/opportunities/123`,
        ])('shows no starters on %s (Opportunities is empty)', (pathname) => {
            expect(getCopilotConversationStarters(pathname)).toEqual([])
        })
    })

    describe('Skills section', () => {
        it('shows the audit starter and universal on the Skills list view', () => {
            const starters = getCopilotConversationStarters(
                `${SHOP_PREFIX}/skills`,
            )
            expect(starters.map((s) => s.message)).toEqual([
                'Audit my skills and tell me which ones to improve',
                'Optimize my AI Agent setup',
            ])
        })

        it.each([`${SHOP_PREFIX}/skills/new`, `${SHOP_PREFIX}/skills/wizard`])(
            'shows only the universal starter on %s',
            (pathname) => {
                const starters = getCopilotConversationStarters(pathname)
                expect(starters.map((s) => s.message)).toEqual([
                    'Optimize my AI Agent setup',
                ])
            },
        )

        it('shows the detail-view starters on the Skills detail view', () => {
            const starters = getCopilotConversationStarters(
                `${SHOP_PREFIX}/skills/42`,
            )
            expect(starters.map((s) => s.message)).toEqual([
                'Improve this skill based on recent handovers',
                "Find gaps in this skill's instructions",
                'Optimize my AI Agent setup',
            ])
        })
    })

    describe('Knowledge section', () => {
        it.each([
            `${SHOP_PREFIX}/knowledge`,
            `${SHOP_PREFIX}/knowledge/sources`,
            `${SHOP_PREFIX}/knowledge/guidance/7`,
            `${SHOP_PREFIX}/knowledge/sources/questions-content`,
        ])('shows the migration starter and universal on %s', (pathname) => {
            const starters = getCopilotConversationStarters(pathname)
            expect(starters.map((s) => s.message)).toEqual([
                'Help me migrate my guidance to skills',
                'Optimize my AI Agent setup',
            ])
        })
    })

    describe('Support Actions section', () => {
        it.each([
            `${SHOP_PREFIX}/actions`,
            `${SHOP_PREFIX}/actions/new`,
            `${SHOP_PREFIX}/actions/edit/wf_abc`,
            `${SHOP_PREFIX}/actions/templates`,
        ])('shows the actions starter and universal on %s', (pathname) => {
            const starters = getCopilotConversationStarters(pathname)
            expect(starters.map((s) => s.message)).toEqual([
                'What actions can I use or create to improve automation',
                'Optimize my AI Agent setup',
            ])
        })
    })

    describe('empty pages', () => {
        it.each([
            `${SHOP_PREFIX}/products`,
            `${SHOP_PREFIX}/products/123`,
            `${SHOP_PREFIX}/sales`,
            `${SHOP_PREFIX}/sales/customer-engagement`,
            `${SHOP_PREFIX}/test`,
            `${SHOP_PREFIX}/deploy/email`,
            `${SHOP_PREFIX}/deploy/chat`,
            `${SHOP_PREFIX}/settings`,
            `${SHOP_PREFIX}/settings/preview`,
            `${SHOP_PREFIX}/tone-of-voice`,
        ])('shows no starters on %s', (pathname) => {
            expect(getCopilotConversationStarters(pathname)).toEqual([])
        })
    })

    it('falls back to the universal starter on any unlisted AI Agent sub-path', () => {
        const starters = getCopilotConversationStarters(
            `${SHOP_PREFIX}/some-future-page`,
        )
        expect(starters.map((s) => s.message)).toEqual([
            'Optimize my AI Agent setup',
        ])
    })

    it('ignores query strings and hash fragments', () => {
        const starters = getCopilotConversationStarters(
            `${SHOP_PREFIX}/skills?filter=active#top`,
        )
        expect(starters.map((s) => s.message)).toEqual([
            'Audit my skills and tell me which ones to improve',
            'Optimize my AI Agent setup',
        ])
    })

    it('uses message text as the title for every starter', () => {
        const allPaths = [
            `${SHOP_PREFIX}/skills`,
            `${SHOP_PREFIX}/skills/42`,
            `${SHOP_PREFIX}/knowledge`,
            `${SHOP_PREFIX}/actions`,
            `${SHOP_PREFIX}/intents`,
        ]
        for (const pathname of allPaths) {
            for (const starter of getCopilotConversationStarters(pathname)) {
                expect(starter.title).toBe(starter.message)
            }
        }
    })
})
