import type { SortingState } from '@gorgias/axiom'

import {
    KnowledgeType,
    KnowledgeVisibility,
} from 'pages/aiAgent/KnowledgeHub/types'
import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'

import { applyStableRowOrder, sortData } from '../KnowledgeHubTable.utils'

describe('KnowledgeHubTable Utilities', () => {
    describe('sortData', () => {
        const mockItems: GroupedKnowledgeItem[] = [
            {
                id: '1',
                type: KnowledgeType.Guidance,
                title: 'Alpha',
                lastUpdatedAt: '2024-01-01T00:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                publishedVersionId: 1,
            },
            {
                id: '2',
                type: KnowledgeType.Guidance,
                title: 'Beta',
                lastUpdatedAt: '2024-01-02T00:00:00Z',
                inUseByAI: KnowledgeVisibility.UNLISTED,
            },
            {
                id: '3',
                type: KnowledgeType.Guidance,
                title: 'Charlie',
                lastUpdatedAt: '2024-01-03T00:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                publishedVersionId: 2,
            },
        ]

        describe('no sorting', () => {
            it('should return data unchanged when sorting is empty', () => {
                const result = sortData(mockItems, [])
                expect(result).toBe(mockItems)
            })
        })

        describe('string sorting', () => {
            it('should sort strings ascending (A-Z)', () => {
                const sorting: SortingState = [{ id: 'title', desc: false }]
                const result = sortData(mockItems, sorting)

                expect(result[0].title).toBe('Alpha')
                expect(result[1].title).toBe('Beta')
                expect(result[2].title).toBe('Charlie')
            })

            it('should sort strings descending (Z-A)', () => {
                const sorting: SortingState = [{ id: 'title', desc: true }]
                const result = sortData(mockItems, sorting)

                expect(result[0].title).toBe('Charlie')
                expect(result[1].title).toBe('Beta')
                expect(result[2].title).toBe('Alpha')
            })

            it('should sort case-insensitively', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'zebra',
                        lastUpdatedAt: '2024-01-01T00:00:00Z',
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: 'Apple',
                        lastUpdatedAt: '2024-01-02T00:00:00Z',
                    },
                    {
                        id: '3',
                        type: KnowledgeType.Guidance,
                        title: 'BANANA',
                        lastUpdatedAt: '2024-01-03T00:00:00Z',
                    },
                ]

                const sorting: SortingState = [{ id: 'title', desc: false }]
                const result = sortData(items, sorting)

                expect(result[0].title).toBe('Apple')
                expect(result[1].title).toBe('BANANA')
                expect(result[2].title).toBe('zebra')
            })

            it('should handle special characters with locale-aware comparison', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'café',
                        lastUpdatedAt: '2024-01-01T00:00:00Z',
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: 'apple',
                        lastUpdatedAt: '2024-01-02T00:00:00Z',
                    },
                    {
                        id: '3',
                        type: KnowledgeType.Guidance,
                        title: 'naïve',
                        lastUpdatedAt: '2024-01-03T00:00:00Z',
                    },
                ]

                const sorting: SortingState = [{ id: 'title', desc: false }]
                const result = sortData(items, sorting)

                expect(result[0].title).toBe('apple')
                expect(result[1].title).toBe('café')
                expect(result[2].title).toBe('naïve')
            })
        })

        describe('date sorting', () => {
            it('should sort dates ascending (oldest first)', () => {
                const sorting: SortingState = [
                    { id: 'lastUpdatedAt', desc: false },
                ]
                const result = sortData(mockItems, sorting)

                expect(result[0].lastUpdatedAt).toBe('2024-01-01T00:00:00Z')
                expect(result[1].lastUpdatedAt).toBe('2024-01-02T00:00:00Z')
                expect(result[2].lastUpdatedAt).toBe('2024-01-03T00:00:00Z')
            })

            it('should sort dates descending (newest first)', () => {
                const sorting: SortingState = [
                    { id: 'lastUpdatedAt', desc: true },
                ]
                const result = sortData(mockItems, sorting)

                expect(result[0].lastUpdatedAt).toBe('2024-01-03T00:00:00Z')
                expect(result[1].lastUpdatedAt).toBe('2024-01-02T00:00:00Z')
                expect(result[2].lastUpdatedAt).toBe('2024-01-01T00:00:00Z')
            })

            it('should push invalid dates to end when sorting ascending', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Valid',
                        lastUpdatedAt: '2024-01-02T00:00:00Z',
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: 'Invalid',
                        lastUpdatedAt: 'invalid-date',
                    },
                    {
                        id: '3',
                        type: KnowledgeType.Guidance,
                        title: 'Valid earlier',
                        lastUpdatedAt: '2024-01-01T00:00:00Z',
                    },
                ]

                const sorting: SortingState = [
                    { id: 'lastUpdatedAt', desc: false },
                ]
                const result = sortData(items, sorting)

                expect(result[0].lastUpdatedAt).toBe('2024-01-01T00:00:00Z')
                expect(result[1].lastUpdatedAt).toBe('2024-01-02T00:00:00Z')
                expect(result[2].lastUpdatedAt).toBe('invalid-date')
            })

            it('should push invalid dates to end when sorting descending', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Valid',
                        lastUpdatedAt: '2024-01-02T00:00:00Z',
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: 'Invalid',
                        lastUpdatedAt: 'not-a-date',
                    },
                    {
                        id: '3',
                        type: KnowledgeType.Guidance,
                        title: 'Valid later',
                        lastUpdatedAt: '2024-01-03T00:00:00Z',
                    },
                ]

                const sorting: SortingState = [
                    { id: 'lastUpdatedAt', desc: true },
                ]
                const result = sortData(items, sorting)

                expect(result[0].lastUpdatedAt).toBe('2024-01-03T00:00:00Z')
                expect(result[1].lastUpdatedAt).toBe('2024-01-02T00:00:00Z')
                expect(result[2].lastUpdatedAt).toBe('not-a-date')
            })
        })

        describe('boolean sorting (inUseByAI)', () => {
            it('should sort inUseByAI ascending (in-use items first)', () => {
                const sorting: SortingState = [{ id: 'inUseByAI', desc: false }]
                const result = sortData(mockItems, sorting)

                expect(result[0].inUseByAI).toBe(KnowledgeVisibility.PUBLIC)
                expect(result[1].inUseByAI).toBe(KnowledgeVisibility.PUBLIC)
                expect(result[2].id).toBe('2')
                expect(result[2].inUseByAI).toBe(KnowledgeVisibility.UNLISTED)
            })

            it('should sort inUseByAI descending (not-in-use items first)', () => {
                const sorting: SortingState = [{ id: 'inUseByAI', desc: true }]
                const result = sortData(mockItems, sorting)

                expect(result[0].id).toBe('2')
                expect(result[0].inUseByAI).toBe(KnowledgeVisibility.UNLISTED)
                expect(result[1].inUseByAI).toBe(KnowledgeVisibility.PUBLIC)
                expect(result[2].inUseByAI).toBe(KnowledgeVisibility.PUBLIC)
            })

            it('should apply special FAQ logic requiring publishedVersionId', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.FAQ,
                        title: 'FAQ with published version',
                        lastUpdatedAt: '2024-01-01T00:00:00Z',
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                        publishedVersionId: 123,
                    },
                    {
                        id: '2',
                        type: KnowledgeType.FAQ,
                        title: 'FAQ public but no published version',
                        lastUpdatedAt: '2024-01-02T00:00:00Z',
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                        publishedVersionId: null,
                    },
                    {
                        id: '3',
                        type: KnowledgeType.Document,
                        title: 'Document public',
                        lastUpdatedAt: '2024-01-03T00:00:00Z',
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                    },
                ]

                const sorting: SortingState = [{ id: 'inUseByAI', desc: false }]
                const result = sortData(items, sorting)

                expect(result[0].id).toBe('1')
                expect(result[0].type).toBe(KnowledgeType.FAQ)
                expect(result[0].publishedVersionId).toBe(123)

                expect(result[1].id).toBe('3')
                expect(result[1].type).toBe(KnowledgeType.Document)

                expect(result[2].id).toBe('2')
                expect(result[2].type).toBe(KnowledgeType.FAQ)
                expect(result[2].publishedVersionId).toBeNull()
            })

            it('should apply special Guidance logic requiring publishedVersionId', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Guidance with published version',
                        lastUpdatedAt: '2024-01-01T00:00:00Z',
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                        publishedVersionId: 123,
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: 'Guidance public but no published version',
                        lastUpdatedAt: '2024-01-02T00:00:00Z',
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                        publishedVersionId: null,
                    },
                    {
                        id: '3',
                        type: KnowledgeType.Document,
                        title: 'Document public',
                        lastUpdatedAt: '2024-01-03T00:00:00Z',
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                    },
                ]

                const sorting: SortingState = [{ id: 'inUseByAI', desc: false }]
                const result = sortData(items, sorting)

                expect(result[0].id).toBe('1')
                expect(result[0].type).toBe(KnowledgeType.Guidance)
                expect(result[0].publishedVersionId).toBe(123)

                expect(result[1].id).toBe('3')
                expect(result[1].type).toBe(KnowledgeType.Document)

                expect(result[2].id).toBe('2')
                expect(result[2].type).toBe(KnowledgeType.Guidance)
                expect(result[2].publishedVersionId).toBeNull()
            })
        })

        describe('numeric sorting', () => {
            it('should sort numbers ascending', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Item 1',
                        lastUpdatedAt: '2024-01-01T00:00:00Z',
                        metrics: {
                            tickets: 50,
                            handoverTickets: 10,
                            csat: 4.5,
                            resourceSourceSetId: 1,
                        },
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: 'Item 2',
                        lastUpdatedAt: '2024-01-02T00:00:00Z',
                        metrics: {
                            tickets: 10,
                            handoverTickets: 5,
                            csat: 3.0,
                            resourceSourceSetId: 2,
                        },
                    },
                    {
                        id: '3',
                        type: KnowledgeType.Guidance,
                        title: 'Item 3',
                        lastUpdatedAt: '2024-01-03T00:00:00Z',
                        metrics: {
                            tickets: 100,
                            handoverTickets: 20,
                            csat: 5.0,
                            resourceSourceSetId: 3,
                        },
                    },
                ]

                const sorting: SortingState = [
                    { id: 'metrics.tickets', desc: false },
                ]
                const result = sortData(items, sorting)

                expect(result[0].metrics?.tickets).toBe(10)
                expect(result[1].metrics?.tickets).toBe(50)
                expect(result[2].metrics?.tickets).toBe(100)
            })

            it('should sort numbers descending', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Item 1',
                        lastUpdatedAt: '2024-01-01T00:00:00Z',
                        metrics: {
                            tickets: 50,
                            handoverTickets: 10,
                            csat: 4.5,
                            resourceSourceSetId: 1,
                        },
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: 'Item 2',
                        lastUpdatedAt: '2024-01-02T00:00:00Z',
                        metrics: {
                            tickets: 10,
                            handoverTickets: 5,
                            csat: 3.0,
                            resourceSourceSetId: 2,
                        },
                    },
                    {
                        id: '3',
                        type: KnowledgeType.Guidance,
                        title: 'Item 3',
                        lastUpdatedAt: '2024-01-03T00:00:00Z',
                        metrics: {
                            tickets: 100,
                            handoverTickets: 20,
                            csat: 5.0,
                            resourceSourceSetId: 3,
                        },
                    },
                ]

                const sorting: SortingState = [
                    { id: 'metrics.tickets', desc: true },
                ]
                const result = sortData(items, sorting)

                expect(result[0].metrics?.tickets).toBe(100)
                expect(result[1].metrics?.tickets).toBe(50)
                expect(result[2].metrics?.tickets).toBe(10)
            })
        })

        describe('nested property sorting', () => {
            it('should sort by nested property using dot notation', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Item 1',
                        lastUpdatedAt: '2024-01-01T00:00:00Z',
                        metrics: {
                            tickets: 50,
                            handoverTickets: 30,
                            csat: 4.5,
                            resourceSourceSetId: 1,
                        },
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: 'Item 2',
                        lastUpdatedAt: '2024-01-02T00:00:00Z',
                        metrics: {
                            tickets: 10,
                            handoverTickets: 5,
                            csat: 3.0,
                            resourceSourceSetId: 2,
                        },
                    },
                    {
                        id: '3',
                        type: KnowledgeType.Guidance,
                        title: 'Item 3',
                        lastUpdatedAt: '2024-01-03T00:00:00Z',
                        metrics: {
                            tickets: 100,
                            handoverTickets: 60,
                            csat: 5.0,
                            resourceSourceSetId: 3,
                        },
                    },
                ]

                const sorting: SortingState = [
                    { id: 'metrics.handoverTickets', desc: false },
                ]
                const result = sortData(items, sorting)

                expect(result[0].metrics?.handoverTickets).toBe(5)
                expect(result[1].metrics?.handoverTickets).toBe(30)
                expect(result[2].metrics?.handoverTickets).toBe(60)
            })

            it('should handle missing nested properties', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Item 1',
                        lastUpdatedAt: '2024-01-01T00:00:00Z',
                        metrics: {
                            tickets: 50,
                            handoverTickets: 10,
                            csat: 4.5,
                            resourceSourceSetId: 1,
                        },
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: 'Item 2',
                        lastUpdatedAt: '2024-01-02T00:00:00Z',
                    },
                    {
                        id: '3',
                        type: KnowledgeType.Guidance,
                        title: 'Item 3',
                        lastUpdatedAt: '2024-01-03T00:00:00Z',
                        metrics: {
                            tickets: 100,
                            handoverTickets: 20,
                            csat: 5.0,
                            resourceSourceSetId: 3,
                        },
                    },
                ]

                const sorting: SortingState = [
                    { id: 'metrics.tickets', desc: false },
                ]
                const result = sortData(items, sorting)

                expect(result[0].metrics?.tickets).toBe(50)
                expect(result[1].metrics?.tickets).toBe(100)
                expect(result[2].metrics).toBeUndefined()
            })
        })

        describe('null and undefined handling', () => {
            it('should push null values to end when sorting ascending', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Beta',
                        lastUpdatedAt: '2024-01-01T00:00:00Z',
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: null as any,
                        lastUpdatedAt: '2024-01-02T00:00:00Z',
                    },
                    {
                        id: '3',
                        type: KnowledgeType.Guidance,
                        title: 'Alpha',
                        lastUpdatedAt: '2024-01-03T00:00:00Z',
                    },
                ]

                const sorting: SortingState = [{ id: 'title', desc: false }]
                const result = sortData(items, sorting)

                expect(result[0].title).toBe('Alpha')
                expect(result[1].title).toBe('Beta')
                expect(result[2].title).toBeNull()
            })

            it('should push null values to end when sorting descending', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Beta',
                        lastUpdatedAt: '2024-01-01T00:00:00Z',
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: null as any,
                        lastUpdatedAt: '2024-01-02T00:00:00Z',
                    },
                    {
                        id: '3',
                        type: KnowledgeType.Guidance,
                        title: 'Alpha',
                        lastUpdatedAt: '2024-01-03T00:00:00Z',
                    },
                ]

                const sorting: SortingState = [{ id: 'title', desc: true }]
                const result = sortData(items, sorting)

                expect(result[0].title).toBe('Beta')
                expect(result[1].title).toBe('Alpha')
                expect(result[2].title).toBeNull()
            })

            it('should handle undefined values', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Beta',
                        lastUpdatedAt: '2024-01-01T00:00:00Z',
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: undefined as any,
                        lastUpdatedAt: '2024-01-02T00:00:00Z',
                    },
                    {
                        id: '3',
                        type: KnowledgeType.Guidance,
                        title: 'Alpha',
                        lastUpdatedAt: '2024-01-03T00:00:00Z',
                    },
                ]

                const sorting: SortingState = [{ id: 'title', desc: false }]
                const result = sortData(items, sorting)

                expect(result[0].title).toBe('Alpha')
                expect(result[1].title).toBe('Beta')
                expect(result[2].title).toBeUndefined()
            })

            it('should handle all null values', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: null as any,
                        lastUpdatedAt: '2024-01-01T00:00:00Z',
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: null as any,
                        lastUpdatedAt: '2024-01-02T00:00:00Z',
                    },
                ]

                const sorting: SortingState = [{ id: 'title', desc: false }]
                const result = sortData(items, sorting)

                expect(result[0].id).toBe('1')
                expect(result[1].id).toBe('2')
            })
        })

        describe('immutability', () => {
            it('should not mutate the original array', () => {
                const original = [...mockItems]
                const sorting: SortingState = [{ id: 'title', desc: false }]

                sortData(mockItems, sorting)

                expect(mockItems).toEqual(original)
            })

            it('should return a new array', () => {
                const sorting: SortingState = [{ id: 'title', desc: false }]
                const result = sortData(mockItems, sorting)

                expect(result).not.toBe(mockItems)
            })
        })

        describe('edge cases', () => {
            it('should handle empty array', () => {
                const sorting: SortingState = [{ id: 'title', desc: false }]
                const result = sortData([], sorting)

                expect(result).toEqual([])
            })

            it('should handle single item', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Only Item',
                        lastUpdatedAt: '2024-01-01T00:00:00Z',
                    },
                ]

                const sorting: SortingState = [{ id: 'title', desc: false }]
                const result = sortData(items, sorting)

                expect(result).toHaveLength(1)
                expect(result[0].title).toBe('Only Item')
            })

            it('should handle items with identical values', () => {
                const items: GroupedKnowledgeItem[] = [
                    {
                        id: '1',
                        type: KnowledgeType.Guidance,
                        title: 'Same',
                        lastUpdatedAt: '2024-01-01T00:00:00Z',
                    },
                    {
                        id: '2',
                        type: KnowledgeType.Guidance,
                        title: 'Same',
                        lastUpdatedAt: '2024-01-02T00:00:00Z',
                    },
                    {
                        id: '3',
                        type: KnowledgeType.Guidance,
                        title: 'Same',
                        lastUpdatedAt: '2024-01-03T00:00:00Z',
                    },
                ]

                const sorting: SortingState = [{ id: 'title', desc: false }]
                const result = sortData(items, sorting)

                expect(result[0].id).toBe('1')
                expect(result[1].id).toBe('2')
                expect(result[2].id).toBe('3')
            })
        })
    })

    describe('applyStableRowOrder', () => {
        const createMockItem = (
            id: string,
            title: string,
        ): GroupedKnowledgeItem => ({
            id,
            type: KnowledgeType.Guidance,
            title,
            lastUpdatedAt: '2024-01-01T00:00:00Z',
            inUseByAI: KnowledgeVisibility.PUBLIC,
        })

        describe('maintaining cached positions', () => {
            it('should maintain exact positions for existing items', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('1', 'Alpha'),
                    createMockItem('2', 'Beta'),
                    createMockItem('3', 'Charlie'),
                ]

                const sortedIds = ['3', '1', '2']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result[0].id).toBe('3')
                expect(result[0].title).toBe('Charlie')
                expect(result[1].id).toBe('1')
                expect(result[1].title).toBe('Alpha')
                expect(result[2].id).toBe('2')
                expect(result[2].title).toBe('Beta')
            })

            it('should preserve cached order even when data array order changes', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('3', 'Charlie'),
                    createMockItem('1', 'Alpha'),
                    createMockItem('2', 'Beta'),
                ]

                const sortedIds = ['1', '2', '3']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result[0].id).toBe('1')
                expect(result[1].id).toBe('2')
                expect(result[2].id).toBe('3')
            })

            it('should use updated item data while maintaining position', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('1', 'Alpha Updated'),
                    createMockItem('2', 'Beta'),
                    createMockItem('3', 'Charlie'),
                ]

                const sortedIds = ['3', '1', '2']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result[0].id).toBe('3')
                expect(result[1].id).toBe('1')
                expect(result[1].title).toBe('Alpha Updated')
                expect(result[2].id).toBe('2')
            })
        })

        describe('handling new items', () => {
            it('should append new items to the end', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('1', 'Alpha'),
                    createMockItem('2', 'Beta'),
                    createMockItem('3', 'Charlie'),
                    createMockItem('4', 'New Item'),
                ]

                const sortedIds = ['1', '2', '3']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result[0].id).toBe('1')
                expect(result[1].id).toBe('2')
                expect(result[2].id).toBe('3')
                expect(result[3].id).toBe('4')
                expect(result[3].title).toBe('New Item')
            })

            it('should append multiple new items in data array order', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('1', 'Alpha'),
                    createMockItem('2', 'Beta'),
                    createMockItem('4', 'New Item 1'),
                    createMockItem('5', 'New Item 2'),
                ]

                const sortedIds = ['1', '2']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result).toHaveLength(4)
                expect(result[0].id).toBe('1')
                expect(result[1].id).toBe('2')
                expect(result[2].id).toBe('4')
                expect(result[3].id).toBe('5')
            })

            it('should handle all items being new', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('4', 'New Item 1'),
                    createMockItem('5', 'New Item 2'),
                    createMockItem('6', 'New Item 3'),
                ]

                const sortedIds = ['1', '2', '3']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result).toHaveLength(3)
                expect(result[0].id).toBe('4')
                expect(result[1].id).toBe('5')
                expect(result[2].id).toBe('6')
            })
        })

        describe('handling deleted items', () => {
            it('should filter out deleted items', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('1', 'Alpha'),
                    createMockItem('3', 'Charlie'),
                ]

                const sortedIds = ['1', '2', '3']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result).toHaveLength(2)
                expect(result[0].id).toBe('1')
                expect(result[1].id).toBe('3')
                expect(result.find((item) => item.id === '2')).toBeUndefined()
            })

            it('should handle multiple deleted items', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('2', 'Beta'),
                ]

                const sortedIds = ['1', '2', '3', '4']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result).toHaveLength(1)
                expect(result[0].id).toBe('2')
            })

            it('should handle all items being deleted', () => {
                const data: GroupedKnowledgeItem[] = []

                const sortedIds = ['1', '2', '3']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result).toHaveLength(0)
                expect(result).toEqual([])
            })
        })

        describe('bulk operations', () => {
            it('should handle items being added and deleted simultaneously', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('1', 'Alpha'),
                    createMockItem('3', 'Charlie'),
                    createMockItem('4', 'New Item'),
                ]

                const sortedIds = ['1', '2', '3']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result).toHaveLength(3)
                expect(result[0].id).toBe('1')
                expect(result[1].id).toBe('3')
                expect(result[2].id).toBe('4')
            })

            it('should handle bulk delete followed by bulk add', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('1', 'Alpha'),
                    createMockItem('5', 'New 1'),
                    createMockItem('6', 'New 2'),
                ]

                const sortedIds = ['1', '2', '3', '4']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result).toHaveLength(3)
                expect(result[0].id).toBe('1')
                expect(result[1].id).toBe('5')
                expect(result[2].id).toBe('6')
            })

            it('should handle complete data replacement', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('4', 'New Alpha'),
                    createMockItem('5', 'New Beta'),
                    createMockItem('6', 'New Charlie'),
                ]

                const sortedIds = ['1', '2', '3']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result).toHaveLength(3)
                expect(result[0].id).toBe('4')
                expect(result[1].id).toBe('5')
                expect(result[2].id).toBe('6')
            })
        })

        describe('edge cases', () => {
            it('should handle empty data array', () => {
                const data: GroupedKnowledgeItem[] = []
                const sortedIds = ['1', '2', '3']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result).toEqual([])
            })

            it('should handle empty sortedIds array', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('1', 'Alpha'),
                    createMockItem('2', 'Beta'),
                ]
                const sortedIds: string[] = []

                const result = applyStableRowOrder(data, sortedIds)

                expect(result).toHaveLength(2)
                expect(result[0].id).toBe('1')
                expect(result[1].id).toBe('2')
            })

            it('should handle both arrays being empty', () => {
                const data: GroupedKnowledgeItem[] = []
                const sortedIds: string[] = []

                const result = applyStableRowOrder(data, sortedIds)

                expect(result).toEqual([])
            })

            it('should handle single item', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('1', 'Alpha'),
                ]
                const sortedIds = ['1']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result).toHaveLength(1)
                expect(result[0].id).toBe('1')
            })

            it('should handle duplicate IDs in sortedIds array', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('1', 'Alpha'),
                    createMockItem('2', 'Beta'),
                ]

                const sortedIds = ['1', '1', '2']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result).toHaveLength(2)
                expect(result[0].id).toBe('1')
                expect(result[1].id).toBe('2')
            })
        })

        describe('ID type handling', () => {
            it('should handle numeric IDs by converting to strings', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('1', 'Alpha'),
                    createMockItem('2', 'Beta'),
                    createMockItem('3', 'Charlie'),
                ]

                const sortedIds = ['3', '1', '2']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result[0].id).toBe('3')
                expect(result[1].id).toBe('1')
                expect(result[2].id).toBe('2')
            })

            it('should handle mixed ID formats consistently', () => {
                const data: GroupedKnowledgeItem[] = [
                    { ...createMockItem('1', 'Alpha'), id: '1' },
                    { ...createMockItem('2', 'Beta'), id: '2' },
                ]

                const sortedIds = ['2', '1']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result[0].id).toBe('2')
                expect(result[1].id).toBe('1')
            })
        })

        describe('immutability', () => {
            it('should not mutate the original data array', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('1', 'Alpha'),
                    createMockItem('2', 'Beta'),
                    createMockItem('3', 'Charlie'),
                ]

                const originalData = [...data]
                const sortedIds = ['3', '1', '2']

                applyStableRowOrder(data, sortedIds)

                expect(data).toEqual(originalData)
            })

            it('should not mutate the sortedIds array', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('1', 'Alpha'),
                    createMockItem('2', 'Beta'),
                ]

                const sortedIds = ['2', '1']
                const originalIds = [...sortedIds]

                applyStableRowOrder(data, sortedIds)

                expect(sortedIds).toEqual(originalIds)
            })

            it('should return a new array', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('1', 'Alpha'),
                    createMockItem('2', 'Beta'),
                ]

                const sortedIds = ['1', '2']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result).not.toBe(data)
            })
        })

        describe('performance characteristics', () => {
            it('should efficiently handle large datasets', () => {
                const largeData: GroupedKnowledgeItem[] = []
                const sortedIds: string[] = []

                for (let i = 0; i < 1000; i++) {
                    largeData.push(createMockItem(String(i), `Item ${i}`))
                    sortedIds.push(String(i))
                }

                sortedIds.reverse()

                const startTime = performance.now()
                const result = applyStableRowOrder(largeData, sortedIds)
                const endTime = performance.now()

                expect(result).toHaveLength(1000)
                expect(result[0].id).toBe('999')
                expect(result[999].id).toBe('0')

                expect(endTime - startTime).toBeLessThan(50)
            })

            it('should handle partial updates efficiently', () => {
                const data: GroupedKnowledgeItem[] = []
                const sortedIds: string[] = []

                for (let i = 0; i < 100; i++) {
                    sortedIds.push(String(i))
                }

                for (let i = 0; i < 50; i++) {
                    data.push(createMockItem(String(i * 2), `Item ${i * 2}`))
                }

                const result = applyStableRowOrder(data, sortedIds)

                expect(result).toHaveLength(50)
                expect(result[0].id).toBe('0')
                expect(result[1].id).toBe('2')
                expect(result[2].id).toBe('4')
            })
        })

        describe('real-world scenarios', () => {
            it('should handle editing an item without re-sorting', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('1', 'Alpha'),
                    createMockItem('2', 'ZZZZZ'),
                    createMockItem('3', 'Charlie'),
                ]

                const sortedIds = ['1', '2', '3']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result[0].id).toBe('1')
                expect(result[1].id).toBe('2')
                expect(result[1].title).toBe('ZZZZZ')
                expect(result[2].id).toBe('3')
            })

            it('should handle bulk enable/disable without re-sorting', () => {
                const data: GroupedKnowledgeItem[] = [
                    {
                        ...createMockItem('1', 'Alpha'),
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                    },
                    {
                        ...createMockItem('2', 'Beta'),
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                    },
                    {
                        ...createMockItem('3', 'Charlie'),
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                    },
                ]

                const sortedIds = ['1', '2', '3']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result[0].id).toBe('1')
                expect(result[1].id).toBe('2')
                expect(result[2].id).toBe('3')
            })

            it('should handle creating a new item while sorted', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('1', 'Alpha'),
                    createMockItem('2', 'Beta'),
                    createMockItem('3', 'Charlie'),
                    createMockItem('4', 'Newly Created'),
                ]

                const sortedIds = ['1', '2', '3']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result[0].id).toBe('1')
                expect(result[1].id).toBe('2')
                expect(result[2].id).toBe('3')
                expect(result[3].id).toBe('4')
                expect(result[3].title).toBe('Newly Created')
            })

            it('should handle deleting an item while sorted', () => {
                const data: GroupedKnowledgeItem[] = [
                    createMockItem('1', 'Alpha'),
                    createMockItem('3', 'Charlie'),
                ]

                const sortedIds = ['1', '2', '3']

                const result = applyStableRowOrder(data, sortedIds)

                expect(result).toHaveLength(2)
                expect(result[0].id).toBe('1')
                expect(result[1].id).toBe('3')
            })
        })
    })
})
