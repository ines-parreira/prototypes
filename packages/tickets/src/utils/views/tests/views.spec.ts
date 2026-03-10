import { describe, expect, it } from 'vitest'

import { addCanduLinkForValidViewOrSection, systemViewIcons } from '../views'

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
