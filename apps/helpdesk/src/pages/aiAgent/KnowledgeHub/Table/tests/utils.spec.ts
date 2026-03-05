import moment from 'moment-timezone'

import { KnowledgeType, KnowledgeVisibility } from '../../types'
import type { KnowledgeItem } from '../../types'
import {
    filterKnowledgeItemsByDateRange,
    filterKnowledgeItemsByInUseByAI,
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

    describe('filterKnowledgeItemsByDateRange', () => {
        const items: KnowledgeItem[] = [
            {
                type: KnowledgeType.Document,
                title: 'Item 1',
                lastUpdatedAt: '2025-01-15T10:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                id: '1',
            },
            {
                type: KnowledgeType.FAQ,
                title: 'Item 2',
                lastUpdatedAt: '2025-02-10T10:00:00Z',
                inUseByAI: KnowledgeVisibility.UNLISTED,
                id: '2',
            },
            {
                type: KnowledgeType.Guidance,
                title: 'Item 3',
                lastUpdatedAt: '2025-03-05T10:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                id: '3',
            },
            {
                type: KnowledgeType.Document,
                title: 'Item 4',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                id: '4',
            } as KnowledgeItem,
        ]

        it('returns all items when no date range is provided', () => {
            const result = filterKnowledgeItemsByDateRange(items, null, null)

            expect(result).toEqual(items)
        })

        it('filters out items before start date', () => {
            const startDate = moment('2025-02-01')
            const result = filterKnowledgeItemsByDateRange(
                items,
                startDate,
                null,
            )

            expect(result).toHaveLength(3)
            expect(result.find((item) => item.id === '1')).toBeUndefined()
            expect(result.find((item) => item.id === '2')).toBeDefined()
            expect(result.find((item) => item.id === '3')).toBeDefined()
        })

        it('filters out items after end date', () => {
            const endDate = moment('2025-02-15')
            const result = filterKnowledgeItemsByDateRange(items, null, endDate)

            expect(result).toHaveLength(3)
            expect(result.find((item) => item.id === '1')).toBeDefined()
            expect(result.find((item) => item.id === '2')).toBeDefined()
            expect(result.find((item) => item.id === '3')).toBeUndefined()
        })

        it('filters items within date range', () => {
            const startDate = moment('2025-02-01')
            const endDate = moment('2025-02-28')
            const result = filterKnowledgeItemsByDateRange(
                items,
                startDate,
                endDate,
            )

            expect(result).toHaveLength(2)
            expect(result.find((item) => item.id === '2')).toBeDefined()
            expect(result.find((item) => item.id === '4')).toBeDefined()
        })

        it('includes items without lastUpdatedAt field', () => {
            const startDate = moment('2025-02-01')
            const endDate = moment('2025-02-28')
            const result = filterKnowledgeItemsByDateRange(
                items,
                startDate,
                endDate,
            )

            const itemWithoutDate = result.find((item) => item.id === '4')
            expect(itemWithoutDate).toBeDefined()
            expect(itemWithoutDate?.lastUpdatedAt).toBeUndefined()
        })

        it('handles items on boundary dates correctly', () => {
            const startDate = moment('2025-01-15')
            const endDate = moment('2025-03-05')
            const result = filterKnowledgeItemsByDateRange(
                items,
                startDate,
                endDate,
            )

            expect(result).toHaveLength(4)
            expect(result.find((item) => item.id === '1')).toBeDefined()
            expect(result.find((item) => item.id === '3')).toBeDefined()
        })

        it('returns empty array when no items match date range', () => {
            const startDate = moment('2025-04-01')
            const endDate = moment('2025-04-30')
            const result = filterKnowledgeItemsByDateRange(
                items,
                startDate,
                endDate,
            )

            expect(result).toHaveLength(1)
            expect(result[0].id).toBe('4')
        })

        it('handles empty array', () => {
            const startDate = moment('2025-01-01')
            const endDate = moment('2025-12-31')
            const result = filterKnowledgeItemsByDateRange(
                [],
                startDate,
                endDate,
            )

            expect(result).toEqual([])
        })

        it('compares dates at day level not time level', () => {
            const itemsWithTimes = [
                {
                    type: KnowledgeType.Document,
                    title: 'Morning Item',
                    lastUpdatedAt: '2025-01-15T08:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    id: '1',
                },
                {
                    type: KnowledgeType.FAQ,
                    title: 'Evening Item',
                    lastUpdatedAt: '2025-01-15T20:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                    id: '2',
                },
            ]

            const startDate = moment('2025-01-15')
            const endDate = moment('2025-01-15')
            const result = filterKnowledgeItemsByDateRange(
                itemsWithTimes,
                startDate,
                endDate,
            )

            expect(result).toHaveLength(2)
        })
    })

    describe('filterKnowledgeItemsByInUseByAI', () => {
        const items = [
            {
                type: KnowledgeType.Document,
                title: 'Public Item 1',
                lastUpdatedAt: '2025-01-01T00:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                id: '1',
            },
            {
                type: KnowledgeType.FAQ,
                title: 'Unlisted Item',
                lastUpdatedAt: '2025-01-02T00:00:00Z',
                inUseByAI: KnowledgeVisibility.UNLISTED,
                publishedVersionId: 1,
                draftVersionId: 1,
                id: '2',
            },
            {
                type: KnowledgeType.Guidance,
                title: 'Public Item 2',
                lastUpdatedAt: '2025-01-03T00:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                publishedVersionId: 1,
                id: '3',
            },
            {
                type: KnowledgeType.Document,
                title: 'Item Without Status',
                lastUpdatedAt: '2025-01-04T00:00:00Z',
                id: '4',
            },
        ]

        it('returns all items when filter is null', () => {
            const result = filterKnowledgeItemsByInUseByAI(items, null)

            expect(result).toEqual(items)
            expect(result).toHaveLength(4)
        })

        it('returns only PUBLIC items when filter is true', () => {
            const result = filterKnowledgeItemsByInUseByAI(items, true)

            expect(result).toHaveLength(2)
            expect(result[0].id).toBe('1')
            expect(result[0].inUseByAI).toBe(KnowledgeVisibility.PUBLIC)
            expect(result[1].id).toBe('3')
            expect(result[1].inUseByAI).toBe(KnowledgeVisibility.PUBLIC)
        })

        it('returns items not in use by AI when filter is false', () => {
            const result = filterKnowledgeItemsByInUseByAI(items, false)

            expect(result).toHaveLength(2)
            expect(result[0].id).toBe('2')
            expect(result[0].inUseByAI).toBe(KnowledgeVisibility.UNLISTED)
            expect(result[1].id).toBe('4')
        })

        it('excludes items without inUseByAI property when filtering', () => {
            const result = filterKnowledgeItemsByInUseByAI(items, true)

            expect(result.find((item) => item.id === '4')).toBeUndefined()
        })

        it('handles empty array', () => {
            const result = filterKnowledgeItemsByInUseByAI([], true)

            expect(result).toEqual([])
        })

        it('returns empty array when no items match filter', () => {
            const publicOnlyItems = [
                {
                    type: KnowledgeType.Document,
                    title: 'Public Item',
                    lastUpdatedAt: '2025-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    id: '1',
                },
            ]

            const result = filterKnowledgeItemsByInUseByAI(
                publicOnlyItems,
                false,
            )

            expect(result).toEqual([])
        })

        it('correctly identifies visibility enum values', () => {
            const mixedItems = [
                {
                    type: KnowledgeType.Document,
                    title: 'Item 1',
                    lastUpdatedAt: '2025-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    id: '1',
                },
                {
                    type: KnowledgeType.FAQ,
                    title: 'Item 2',
                    lastUpdatedAt: '2025-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                    publishedVersionId: 1,
                    draftVersionId: 1,
                    id: '2',
                },
            ]

            const publicResult = filterKnowledgeItemsByInUseByAI(
                mixedItems,
                true,
            )
            const unlistedResult = filterKnowledgeItemsByInUseByAI(
                mixedItems,
                false,
            )

            expect(publicResult).toHaveLength(1)
            expect(publicResult[0].inUseByAI).toBe('public')

            expect(unlistedResult).toHaveLength(1)
            expect(unlistedResult[0].inUseByAI).toBe('unlisted')
        })

        it('FAQ: requires both published version ID AND public visibility to be in use', () => {
            const faqItems = [
                {
                    type: KnowledgeType.FAQ,
                    title: 'Published and Public',
                    lastUpdatedAt: '2025-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    publishedVersionId: 1,
                    draftVersionId: 1,
                    id: '1',
                },
                {
                    type: KnowledgeType.FAQ,
                    title: 'Published but Unlisted',
                    lastUpdatedAt: '2025-01-02T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                    publishedVersionId: 1,
                    draftVersionId: 1,
                    id: '2',
                },
                {
                    type: KnowledgeType.FAQ,
                    title: 'Has published version with draft changes and Public',
                    lastUpdatedAt: '2025-01-03T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    publishedVersionId: 1,
                    draftVersionId: 2,
                    id: '3',
                },
                {
                    type: KnowledgeType.FAQ,
                    title: 'Never Published but Public',
                    lastUpdatedAt: '2025-01-04T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    draftVersionId: 1,
                    id: '4',
                },
            ]

            const inUseResult = filterKnowledgeItemsByInUseByAI(faqItems, true)
            const notInUseResult = filterKnowledgeItemsByInUseByAI(
                faqItems,
                false,
            )

            expect(inUseResult).toHaveLength(2)
            expect(inUseResult[0].id).toBe('1')
            expect(inUseResult[1].id).toBe('3')

            expect(notInUseResult).toHaveLength(2)
            expect(notInUseResult[0].id).toBe('2')
            expect(notInUseResult[1].id).toBe('4')
        })

        it('FAQ: published article with public visibility is in use by AI', () => {
            const faqItems = [
                {
                    type: KnowledgeType.FAQ,
                    title: 'Published and Public',
                    lastUpdatedAt: '2025-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    publishedVersionId: 1,
                    draftVersionId: 1,
                    id: '1',
                },
            ]

            const result = filterKnowledgeItemsByInUseByAI(faqItems, true)

            expect(result).toHaveLength(1)
            expect(result[0].id).toBe('1')
        })

        it('FAQ: article with published version ID and draft changes but public visibility IS in use by AI', () => {
            const faqItems = [
                {
                    type: KnowledgeType.FAQ,
                    title: 'Has published version with draft changes and Public',
                    lastUpdatedAt: '2025-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    publishedVersionId: 1,
                    draftVersionId: 2,
                    id: '1',
                },
            ]

            const result = filterKnowledgeItemsByInUseByAI(faqItems, true)

            expect(result).toHaveLength(1)
            expect(result[0].id).toBe('1')
        })

        it('FAQ: published article with unlisted visibility is NOT in use by AI', () => {
            const faqItems = [
                {
                    type: KnowledgeType.FAQ,
                    title: 'Published but Unlisted',
                    lastUpdatedAt: '2025-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                    publishedVersionId: 1,
                    draftVersionId: 1,
                    id: '1',
                },
            ]

            const result = filterKnowledgeItemsByInUseByAI(faqItems, true)

            expect(result).toHaveLength(0)
        })

        it('FAQ: article without published version ID even with public visibility is NOT in use by AI', () => {
            const faqItems = [
                {
                    type: KnowledgeType.FAQ,
                    title: 'Never Published but Public',
                    lastUpdatedAt: '2025-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    draftVersionId: 1,
                    id: '1',
                },
            ]

            const result = filterKnowledgeItemsByInUseByAI(faqItems, true)

            expect(result).toHaveLength(0)
        })

        it('Guidance: published article with public visibility is in use by AI', () => {
            const guidanceItems = [
                {
                    type: KnowledgeType.Guidance,
                    title: 'Published Guidance',
                    lastUpdatedAt: '2025-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    publishedVersionId: 1,
                    id: '1',
                },
            ]

            const result = filterKnowledgeItemsByInUseByAI(guidanceItems, true)

            expect(result).toHaveLength(1)
            expect(result[0].id).toBe('1')
        })

        it('Guidance: article without published version ID even with public visibility is NOT in use by AI', () => {
            const guidanceItems = [
                {
                    type: KnowledgeType.Guidance,
                    title: 'Draft Guidance',
                    lastUpdatedAt: '2025-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    publishedVersionId: null,
                    id: '1',
                },
            ]

            const result = filterKnowledgeItemsByInUseByAI(guidanceItems, true)

            expect(result).toHaveLength(0)
        })

        it('Guidance: published article with unlisted visibility is NOT in use by AI', () => {
            const guidanceItems = [
                {
                    type: KnowledgeType.Guidance,
                    title: 'Unlisted Guidance',
                    lastUpdatedAt: '2025-01-01T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                    publishedVersionId: 1,
                    id: '1',
                },
            ]

            const result = filterKnowledgeItemsByInUseByAI(guidanceItems, true)

            expect(result).toHaveLength(0)
        })
    })
})
