import { KnowledgeType, KnowledgeVisibility } from '../../types'
import {
    filterKnowledgeItemsBySearchTerm,
    filterKnowledgeItemsBySource,
    groupKnowledgeItemsBySource,
} from '../utils'

describe('KnowledgeHub Table Utils', () => {
    describe('groupKnowledgeItemsBySource', () => {
        it('returns ungrouped items when shouldGroup is false', () => {
            const items = [
                {
                    type: KnowledgeType.Document,
                    title: 'Item 1',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'source1',
                    id: '1',
                },
                {
                    type: KnowledgeType.FAQ,
                    title: 'Item 2',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                    source: 'source1',
                    id: '2',
                },
            ]

            const result = groupKnowledgeItemsBySource(items, false)

            expect(result).toEqual(items)
            expect(result[0].isGrouped).toBeUndefined()
        })

        it('groups items by source when shouldGroup is true', () => {
            const items = [
                {
                    type: KnowledgeType.Document,
                    title: 'Item 1',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'source1',
                    id: '1',
                },
                {
                    type: KnowledgeType.FAQ,
                    title: 'Item 2',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                    source: 'source1',
                    id: '2',
                },
            ]

            const result = groupKnowledgeItemsBySource(items, true)

            expect(result).toHaveLength(1)
            expect(result[0]).toMatchObject({
                title: 'source1',
                isGrouped: true,
                itemCount: 2,
            })
        })

        it('uses most recent lastUpdatedAt for grouped items', () => {
            const items = [
                {
                    type: KnowledgeType.Document,
                    title: 'Item 1',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'source1',
                    id: '1',
                },
                {
                    type: KnowledgeType.FAQ,
                    title: 'Item 2',
                    lastUpdatedAt: '2024-01-05T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                    source: 'source1',
                    id: '2',
                },
                {
                    type: KnowledgeType.Guidance,
                    title: 'Item 3',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'source1',
                    id: '3',
                },
            ]

            const result = groupKnowledgeItemsBySource(items, true)

            expect(result).toHaveLength(1)
            expect(result[0].type).toBe(KnowledgeType.FAQ)
            expect(result[0].lastUpdatedAt).toBe('2024-01-05T00:00:00Z')
        })

        it('keeps items without source ungrouped', () => {
            const items = [
                {
                    type: KnowledgeType.Document,
                    title: 'Item 1',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'source1',
                    id: '1',
                },
                {
                    type: KnowledgeType.FAQ,
                    title: 'Item 2',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                    id: '2',
                },
            ]

            const result = groupKnowledgeItemsBySource(items, true)

            expect(result).toHaveLength(2)
            expect(result[0].isGrouped).toBe(true)
            expect(result[1].isGrouped).toBeUndefined()
            expect(result[1].title).toBe('Item 2')
        })

        it('creates separate groups for different sources', () => {
            const items = [
                {
                    type: KnowledgeType.Document,
                    title: 'Item 1',
                    lastUpdatedAt: '2024-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'source1',
                    id: '1',
                },
                {
                    type: KnowledgeType.FAQ,
                    title: 'Item 2',
                    lastUpdatedAt: '2024-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                    source: 'source2',
                    id: '2',
                },
                {
                    type: KnowledgeType.Guidance,
                    title: 'Item 3',
                    lastUpdatedAt: '2024-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'source1',
                    id: '3',
                },
            ]

            const result = groupKnowledgeItemsBySource(items, true)

            expect(result).toHaveLength(2)
            expect(result[0].itemCount).toBe(2)
            expect(result[1].itemCount).toBe(1)
        })

        it('handles empty array', () => {
            const result = groupKnowledgeItemsBySource([], true)

            expect(result).toEqual([])
        })
    })

    describe('filterKnowledgeItemsBySource', () => {
        const items = [
            {
                type: KnowledgeType.Document,
                title: 'Item 1',
                lastUpdatedAt: '2024-01-01T00:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                source: 'source1',
                id: '1',
            },
            {
                type: KnowledgeType.FAQ,
                title: 'Item 2',
                lastUpdatedAt: '2024-01-02T00:00:00Z',
                inUseByAI: KnowledgeVisibility.UNLISTED,
                source: 'source2',
                id: '2',
            },
            {
                type: KnowledgeType.Guidance,
                title: 'Item 3',
                lastUpdatedAt: '2024-01-03T00:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                id: '3',
            },
        ]

        it('returns all items when source is undefined', () => {
            const result = filterKnowledgeItemsBySource(items, undefined)

            expect(result).toEqual(items)
        })

        it('filters items by source', () => {
            const result = filterKnowledgeItemsBySource(items, 'source1')

            expect(result).toHaveLength(1)
            expect(result[0].title).toBe('Item 1')
        })

        it('returns empty array when no items match source', () => {
            const result = filterKnowledgeItemsBySource(items, 'nonexistent')

            expect(result).toEqual([])
        })
    })

    describe('filterKnowledgeItemsBySearchTerm', () => {
        const items = [
            {
                type: KnowledgeType.Document,
                title: 'Product Manual',
                lastUpdatedAt: '2024-01-01T00:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                id: '1',
            },
            {
                type: KnowledgeType.FAQ,
                title: 'Shipping FAQ',
                lastUpdatedAt: '2024-01-02T00:00:00Z',
                inUseByAI: KnowledgeVisibility.UNLISTED,
                id: '2',
            },
            {
                type: KnowledgeType.Guidance,
                title: 'Return Policy',
                lastUpdatedAt: '2024-01-03T00:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                id: '3',
            },
        ]

        it('returns all items when searchTerm is empty', () => {
            const result = filterKnowledgeItemsBySearchTerm(items, '')

            expect(result).toEqual(items)
        })

        it('filters items by title case-insensitively', () => {
            const result = filterKnowledgeItemsBySearchTerm(items, 'faq')

            expect(result).toHaveLength(1)
            expect(result[0].title).toBe('Shipping FAQ')
        })

        it('returns multiple matching items', () => {
            const result = filterKnowledgeItemsBySearchTerm(items, 'p')

            expect(result).toHaveLength(3)
            expect(result[0].title).toBe('Product Manual')
            expect(result[1].title).toBe('Shipping FAQ')
            expect(result[2].title).toBe('Return Policy')
        })

        it('returns empty array when no items match', () => {
            const result = filterKnowledgeItemsBySearchTerm(items, 'xyz')

            expect(result).toEqual([])
        })

        it('handles partial matches', () => {
            const result = filterKnowledgeItemsBySearchTerm(items, 'ship')

            expect(result).toHaveLength(1)
            expect(result[0].title).toBe('Shipping FAQ')
        })
    })
})
