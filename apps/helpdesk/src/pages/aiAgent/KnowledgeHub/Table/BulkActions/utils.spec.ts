import {
    buildDuplicateNotificationMessage,
    cleanStoreName,
    createStoreLink,
    isCurrentStore,
} from '../../../components/KnowledgeEditor/shared/DuplicateGuidance/utils'
import type {
    FilteredKnowledgeHubArticle,
    GroupedKnowledgeItem,
} from '../../types'
import { KnowledgeType } from '../../types'
import { ButtonRenderMode } from './types'
import {
    getAIAgentButtonConfig,
    getBulkEnableButtonConfig,
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
            expect(getDuplicateButtonMode(items, true)).toEqual({
                mode: ButtonRenderMode.Visible,
            })
            expect(getDuplicateButtonMode(items, false)).toEqual({
                mode: ButtonRenderMode.Visible,
            })
        })

        it('returns DisabledWithTooltip with FAQ message when only FAQ items are mixed with Guidance', () => {
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
            expect(getDuplicateButtonMode(items, true)).toEqual({
                mode: ButtonRenderMode.DisabledWithTooltip,
                tooltipMessage: TOOLTIP_MESSAGES.duplicateWithFAQ,
            })
        })

        it('returns DisabledWithTooltip with FAQ message when only FAQ items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.FAQ,
                    id: '1',
                    title: 'F1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            expect(getDuplicateButtonMode(items, true)).toEqual({
                mode: ButtonRenderMode.DisabledWithTooltip,
                tooltipMessage: TOOLTIP_MESSAGES.duplicateWithFAQ,
            })
        })

        it('returns DisabledWithTooltip with snippets message when Document items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.Guidance,
                    id: '1',
                    title: 'G1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    type: KnowledgeType.Document,
                    id: '2',
                    title: 'Doc1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            expect(getDuplicateButtonMode(items, true)).toEqual({
                mode: ButtonRenderMode.DisabledWithTooltip,
                tooltipMessage: TOOLTIP_MESSAGES.duplicateWithSnippets,
            })
        })

        it('returns DisabledWithTooltip with snippets message when URL items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.Guidance,
                    id: '1',
                    title: 'G1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    type: KnowledgeType.URL,
                    id: '2',
                    title: 'URL1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            expect(getDuplicateButtonMode(items, true)).toEqual({
                mode: ButtonRenderMode.DisabledWithTooltip,
                tooltipMessage: TOOLTIP_MESSAGES.duplicateWithSnippets,
            })
        })

        it('returns DisabledWithTooltip with snippets message when Domain items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.Guidance,
                    id: '1',
                    title: 'G1',
                    lastUpdatedAt: '2024-01-01',
                },
                {
                    type: KnowledgeType.Domain,
                    id: '2',
                    title: 'Domain1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            expect(getDuplicateButtonMode(items, true)).toEqual({
                mode: ButtonRenderMode.DisabledWithTooltip,
                tooltipMessage: TOOLTIP_MESSAGES.duplicateWithSnippets,
            })
        })

        it('prioritizes snippets message when both FAQ and snippets are selected', () => {
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
                {
                    type: KnowledgeType.Document,
                    id: '3',
                    title: 'Doc1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]
            expect(getDuplicateButtonMode(items, true)).toEqual({
                mode: ButtonRenderMode.DisabledWithTooltip,
                tooltipMessage: TOOLTIP_MESSAGES.duplicateWithSnippets,
            })
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
            expect(getDuplicateButtonMode(items, false)).toEqual({
                mode: ButtonRenderMode.Hidden,
            })
        })

        it('returns DisabledWithTooltip with snippets message when empty selection in All content view', () => {
            expect(getDuplicateButtonMode([], true)).toEqual({
                mode: ButtonRenderMode.DisabledWithTooltip,
                tooltipMessage: TOOLTIP_MESSAGES.duplicateWithSnippets,
            })
        })

        it('returns Hidden when empty selection in individual view', () => {
            expect(getDuplicateButtonMode([], false)).toEqual({
                mode: ButtonRenderMode.Hidden,
            })
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
                    draftVersionId: 1,
                    publishedVersionId: 1,
                },
                {
                    type: KnowledgeType.Guidance,
                    id: '2',
                    title: 'Guidance 2',
                    lastUpdatedAt: '2024-01-01',
                    draftVersionId: 1,
                    publishedVersionId: 1,
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
                    draftVersionId: 1,
                    publishedVersionId: 1,
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

        it('returns Visible mode when only published FAQ items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.FAQ,
                    id: '1',
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-01',
                    draftVersionId: 1,
                    publishedVersionId: 1,
                },
            ]

            const result = getAIAgentButtonConfig(items)

            expect(result.mode).toBe(ButtonRenderMode.Visible)
            expect(result.tooltipMessage).toBeUndefined()
        })

        it('returns Visible mode when multiple published FAQ items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.FAQ,
                    id: '1',
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-01',
                    draftVersionId: 1,
                    publishedVersionId: 1,
                },
                {
                    type: KnowledgeType.FAQ,
                    id: '2',
                    title: 'FAQ 2',
                    lastUpdatedAt: '2024-01-01',
                    draftVersionId: 1,
                    publishedVersionId: 1,
                },
            ]

            const result = getAIAgentButtonConfig(items)

            expect(result.mode).toBe(ButtonRenderMode.Visible)
            expect(result.tooltipMessage).toBeUndefined()
        })

        it('returns Visible mode when published FAQ and published Guidance items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.FAQ,
                    id: '1',
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-01',
                    draftVersionId: 1,
                    publishedVersionId: 1,
                },
                {
                    type: KnowledgeType.Guidance,
                    id: '2',
                    title: 'Guidance 1',
                    lastUpdatedAt: '2024-01-01',
                    draftVersionId: 1,
                    publishedVersionId: 1,
                },
            ]

            const result = getAIAgentButtonConfig(items)

            expect(result.mode).toBe(ButtonRenderMode.Visible)
            expect(result.tooltipMessage).toBeUndefined()
        })

        it('returns Visible mode when published FAQ and Document items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.FAQ,
                    id: '1',
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-01',
                    draftVersionId: 1,
                    publishedVersionId: 1,
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

        it('returns Visible mode when published FAQ, published Guidance, and Document items are selected', () => {
            const items: GroupedKnowledgeItem[] = [
                {
                    type: KnowledgeType.FAQ,
                    id: '1',
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-01',
                    draftVersionId: 1,
                    publishedVersionId: 1,
                },
                {
                    type: KnowledgeType.Guidance,
                    id: '2',
                    title: 'Guidance 1',
                    lastUpdatedAt: '2024-01-01',
                    draftVersionId: 1,
                    publishedVersionId: 1,
                },
                {
                    type: KnowledgeType.Document,
                    id: '3',
                    title: 'Doc 1',
                    lastUpdatedAt: '2024-01-01',
                },
            ]

            const result = getAIAgentButtonConfig(items)

            expect(result.mode).toBe(ButtonRenderMode.Visible)
            expect(result.tooltipMessage).toBeUndefined()
        })

        describe('draft FAQ validation', () => {
            it('returns DisabledWithTooltip when only never-published FAQ is selected', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        type: KnowledgeType.FAQ,
                        id: '1',
                        title: 'Draft FAQ 1',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 1,
                        publishedVersionId: null,
                    },
                ]

                const result = getAIAgentButtonConfig(items)

                expect(result.mode).toBe(ButtonRenderMode.DisabledWithTooltip)
                expect(result.tooltipMessage).toBe(
                    TOOLTIP_MESSAGES.aiAgentDraftFAQ,
                )
            })

            it('returns DisabledWithTooltip when FAQ has unpublished changes', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        type: KnowledgeType.FAQ,
                        id: '1',
                        title: 'Draft FAQ 1',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 2,
                        publishedVersionId: 1,
                    },
                ]

                const result = getAIAgentButtonConfig(items)

                expect(result.mode).toBe(ButtonRenderMode.DisabledWithTooltip)
                expect(result.tooltipMessage).toBe(
                    TOOLTIP_MESSAGES.aiAgentDraftFAQ,
                )
            })

            it('returns DisabledWithTooltip when FAQ has no version IDs', () => {
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
                expect(result.tooltipMessage).toBe(
                    TOOLTIP_MESSAGES.aiAgentDraftFAQ,
                )
            })

            it('returns DisabledWithTooltip when mix of published and draft FAQ is selected', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        type: KnowledgeType.FAQ,
                        id: '1',
                        title: 'Published FAQ',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 1,
                        publishedVersionId: 1,
                    },
                    {
                        type: KnowledgeType.FAQ,
                        id: '2',
                        title: 'Draft FAQ',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 1,
                        publishedVersionId: null,
                    },
                ]

                const result = getAIAgentButtonConfig(items)

                expect(result.mode).toBe(ButtonRenderMode.DisabledWithTooltip)
                expect(result.tooltipMessage).toBe(
                    TOOLTIP_MESSAGES.aiAgentDraftFAQ,
                )
            })

            it('returns DisabledWithTooltip when draft FAQ and published Guidance are selected', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        type: KnowledgeType.FAQ,
                        id: '1',
                        title: 'Draft FAQ',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 1,
                        publishedVersionId: null,
                    },
                    {
                        type: KnowledgeType.Guidance,
                        id: '2',
                        title: 'Published Guidance',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 1,
                        publishedVersionId: 1,
                    },
                ]

                const result = getAIAgentButtonConfig(items)

                expect(result.mode).toBe(ButtonRenderMode.DisabledWithTooltip)
                expect(result.tooltipMessage).toBe(
                    TOOLTIP_MESSAGES.aiAgentDraftFAQ,
                )
            })

            it('returns DisabledWithTooltip with combined message when draft FAQ and draft Guidance are selected', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        type: KnowledgeType.FAQ,
                        id: '1',
                        title: 'Draft FAQ',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 1,
                        publishedVersionId: null,
                    },
                    {
                        type: KnowledgeType.Guidance,
                        id: '2',
                        title: 'Draft Guidance',
                        lastUpdatedAt: '2024-01-01',
                        draftVersionId: 2,
                        publishedVersionId: 1,
                    },
                ]

                const result = getAIAgentButtonConfig(items)

                expect(result.mode).toBe(ButtonRenderMode.DisabledWithTooltip)
                expect(result.tooltipMessage).toBe(
                    TOOLTIP_MESSAGES.aiAgentDraftAndFAQ,
                )
            })
        })
    })

    describe('DuplicateSelect utils', () => {
        describe('cleanStoreName', () => {
            it('removes " (current)" suffix from store name', () => {
                expect(cleanStoreName('store-1 (current)')).toBe('store-1')
            })

            it('returns unchanged name when no suffix present', () => {
                expect(cleanStoreName('store-1')).toBe('store-1')
            })

            it('handles stores with spaces in name', () => {
                expect(cleanStoreName('my store (current)')).toBe('my store')
            })

            it('only removes suffix at the end', () => {
                expect(cleanStoreName('(current) store-1')).toBe(
                    '(current) store-1',
                )
            })
        })

        describe('isCurrentStore', () => {
            it('returns true when store name matches shopName', () => {
                expect(isCurrentStore('store-1', 'store-1')).toBe(true)
            })

            it('returns true when store name matches shopName with (current) suffix', () => {
                expect(isCurrentStore('store-1 (current)', 'store-1')).toBe(
                    true,
                )
            })

            it('returns false when store name does not match shopName', () => {
                expect(isCurrentStore('store-2', 'store-1')).toBe(false)
            })

            it('returns false when shopName is undefined', () => {
                expect(isCurrentStore('store-1', undefined)).toBe(false)
            })

            it('returns false when store name is different from shopName with (current)', () => {
                expect(isCurrentStore('store-2 (current)', 'store-1')).toBe(
                    false,
                )
            })
        })

        describe('createStoreLink', () => {
            it('creates HTML link with clean store name', () => {
                const result = createStoreLink('store-1')
                expect(result).toBe(
                    '<a href="/app/ai-agent/shopify/store-1/knowledge">store-1</a>',
                )
            })

            it('removes (current) suffix from store name in link', () => {
                const result = createStoreLink('store-1 (current)')
                expect(result).toBe(
                    '<a href="/app/ai-agent/shopify/store-1/knowledge">store-1</a>',
                )
            })

            it('handles store names with spaces', () => {
                const result = createStoreLink('my store')
                expect(result).toBe(
                    '<a href="/app/ai-agent/shopify/my store/knowledge">my store</a>',
                )
            })
        })

        describe('buildDuplicateNotificationMessage', () => {
            it('returns simple message when only current store is selected', () => {
                const stores = [{ name: 'store-1 (current)' }]
                const result = buildDuplicateNotificationMessage(
                    stores,
                    'store-1',
                )
                expect(result).toBe('Guidance duplicated')
            })

            it('returns simple message when only current store without suffix is selected', () => {
                const stores = [{ name: 'store-1' }]
                const result = buildDuplicateNotificationMessage(
                    stores,
                    'store-1',
                )
                expect(result).toBe('Guidance duplicated')
            })

            it('returns message with links when only other stores are selected', () => {
                const stores = [{ name: 'store-2' }, { name: 'store-3' }]
                const result = buildDuplicateNotificationMessage(
                    stores,
                    'store-1',
                )
                expect(result).toContain('Guidance duplicated to')
                expect(result).toContain('store-2')
                expect(result).toContain('store-3')
                expect(result).toContain(
                    '/app/ai-agent/shopify/store-2/knowledge',
                )
                expect(result).toContain(
                    '/app/ai-agent/shopify/store-3/knowledge',
                )
            })

            it('returns combined message when current and other stores are selected', () => {
                const stores = [
                    { name: 'store-1 (current)' },
                    { name: 'store-2' },
                ]
                const result = buildDuplicateNotificationMessage(
                    stores,
                    'store-1',
                )
                expect(result).toContain('store-1')
                expect(result).toContain('store-2')
                expect(result).toContain(
                    '/app/ai-agent/shopify/store-2/knowledge',
                )
            })

            it('handles undefined shopName', () => {
                const stores = [{ name: 'store-1' }]
                const result = buildDuplicateNotificationMessage(
                    stores,
                    undefined,
                )
                expect(result).toContain('Guidance duplicated to')
                expect(result).toContain('store-1')
            })

            it('cleans store names in links', () => {
                const stores = [{ name: 'store-2 (current)' }]
                const result = buildDuplicateNotificationMessage(
                    stores,
                    'store-1',
                )
                expect(result).not.toContain('(current)')
                expect(result).toContain(
                    '/app/ai-agent/shopify/store-2/knowledge',
                )
            })
        })
    })

    describe('getBulkEnableButtonConfig', () => {
        const createMockGuidanceArticle = (
            id: number,
            visibility: 'PUBLIC' | 'UNLISTED',
        ): FilteredKnowledgeHubArticle => ({
            id,
            title: `Guidance ${id}`,
            visibility,
            draftVersionId: null,
            publishedVersionId: null,
        })

        it('returns Visible when no guidance items selected', () => {
            const guidanceArticles: FilteredKnowledgeHubArticle[] = []

            const result = getBulkEnableButtonConfig(guidanceArticles)

            expect(result.mode).toBe(ButtonRenderMode.Visible)
            expect(result.tooltipMessage).toBeUndefined()
        })

        it('returns Visible when selected guidance are already PUBLIC', () => {
            const guidanceArticles = [
                createMockGuidanceArticle(1, 'PUBLIC'),
                createMockGuidanceArticle(2, 'PUBLIC'),
            ]

            const result = getBulkEnableButtonConfig(guidanceArticles)

            expect(result.mode).toBe(ButtonRenderMode.Visible)
            expect(result.tooltipMessage).toBeUndefined()
        })

        it('returns Visible when enabling would not exceed limit', () => {
            // 95 active guidance articles
            const guidanceArticles = Array.from({ length: 95 }, (_, i) =>
                createMockGuidanceArticle(i + 10, 'PUBLIC'),
            )

            const result = getBulkEnableButtonConfig(guidanceArticles)

            expect(result.mode).toBe(ButtonRenderMode.Visible)
            expect(result.tooltipMessage).toBeUndefined()
        })

        it('returns Visible when at exactly 100 after enabling', () => {
            // 99 active guidance articles
            const guidanceArticles = Array.from({ length: 99 }, (_, i) =>
                createMockGuidanceArticle(i + 10, 'PUBLIC'),
            )

            const result = getBulkEnableButtonConfig(guidanceArticles)

            expect(result.mode).toBe(ButtonRenderMode.Visible)
            expect(result.tooltipMessage).toBeUndefined()
        })

        it('returns DisabledWithTooltip when enabling would exceed limit by 1', () => {
            // 100 active guidance articles
            const guidanceArticles = Array.from({ length: 100 }, (_, i) =>
                createMockGuidanceArticle(i + 10, 'PUBLIC'),
            )

            const result = getBulkEnableButtonConfig(guidanceArticles)

            expect(result.mode).toBe(ButtonRenderMode.DisabledWithTooltip)
            expect(result.tooltipMessage).toBe(
                "You've reached the limit of 100 enabled Guidance. Disable Guidance to enable more.",
            )
        })

        it('returns DisabledWithTooltip when enabling would exceed limit by multiple', () => {
            // 100 active guidance articles (at limit)
            const guidanceArticles = Array.from({ length: 100 }, (_, i) =>
                createMockGuidanceArticle(i + 10, 'PUBLIC'),
            )

            const result = getBulkEnableButtonConfig(guidanceArticles)

            expect(result.mode).toBe(ButtonRenderMode.DisabledWithTooltip)
            expect(result.tooltipMessage).toBe(
                "You've reached the limit of 100 enabled Guidance. Disable Guidance to enable more.",
            )
        })

        it('returns correct limit message', () => {
            // 100 active guidance articles (at limit)
            const guidanceArticles = Array.from({ length: 100 }, (_, i) =>
                createMockGuidanceArticle(i + 10, 'PUBLIC'),
            )

            const result = getBulkEnableButtonConfig(guidanceArticles)

            expect(result.tooltipMessage).toBe(
                "You've reached the limit of 100 enabled Guidance. Disable Guidance to enable more.",
            )
        })

        it('only counts PUBLIC guidance items for limit check', () => {
            // 99 PUBLIC + 1 UNLISTED = 100 total, but only 99 are active (should not be at limit)
            const guidanceArticles = [
                ...Array.from({ length: 99 }, (_, i) =>
                    createMockGuidanceArticle(i + 10, 'PUBLIC'),
                ),
                createMockGuidanceArticle(200, 'UNLISTED'),
            ]

            const result = getBulkEnableButtonConfig(guidanceArticles)

            expect(result.mode).toBe(ButtonRenderMode.Visible)
            expect(result.tooltipMessage).toBeUndefined()
        })

        it('returns disabled when at exactly the limit', () => {
            // Exactly 100 active guidance articles (at limit)
            const guidanceArticles = Array.from({ length: 100 }, (_, i) =>
                createMockGuidanceArticle(i + 10, 'PUBLIC'),
            )

            const result = getBulkEnableButtonConfig(guidanceArticles)

            expect(result.mode).toBe(ButtonRenderMode.DisabledWithTooltip)
            expect(result.tooltipMessage).toBe(
                "You've reached the limit of 100 enabled Guidance. Disable Guidance to enable more.",
            )
        })

        it('handles empty guidance articles array', () => {
            const guidanceArticles: FilteredKnowledgeHubArticle[] = []

            const result = getBulkEnableButtonConfig(guidanceArticles)

            expect(result.mode).toBe(ButtonRenderMode.Visible)
            expect(result.tooltipMessage).toBeUndefined()
        })

        it('returns disabled when over the limit', () => {
            // 101 active guidance articles (over limit)
            const guidanceArticles = Array.from({ length: 101 }, (_, i) =>
                createMockGuidanceArticle(i + 10, 'PUBLIC'),
            )

            const result = getBulkEnableButtonConfig(guidanceArticles)

            expect(result.mode).toBe(ButtonRenderMode.DisabledWithTooltip)
            expect(result.tooltipMessage).toBe(
                "You've reached the limit of 100 enabled Guidance. Disable Guidance to enable more.",
            )
        })
    })
})
