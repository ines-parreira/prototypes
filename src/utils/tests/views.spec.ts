import { OrderDirection } from 'models/api/types'
import { Section } from 'models/section/types'
import { View, ViewType, ViewVisibility } from 'models/view/types'
import { addCanduLinkForValidViewOrSection } from 'utils/views'

describe('addCanduLinkForValidViewOrSection', () => {
    // Base helper for creating a generic View object.
    const createView = (overrides: Partial<View> = {}): View => ({
        id: 1,
        name: 'Generic View',
        decoration: {}, // generic, no specific emoji by default
        slug: 'generic-view',
        created_datetime: new Date().toISOString(),
        deactivated_datetime: null,
        fields: [],
        filters: '',
        filters_ast: {},
        order_by: 'id' as any,
        order_dir: OrderDirection.Asc,
        search: null,
        section_id: null,
        shared_with_teams: [],
        shared_with_users: [],
        category: undefined,
        type: ViewType.All,
        uri: '',
        visibility: ViewVisibility.Public,
        with_highlights: false,
        ...overrides,
    })

    // Base helper for creating a generic Section object.
    const createSection = (overrides: Partial<Section> = {}): Section => ({
        id: 1,
        name: 'Generic Section',
        decoration: {}, // generic decoration by default
        private: false, // required boolean property
        created_datetime: new Date().toISOString(),
        updated_datetime: new Date().toISOString(),
        uri: '',
        ...overrides,
    })

    describe('Valid cases', () => {
        const validCases = [
            { name: 'AI Agent', emoji: '✨', expectedSlug: 'ai-agent' },
            { name: 'Handover', emoji: '🧑‍💻', expectedSlug: 'handover' },
            { name: 'Close', emoji: '✅', expectedSlug: 'close' },
            { name: 'All', emoji: '📂', expectedSlug: 'all' },
        ]

        validCases.forEach(({ name, emoji, expectedSlug }) => {
            it(`returns correct slug for view with name "${name}" and emoji "${emoji}"`, () => {
                const view = createView({ name, decoration: { emoji } })
                const result = addCanduLinkForValidViewOrSection('view', view)
                expect(result).toBe(
                    `ticket-navbar-ai-agent-view-link-${expectedSlug}`,
                )
            })

            it(`returns correct slug for section with name "${name}" and emoji "${emoji}"`, () => {
                const section = createSection({ name, decoration: { emoji } })
                const result = addCanduLinkForValidViewOrSection(
                    'section',
                    section,
                )
                expect(result).toBe(
                    `ticket-navbar-ai-agent-section-link-${expectedSlug}`,
                )
            })
        })
    })

    describe('Invalid cases', () => {
        it('returns null when view name is not valid', () => {
            const view = createView({
                name: 'Not Valid',
                decoration: { emoji: '✨' },
            })
            const result = addCanduLinkForValidViewOrSection('view', view)
            expect(result).toBeNull()
        })

        it('returns null when view emoji is not valid', () => {
            const view = createView({
                name: 'AI Agent',
                decoration: { emoji: '😎' },
            })
            const result = addCanduLinkForValidViewOrSection('view', view)
            expect(result).toBeNull()
        })

        it('returns null when section name is not valid', () => {
            const section = createSection({
                name: 'Invalid',
                decoration: { emoji: '✨' },
            })
            const result = addCanduLinkForValidViewOrSection('section', section)
            expect(result).toBeNull()
        })

        it('returns null when section emoji is not valid', () => {
            const section = createSection({
                name: 'AI Agent',
                decoration: { emoji: '🚫' },
            })
            const result = addCanduLinkForValidViewOrSection('section', section)
            expect(result).toBeNull()
        })

        it('returns null when decoration is missing for view', () => {
            const view = createView({ name: 'AI Agent', decoration: undefined })
            const result = addCanduLinkForValidViewOrSection('view', view)
            expect(result).toBeNull()
        })

        it('returns null when decoration is missing for section', () => {
            const section = createSection({
                name: 'AI Agent',
                decoration: undefined,
            })
            const result = addCanduLinkForValidViewOrSection('section', section)
            expect(result).toBeNull()
        })
    })
})
