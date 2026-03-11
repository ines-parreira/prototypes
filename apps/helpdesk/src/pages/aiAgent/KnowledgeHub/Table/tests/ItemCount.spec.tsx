import { render, screen } from '@testing-library/react'

import type { TableV1Instance } from '@gorgias/axiom'

import type { GroupedKnowledgeItem } from '../../types'
import { KnowledgeType, KnowledgeVisibility } from '../../types'
import { ItemCount } from '../ItemCount'

const createMockTable = (
    rows: GroupedKnowledgeItem[],
    selectedRowIndices: number[] = [],
): TableV1Instance<GroupedKnowledgeItem> => {
    return {
        getFilteredSelectedRowModel: () => ({
            rows: selectedRowIndices.map((index) => ({
                original: rows[index],
            })),
        }),
        getFilteredRowModel: () => ({
            rows: rows.map((row) => ({ original: row })),
        }),
    } as unknown as TableV1Instance<GroupedKnowledgeItem>
}

describe('ItemCount', () => {
    const mockItems: GroupedKnowledgeItem[] = [
        {
            type: KnowledgeType.Document,
            title: 'Item 1',
            lastUpdatedAt: '2024-01-01T00:00:00Z',
            inUseByAI: KnowledgeVisibility.PUBLIC,
            id: '1',
        },
        {
            type: KnowledgeType.FAQ,
            title: 'Item 2',
            lastUpdatedAt: '2024-01-02T00:00:00Z',
            inUseByAI: KnowledgeVisibility.UNLISTED,
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

    describe('when no items are selected and search is not active', () => {
        it('displays total item count with singular form', () => {
            const table = createMockTable([mockItems[0]])
            render(
                <ItemCount
                    table={table}
                    isSearchActive={false}
                    hasActiveFilters={false}
                    hasInUseByAIFilter={false}
                />,
            )

            expect(screen.getByText('1 item')).toBeInTheDocument()
        })

        it('displays total item count with plural form', () => {
            const table = createMockTable(mockItems)
            render(
                <ItemCount
                    table={table}
                    isSearchActive={false}
                    hasActiveFilters={false}
                    hasInUseByAIFilter={false}
                />,
            )

            expect(screen.getByText('3 items')).toBeInTheDocument()
        })

        it('displays zero items', () => {
            const table = createMockTable([])
            render(
                <ItemCount
                    table={table}
                    isSearchActive={false}
                    hasActiveFilters={false}
                    hasInUseByAIFilter={false}
                />,
            )

            expect(screen.getByText('0 items')).toBeInTheDocument()
        })
    })

    describe('when items are selected', () => {
        it('displays selected count with singular form', () => {
            const table = createMockTable(mockItems, [0])
            render(
                <ItemCount
                    table={table}
                    isSearchActive={false}
                    hasActiveFilters={false}
                    hasInUseByAIFilter={false}
                />,
            )

            expect(screen.getByText('1 item selected')).toBeInTheDocument()
        })

        it('displays selected count with plural form', () => {
            const table = createMockTable(mockItems, [0, 1])
            render(
                <ItemCount
                    table={table}
                    isSearchActive={false}
                    hasActiveFilters={false}
                    hasInUseByAIFilter={false}
                />,
            )

            expect(screen.getByText('2 items selected')).toBeInTheDocument()
        })

        it('displays selected count even when search is active', () => {
            const table = createMockTable(mockItems, [0, 1, 2])
            render(
                <ItemCount
                    table={table}
                    isSearchActive={true}
                    hasActiveFilters={false}
                    hasInUseByAIFilter={false}
                />,
            )

            expect(screen.getByText('3 items selected')).toBeInTheDocument()
        })

        it('displays selected count even when filters are active', () => {
            const table = createMockTable(mockItems, [0, 1])
            render(
                <ItemCount
                    table={table}
                    isSearchActive={false}
                    hasActiveFilters={true}
                    hasInUseByAIFilter={false}
                />,
            )

            expect(screen.getByText('2 items selected')).toBeInTheDocument()
        })
    })

    describe('when search is active and no items are selected', () => {
        it('displays result count with "including snippets" when only search is active', () => {
            const table = createMockTable(mockItems)
            render(
                <ItemCount
                    table={table}
                    isSearchActive={true}
                    hasActiveFilters={false}
                    hasInUseByAIFilter={false}
                />,
            )

            expect(
                screen.getByText('3 results found including snippets'),
            ).toBeInTheDocument()
        })

        it('displays result count with "including snippets" in singular form', () => {
            const table = createMockTable([mockItems[0]])
            render(
                <ItemCount
                    table={table}
                    isSearchActive={true}
                    hasActiveFilters={false}
                    hasInUseByAIFilter={false}
                />,
            )

            expect(
                screen.getByText('1 result found including snippets'),
            ).toBeInTheDocument()
        })

        it('displays result count with "including snippets" when search + date filter are active (no inUseByAI)', () => {
            const table = createMockTable(mockItems)
            render(
                <ItemCount
                    table={table}
                    isSearchActive={true}
                    hasActiveFilters={true}
                    hasInUseByAIFilter={false}
                />,
            )

            expect(
                screen.getByText('3 results found including snippets'),
            ).toBeInTheDocument()
        })

        it('displays zero results', () => {
            const table = createMockTable([])
            render(
                <ItemCount
                    table={table}
                    isSearchActive={true}
                    hasActiveFilters={false}
                    hasInUseByAIFilter={false}
                />,
            )

            expect(screen.getByText('0 results found')).toBeInTheDocument()
        })
    })

    describe('when filters are active and no items are selected', () => {
        it('displays regular result count when only date filter is active', () => {
            const table = createMockTable(mockItems)
            render(
                <ItemCount
                    table={table}
                    isSearchActive={false}
                    hasActiveFilters={true}
                    hasInUseByAIFilter={false}
                />,
            )

            expect(screen.getByText('3 results found')).toBeInTheDocument()
        })

        it('displays result count with "including snippets" when only inUseByAI filter is active', () => {
            const table = createMockTable(mockItems)
            render(
                <ItemCount
                    table={table}
                    isSearchActive={false}
                    hasActiveFilters={true}
                    hasInUseByAIFilter={true}
                />,
            )

            expect(
                screen.getByText('3 results found including snippets'),
            ).toBeInTheDocument()
        })

        it('displays result count with "including snippets" when inUseByAI + date filters are active', () => {
            const table = createMockTable(mockItems)
            render(
                <ItemCount
                    table={table}
                    isSearchActive={false}
                    hasActiveFilters={true}
                    hasInUseByAIFilter={true}
                />,
            )

            expect(
                screen.getByText('3 results found including snippets'),
            ).toBeInTheDocument()
        })

        it('displays zero results when filters produce no results', () => {
            const table = createMockTable([])
            render(
                <ItemCount
                    table={table}
                    isSearchActive={false}
                    hasActiveFilters={true}
                    hasInUseByAIFilter={false}
                />,
            )

            expect(screen.getByText('0 results found')).toBeInTheDocument()
        })
    })

    describe('when both search and filters are active', () => {
        it('displays result count with "including snippets" when search + inUseByAI filter are active', () => {
            const table = createMockTable(mockItems)
            render(
                <ItemCount
                    table={table}
                    isSearchActive={true}
                    hasActiveFilters={true}
                    hasInUseByAIFilter={true}
                />,
            )

            expect(
                screen.getByText('3 results found including snippets'),
            ).toBeInTheDocument()
        })

        it('displays result count with "including snippets" when search + inUseByAI + date filters are active', () => {
            const table = createMockTable(mockItems)
            render(
                <ItemCount
                    table={table}
                    isSearchActive={true}
                    hasActiveFilters={true}
                    hasInUseByAIFilter={true}
                />,
            )

            expect(
                screen.getByText('3 results found including snippets'),
            ).toBeInTheDocument()
        })
    })
})
