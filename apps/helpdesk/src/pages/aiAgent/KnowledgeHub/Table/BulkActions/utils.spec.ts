import { KnowledgeType } from '../../types'
import type { GroupedKnowledgeItem } from '../../types'
import { ButtonRenderMode } from './types'
import {
    getAIAgentButtonConfig,
    getDeleteButtonMode,
    getDuplicateButtonMode,
    TOOLTIP_MESSAGES,
} from './utils'

describe('BulkActions utils', () => {
    describe('getDuplicateButtonMode', () => {
        it('returns Visible when all selected items are Guidance', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.Guidance,
                    id: '1',
                    title: 'G1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    type: KnowledgeType.Guidance,
                    id: '2',
                    title: 'G2',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            expect(getDuplicateButtonMode(items, true)).toBe(
                ButtonRenderMode.Visible,
            )
            expect(getDuplicateButtonMode(items, false)).toBe(
                ButtonRenderMode.Visible,
            )
        })

        it('returns DisabledWithTooltip in All content view with mixed types', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.Guidance,
                    id: '1',
                    title: 'G1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    type: KnowledgeType.FAQ,
                    id: '2',
                    title: 'F1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            expect(getDuplicateButtonMode(items, true)).toBe(
                ButtonRenderMode.DisabledWithTooltip,
            )
        })

        it('returns DisabledWithTooltip in All content view with only FAQ items', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.FAQ,
                    id: '1',
                    title: 'F1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            expect(getDuplicateButtonMode(items, true)).toBe(
                ButtonRenderMode.DisabledWithTooltip,
            )
        })

        it('returns Hidden in individual view with non-Guidance items', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.FAQ,
                    id: '1',
                    title: 'F1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            expect(getDuplicateButtonMode(items, false)).toBe(
                ButtonRenderMode.Hidden,
            )
        })

        it('returns DisabledWithTooltip when empty selection in All content view', () => {
            expect(getDuplicateButtonMode([], true)).toBe(
                ButtonRenderMode.DisabledWithTooltip,
            )
        })

        it('returns Hidden when empty selection in individual view', () => {
            expect(getDuplicateButtonMode([], false)).toBe(
                ButtonRenderMode.Hidden,
            )
        })
    })

    describe('getDeleteButtonMode', () => {
        it('returns Visible when FAQ items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.FAQ,
                    id: '1',
                    title: 'F1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            expect(getDeleteButtonMode(items, true)).toBe(
                ButtonRenderMode.Visible,
            )
            expect(getDeleteButtonMode(items, false)).toBe(
                ButtonRenderMode.Visible,
            )
        })

        it('returns Visible when Guidance items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.Guidance,
                    id: '1',
                    title: 'G1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            expect(getDeleteButtonMode(items, true)).toBe(
                ButtonRenderMode.Visible,
            )
            expect(getDeleteButtonMode(items, false)).toBe(
                ButtonRenderMode.Visible,
            )
        })

        it('returns DisabledWithTooltip in All content view with Domain snippets', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.Domain,
                    id: '1',
                    title: 'D1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            expect(getDeleteButtonMode(items, true)).toBe(
                ButtonRenderMode.DisabledWithTooltip,
            )
        })

        it('returns DisabledWithTooltip in All content view with Document snippets', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.Document,
                    id: '1',
                    title: 'Doc1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            expect(getDeleteButtonMode(items, true)).toBe(
                ButtonRenderMode.DisabledWithTooltip,
            )
        })

        it('returns DisabledWithTooltip in All content view with URL snippets', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.URL,
                    id: '1',
                    title: 'URL1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            expect(getDeleteButtonMode(items, true)).toBe(
                ButtonRenderMode.DisabledWithTooltip,
            )
        })

        it('returns DisabledWithTooltip in All content view with mixed FAQ and snippets', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.FAQ,
                    id: '1',
                    title: 'F1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    type: KnowledgeType.Domain,
                    id: '2',
                    title: 'D1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            expect(getDeleteButtonMode(items, true)).toBe(
                ButtonRenderMode.DisabledWithTooltip,
            )
        })

        it('returns Hidden in individual view with Domain items', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.Domain,
                    id: '1',
                    title: 'D1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            expect(getDeleteButtonMode(items, false)).toBe(
                ButtonRenderMode.Hidden,
            )
        })

        it('returns Hidden in individual view with Document items', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.Document,
                    id: '1',
                    title: 'Doc1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            expect(getDeleteButtonMode(items, false)).toBe(
                ButtonRenderMode.Hidden,
            )
        })
    })

    describe('getAIAgentButtonConfig', () => {
        it('returns Hidden mode when no items are selected', () => {
            const result = getAIAgentButtonConfig([])

            expect(result.mode).toBe(ButtonRenderMode.Hidden)
            expect(result.tooltipMessage).toBeUndefined()
        })

        it('returns Visible mode when only Guidance items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.Guidance,
                    id: '1',
                    title: 'Guidance 1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    type: KnowledgeType.Guidance,
                    id: '2',
                    title: 'Guidance 2',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            const result = getAIAgentButtonConfig(items)

            expect(result.mode).toBe(ButtonRenderMode.Visible)
            expect(result.tooltipMessage).toBeUndefined()
        })

        it('returns Visible mode when only Document items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.Document,
                    id: '1',
                    title: 'Doc 1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            const result = getAIAgentButtonConfig(items)

            expect(result.mode).toBe(ButtonRenderMode.Visible)
            expect(result.tooltipMessage).toBeUndefined()
        })

        it('returns Visible mode when only URL items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.URL,
                    id: '1',
                    title: 'URL 1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            const result = getAIAgentButtonConfig(items)

            expect(result.mode).toBe(ButtonRenderMode.Visible)
            expect(result.tooltipMessage).toBeUndefined()
        })

        it('returns Visible mode when only Domain items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.Domain,
                    id: '1',
                    title: 'Domain 1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            const result = getAIAgentButtonConfig(items)

            expect(result.mode).toBe(ButtonRenderMode.Visible)
            expect(result.tooltipMessage).toBeUndefined()
        })

        it('returns Visible mode when mixed Guidance and Document items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.Guidance,
                    id: '1',
                    title: 'Guidance 1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    type: KnowledgeType.Document,
                    id: '2',
                    title: 'Doc 1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            const result = getAIAgentButtonConfig(items)

            expect(result.mode).toBe(ButtonRenderMode.Visible)
            expect(result.tooltipMessage).toBeUndefined()
        })

        it('returns DisabledWithTooltip mode when only FAQ items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.FAQ,
                    id: '1',
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            const result = getAIAgentButtonConfig(items)

            expect(result.mode).toBe(ButtonRenderMode.DisabledWithTooltip)
            expect(result.tooltipMessage).toBe(TOOLTIP_MESSAGES.aiAgentOnlyFAQ)
        })

        it('returns DisabledWithTooltip mode when multiple FAQ items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.FAQ,
                    id: '1',
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    type: KnowledgeType.FAQ,
                    id: '2',
                    title: 'FAQ 2',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            const result = getAIAgentButtonConfig(items)

            expect(result.mode).toBe(ButtonRenderMode.DisabledWithTooltip)
            expect(result.tooltipMessage).toBe(TOOLTIP_MESSAGES.aiAgentOnlyFAQ)
        })

        it('returns DisabledWithTooltip mode when FAQ and Guidance items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.FAQ,
                    id: '1',
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    type: KnowledgeType.Guidance,
                    id: '2',
                    title: 'Guidance 1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            const result = getAIAgentButtonConfig(items)

            expect(result.mode).toBe(ButtonRenderMode.DisabledWithTooltip)
            expect(result.tooltipMessage).toBe(TOOLTIP_MESSAGES.aiAgentMixedFAQ)
        })

        it('returns DisabledWithTooltip mode when FAQ and Document items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.FAQ,
                    id: '1',
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    type: KnowledgeType.Document,
                    id: '2',
                    title: 'Doc 1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            const result = getAIAgentButtonConfig(items)

            expect(result.mode).toBe(ButtonRenderMode.DisabledWithTooltip)
            expect(result.tooltipMessage).toBe(TOOLTIP_MESSAGES.aiAgentMixedFAQ)
        })

        it('returns DisabledWithTooltip mode when FAQ, Guidance, and Document items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.FAQ,
                    id: '1',
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    type: KnowledgeType.Guidance,
                    id: '2',
                    title: 'Guidance 1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    type: KnowledgeType.Document,
                    id: '3',
                    title: 'Doc 1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            const result = getAIAgentButtonConfig(items)

            expect(result.mode).toBe(ButtonRenderMode.DisabledWithTooltip)
            expect(result.tooltipMessage).toBe(TOOLTIP_MESSAGES.aiAgentMixedFAQ)
        })
    })
})
