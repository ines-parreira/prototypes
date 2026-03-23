import { describe, expect, it } from 'vitest'

import {
    addCanduLinkForValidViewOrSection,
    EmptyViewsState,
    getViewAwareEmptyStateMessage,
    isInboxView,
    systemViewIcons,
} from '../views'

type ViewOrSectionLike = {
    decoration?: {
        emoji?: string
    }
    name: string
}

const createElement = (overrides: Partial<ViewOrSectionLike> = {}) => ({
    decoration: {},
    name: 'Generic',
    ...overrides,
})

describe('addCanduLinkForValidViewOrSection', () => {
    const validCases = [
        { name: 'AI Agent', emoji: '✨', expectedSlug: 'ai-agent' },
        { name: 'Handover', emoji: '🧑‍💻', expectedSlug: 'handover' },
        { name: 'Close', emoji: '✅', expectedSlug: 'close' },
        { name: 'All', emoji: '📂', expectedSlug: 'all' },
    ]

    describe('valid cases', () => {
        validCases.forEach(({ name, emoji, expectedSlug }) => {
            it(`returns the correct slug for a view named "${name}"`, () => {
                const result = addCanduLinkForValidViewOrSection(
                    'view',
                    createElement({
                        decoration: { emoji },
                        name,
                    }),
                )

                expect(result).toBe(
                    `ticket-navbar-ai-agent-view-link-${expectedSlug}`,
                )
            })

            it(`returns the correct slug for a section named "${name}"`, () => {
                const result = addCanduLinkForValidViewOrSection(
                    'section',
                    createElement({
                        decoration: { emoji },
                        name,
                    }),
                )

                expect(result).toBe(
                    `ticket-navbar-ai-agent-section-link-${expectedSlug}`,
                )
            })
        })
    })

    describe('invalid cases', () => {
        it('returns null when the name is not valid', () => {
            const result = addCanduLinkForValidViewOrSection(
                'view',
                createElement({
                    decoration: { emoji: '✨' },
                    name: 'Not Valid',
                }),
            )

            expect(result).toBeNull()
        })

        it('returns null when the emoji is not valid', () => {
            const result = addCanduLinkForValidViewOrSection(
                'view',
                createElement({
                    decoration: { emoji: '😎' },
                    name: 'AI Agent',
                }),
            )

            expect(result).toBeNull()
        })

        it('returns null when decoration is missing', () => {
            const result = addCanduLinkForValidViewOrSection(
                'section',
                createElement({
                    decoration: undefined,
                    name: 'AI Agent',
                }),
            )

            expect(result).toBeNull()
        })
    })
})

describe('systemViewIcons', () => {
    it('exposes the known system view icon mapping', () => {
        expect(systemViewIcons).toEqual({
            all: 'all_inbox',
            closed: 'check',
            inbox: 'inbox',
            snoozed: 'snooze',
            spam: 'error_outline',
            trash: 'delete',
            unassigned: 'assignment_ind',
        })
    })
})

describe('getViewAwareEmptyStateMessage', () => {
    it('returns the default empty state copy while inbox state is unresolved', () => {
        expect(
            getViewAwareEmptyStateMessage({
                kind: EmptyViewsState.Empty,
            }),
        ).toEqual({
            heading: 'No open tickets',
            subText: "You've closed all your tickets!",
        })
    })

    it('returns the inbox empty state copy for the inbox view', () => {
        expect(
            getViewAwareEmptyStateMessage({
                kind: EmptyViewsState.Empty,
                isInboxView: true,
            }),
        ).toEqual({
            heading: 'No open tickets',
            subText: "You've closed all your tickets!",
        })
    })

    it('returns the filtered empty state copy for non-inbox views', () => {
        expect(
            getViewAwareEmptyStateMessage({
                kind: EmptyViewsState.Empty,
                isInboxView: false,
            }),
        ).toEqual({
            heading: 'No tickets',
            subText: 'There are no tickets matching these filters',
        })
    })

    it('returns the invalid filters copy', () => {
        expect(
            getViewAwareEmptyStateMessage({
                kind: EmptyViewsState.InvalidFilters,
            }),
        ).toEqual({
            heading: 'Invalid filters',
            subText:
                'This view is deactivated as at least one filter is invalid.',
        })
    })
})

describe('isInboxView', () => {
    it('returns true for the inbox slug', () => {
        expect(isInboxView({ slug: 'inbox' })).toBe(true)
    })

    it('returns true for the system Inbox view without relying on slug', () => {
        expect(isInboxView({ category: 'system', name: 'Inbox' })).toBe(true)
    })

    it('returns false for custom views without a slug', () => {
        expect(isInboxView({ category: 'user', name: 'My view' })).toBe(false)
    })

    it('returns false for non-inbox system views', () => {
        expect(
            isInboxView({ category: 'system', name: 'All', slug: 'all' }),
        ).toBe(false)
    })
})
