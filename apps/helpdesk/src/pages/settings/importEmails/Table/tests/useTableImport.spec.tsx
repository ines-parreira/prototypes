import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockImport, mockListImportsHandler } from '@gorgias/helpdesk-mocks'
import { ImportStatus } from '@gorgias/helpdesk-types'

import { OrderDirection } from 'models/api/types'
import { IntegrationType } from 'models/integration/constants'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useTableImport } from '../useTableImport'

const queryClient = mockQueryClient()
const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    queryClient.removeQueries()
})

afterAll(() => {
    server.close()
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const generateMockImports = (count: number) => {
    return Array.from({ length: count }, (_, i) =>
        mockImport({
            id: i + 1,
            provider_identifier: `email${String(i + 1).padStart(2, '0')}@test.com`,
            status: ImportStatus.Completed,
            progress_percentage: 100,
            provider: IntegrationType.Gmail,
            import_window_start: '2025-01-01T00:00:00Z',
            import_window_end: '2025-01-31T00:00:00Z',
            stats: {
                total_tickets_created: (i + 1) * 10,
                total_messages_imported: (i + 1) * 20,
            },
        }),
    )
}

describe('useTableImport', () => {
    describe('Initial State', () => {
        it('initializes with correct default values', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            expect(result.current.tableProps.sortOrder).toBe(OrderDirection.Asc)
        })

        it('provides all required functions', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            expect(typeof result.current.tableProps.handleSortToggle).toBe(
                'function',
            )
            expect(typeof result.current.tableProps.fetchNextItems).toBe(
                'function',
            )
            expect(typeof result.current.tableProps.fetchPrevItems).toBe(
                'function',
            )
        })
    })

    describe('Sorting Functionality', () => {
        it('toggles sort order from ascending to descending', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            expect(result.current.tableProps.sortOrder).toBe(OrderDirection.Asc)

            act(() => {
                result.current.tableProps.handleSortToggle()
            })

            expect(result.current.tableProps.sortOrder).toBe(
                OrderDirection.Desc,
            )
        })

        it('toggles sort order from descending to ascending', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            act(() => {
                result.current.tableProps.handleSortToggle()
            })
            expect(result.current.tableProps.sortOrder).toBe(
                OrderDirection.Desc,
            )

            act(() => {
                result.current.tableProps.handleSortToggle()
            })
            expect(result.current.tableProps.sortOrder).toBe(OrderDirection.Asc)
        })

        it('sorts import list in ascending order by email', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            const emails = result.current.tableProps.importList.map(
                (item) => item.provider_identifier,
            )
            const sortedEmails = [...emails].sort()

            expect(emails).toEqual(sortedEmails)
        })
    })

    describe('Pagination Functionality', () => {
        it('returns first 8 items on initial page', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: 'next-cursor-token',
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            expect(result.current.tableProps.importList).toHaveLength(8)
        })

        it('uses cursor when fetchNextItems is called', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: 'next-cursor-token',
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            expect(result.current.tableProps.importList).toHaveLength(8)
            expect(result.current.tableProps.hasNextItems).toBe(true)

            act(() => {
                result.current.tableProps.fetchNextItems()
            })

            // Wait for the new query to complete after cursor change
            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            // The hasNextItems should still be true since the mock response still has next_cursor
            expect(result.current.tableProps.hasNextItems).toBe(true)
        })

        it('decrements page when fetchPrevItems is called', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            const initialFirstEmail =
                result.current.tableProps.importList[0].provider_identifier

            act(() => {
                result.current.tableProps.fetchNextItems()
            })

            act(() => {
                result.current.tableProps.fetchPrevItems()
            })

            const finalFirstEmail =
                result.current.tableProps.importList[0].provider_identifier
            expect(finalFirstEmail).toBe(initialFirstEmail)
        })

        it('returns correct page size by default', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 8,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            expect(result.current.tableProps.importList).toHaveLength(8)
        })
    })

    describe('Computed Values', () => {
        it('calculates hasNextItems correctly when there are more items', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: 'next-cursor-token',
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            expect(result.current.tableProps.hasNextItems).toBe(true)
        })

        it('calculates hasNextItems correctly when there are no more items', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            act(() => {
                result.current.tableProps.fetchNextItems()
            })

            expect(result.current.tableProps.hasNextItems).toBe(false)
        })

        it('calculates hasPrevItems correctly on first page', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            expect(result.current.tableProps.hasPrevItems).toBe(false)
        })

        it('calculates hasPrevItems correctly on subsequent pages', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: null,
                        prev_cursor: 'prev-cursor-token',
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            act(() => {
                result.current.tableProps.fetchNextItems()
            })

            expect(result.current.tableProps.hasPrevItems).toBe(true)
        })

        it('returns correct number of items on last page', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            act(() => {
                result.current.tableProps.fetchNextItems()
            })

            expect(result.current.tableProps.importList).toHaveLength(8)
        })

        it('returns correct items with fixed page size', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            expect(result.current.tableProps.importList).toHaveLength(8)
        })
    })

    describe('Integration Tests', () => {
        it('maintains sorting when navigating between pages', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            act(() => {
                result.current.tableProps.handleSortToggle()
            })

            const page1Emails = result.current.tableProps.importList.map(
                (item) => item.provider_identifier,
            )

            act(() => {
                result.current.tableProps.fetchNextItems()
            })

            const page2Emails = result.current.tableProps.importList.map(
                (item) => item.provider_identifier,
            )

            expect(page1Emails).toEqual([...page1Emails].sort())
            expect(page2Emails).toEqual([...page2Emails].sort())
        })

        it('maintains sort order when navigating pages', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            act(() => {
                result.current.tableProps.handleSortToggle()
            })

            expect(result.current.tableProps.sortOrder).toBe(
                OrderDirection.Desc,
            )

            act(() => {
                result.current.tableProps.fetchNextItems()
            })

            expect(result.current.tableProps.sortOrder).toBe(
                OrderDirection.Desc,
            )
        })

        it('maintains consistent importList length', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            const initialLength = result.current.tableProps.importList.length
            expect(result.current.tableProps.importList.length).toBe(8)
            expect(initialLength).toBe(8)
        })

        it('provides correct navigation flags on first page', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: 'next-cursor-token',
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            expect(result.current.tableProps.hasNextItems).toBe(true)
            expect(result.current.tableProps.hasPrevItems).toBe(false)
        })
    })

    describe('Edge Cases', () => {
        it('handles first page correctly', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: 'next-cursor-token',
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            expect(result.current.tableProps.importList).toHaveLength(8)
            expect(result.current.tableProps.hasNextItems).toBe(true)
            expect(result.current.tableProps.hasPrevItems).toBe(false)
        })

        it('handles fixed page size correctly', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: 'next-cursor-token',
                        prev_cursor: null,
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            expect(result.current.tableProps.importList).toHaveLength(8)
            expect(result.current.tableProps.hasNextItems).toBe(true)
        })

        it('handles second page correctly', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: generateMockImports(8),
                    meta: {
                        next_cursor: null,
                        prev_cursor: 'prev-cursor-token',
                        total_resources: 16,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            expect(result.current.tableProps.importList).toHaveLength(8)
            expect(result.current.tableProps.hasNextItems).toBe(false)
            expect(result.current.tableProps.hasPrevItems).toBe(true)
        })
    })
})

describe('useTableImport API', () => {
    describe('successful data fetching and mapping', () => {
        it('should fetch and map import data correctly', async () => {
            const mockImportData = [
                mockImport({
                    id: 1,
                    provider_identifier: 'test@example.com',
                    import_window_start: '2025-06-01T00:00:00Z',
                    import_window_end: '2025-07-01T00:00:00Z',
                    status: ImportStatus.Completed,
                    progress_percentage: 100,
                    stats: {
                        total_tickets_created: 150,
                        total_messages_imported: 150,
                    },
                }),
                mockImport({
                    id: 2,
                    provider_identifier: 'support@company.com',
                    import_window_start: '2025-06-01T00:00:00Z',
                    import_window_end: '2025-07-01T00:00:00Z',
                    status: ImportStatus.InProgress,
                    progress_percentage: 50,
                    stats: {
                        total_tickets_created: 75,
                        total_messages_imported: 155,
                    },
                }),
                mockImport({
                    id: 3,
                    provider_identifier: 'help@business.org',
                    import_window_start: '2025-06-01T00:00:00Z',
                    import_window_end: '2025-07-01T00:00:00Z',
                    status: ImportStatus.Failed,
                    progress_percentage: 0,
                    stats: {
                        total_tickets_created: 0,
                        total_messages_imported: 200,
                    },
                }),
            ]

            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: mockImportData,
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: null,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            expect(result.current.tableProps.isLoading).toBe(true)

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            expect(result.current.tableProps.importList).toHaveLength(3)

            // Data is returned as-is from the API and sorted by status then email
            // Find the specific items to test their structure (order may vary due to sorting)
            const completedItem = result.current.tableProps.importList.find(
                (item) => item.status === ImportStatus.Completed,
            )
            const inProgressItem = result.current.tableProps.importList.find(
                (item) => item.status === ImportStatus.InProgress,
            )
            const failedItem = result.current.tableProps.importList.find(
                (item) => item.status === ImportStatus.Failed,
            )

            expect(completedItem).toEqual(
                expect.objectContaining({
                    id: 1,
                    provider_identifier: 'test@example.com',
                    import_window_start: '2025-06-01T00:00:00Z',
                    import_window_end: '2025-07-01T00:00:00Z',
                    status: ImportStatus.Completed,
                    progress_percentage: 100,
                    stats: {
                        total_tickets_created: 150,
                        total_messages_imported: 150,
                    },
                }),
            )
            expect(inProgressItem).toEqual(
                expect.objectContaining({
                    id: 2,
                    provider_identifier: 'support@company.com',
                    import_window_start: '2025-06-01T00:00:00Z',
                    import_window_end: '2025-07-01T00:00:00Z',
                    status: ImportStatus.InProgress,
                    progress_percentage: 50,
                    stats: {
                        total_tickets_created: 75,
                        total_messages_imported: 155,
                    },
                }),
            )
            expect(failedItem).toEqual(
                expect.objectContaining({
                    id: 3,
                    provider_identifier: 'help@business.org',
                    import_window_start: '2025-06-01T00:00:00Z',
                    import_window_end: '2025-07-01T00:00:00Z',
                    status: ImportStatus.Failed,
                    progress_percentage: 0,
                    stats: {
                        total_tickets_created: 0,
                        total_messages_imported: 200,
                    },
                }),
            )
        })

        it('should handle empty data', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: [],
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: null,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            expect(result.current.tableProps.importList).toHaveLength(0)
            expect(result.current.tableProps.hasNextItems).toBe(false)
            expect(result.current.tableProps.hasPrevItems).toBe(false)
        })

        it('should map different import statuses correctly', async () => {
            const mockImportData = [
                mockImport({
                    id: 1,
                    status: ImportStatus.Completed,
                    provider_identifier: 'completed@test.com',
                }),
                mockImport({
                    id: 2,
                    status: ImportStatus.Failed,
                    provider_identifier: 'failed@test.com',
                }),
                mockImport({
                    id: 3,
                    status: ImportStatus.InProgress,
                    provider_identifier: 'inprogress@test.com',
                }),
                mockImport({
                    id: 4,
                    status: ImportStatus.InProgress,
                    provider_identifier: 'running@test.com',
                }),
                mockImport({
                    id: 5,
                    status: ImportStatus.InProgress,
                    provider_identifier: 'pending@test.com',
                }),
            ]

            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: mockImportData,
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: null,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            const importList = result.current.tableProps.importList

            expect(importList[0].status).toBe(ImportStatus.InProgress)
            expect(importList[1].status).toBe(ImportStatus.InProgress)
            expect(importList[2].status).toBe(ImportStatus.InProgress)
            expect(importList[3].status).toBe(ImportStatus.Failed)
            expect(importList[4].status).toBe(ImportStatus.Completed)
        })
    })

    describe('pagination functionality', () => {
        it('should handle pagination correctly', async () => {
            const mockImportData = Array.from({ length: 8 }, (_, i) =>
                mockImport({
                    id: i + 1,
                    provider_identifier: `email${String(i + 1).padStart(2, '0')}@test.com`,
                }),
            )

            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: mockImportData,
                    meta: {
                        next_cursor: 'next-cursor',
                        prev_cursor: null,
                        total_resources: 20,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            expect(result.current.tableProps.importList).toHaveLength(8)
            expect(result.current.tableProps.hasNextItems).toBe(true)
            expect(result.current.tableProps.hasPrevItems).toBe(false)
        })

        it('should handle different data when refetched', async () => {
            const mockImportData = Array.from({ length: 5 }, (_, i) =>
                mockImport({
                    id: i + 1,
                    provider_identifier: `email${String(i + 1).padStart(2, '0')}@test.com`,
                }),
            )

            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: mockImportData,
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: null,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            // Verify initial data
            expect(result.current.tableProps.importList).toHaveLength(5)
            expect(result.current.tableProps.hasNextItems).toBe(false)
            expect(result.current.tableProps.hasPrevItems).toBe(false)
        })
    })

    describe('sorting functionality', () => {
        it('should sort imports by email in ascending order by default', async () => {
            const mockImportData = [
                mockImport({
                    id: 1,
                    provider_identifier: 'zebra@test.com',
                }),
                mockImport({
                    id: 2,
                    provider_identifier: 'apple@test.com',
                }),
                mockImport({
                    id: 3,
                    provider_identifier: 'mango@test.com',
                }),
            ]

            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: mockImportData,
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: null,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            const emails = result.current.tableProps.importList.map(
                (item) => item.provider_identifier,
            )
            expect(emails).toEqual([
                'apple@test.com',
                'mango@test.com',
                'zebra@test.com',
            ])
        })

        it('should toggle sort order when handleSortToggle is called', async () => {
            const mockImportData = [
                mockImport({
                    id: 1,
                    provider_identifier: 'zebra@test.com',
                    status: ImportStatus.Completed,
                }),
                mockImport({
                    id: 2,
                    provider_identifier: 'apple@test.com',
                    status: ImportStatus.InProgress,
                }),
                mockImport({
                    id: 3,
                    provider_identifier: 'mango@test.com',
                    status: ImportStatus.Failed,
                }),
            ]

            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: mockImportData,
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: null,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            let emails = result.current.tableProps.importList.map(
                (item) => item.provider_identifier,
            )
            expect(emails).toEqual([
                'apple@test.com',
                'mango@test.com',
                'zebra@test.com',
            ])

            act(() => {
                result.current.tableProps.handleSortToggle()
            })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            emails = result.current.tableProps.importList.map(
                (item) => item.provider_identifier,
            )
            expect(emails).toEqual([
                'zebra@test.com',
                'mango@test.com',
                'apple@test.com',
            ])

            act(() => {
                result.current.tableProps.handleSortToggle()
            })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            emails = result.current.tableProps.importList.map(
                (item) => item.provider_identifier,
            )
            expect(emails).toEqual([
                'apple@test.com',
                'mango@test.com',
                'zebra@test.com',
            ])
        })
    })

    describe('loading and error states', () => {
        it('should handle loading state', () => {
            const mockHandler = mockListImportsHandler(
                async () =>
                    new Promise(() => {
                        // Never resolve to keep loading state
                    }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            expect(result.current.tableProps.isLoading).toBe(true)
            expect(result.current.tableProps.isError).toBe(false)
            expect(result.current.tableProps.importList).toHaveLength(0)
        })

        it('should handle error state', async () => {
            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json(
                    {
                        data: [],
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: null,
                        },
                        object: 'list',
                        uri: '/api/integrations/imports',
                    },
                    { status: 500 },
                ),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isError).toBe(true)
            })

            expect(result.current.tableProps.isLoading).toBe(false)
            expect(result.current.tableProps.importList).toHaveLength(0)
        })

        it('should handle missing stats data gracefully', async () => {
            const baseImport = mockImport({
                id: 1,
                provider_identifier: 'test@example.com',
            })
            // Explicitly remove stats to test the undefined case
            const mockImportData = [
                {
                    ...baseImport,
                    stats: {
                        total_messages_imported: undefined,
                        total_tickets_created: undefined,
                    },
                },
            ]

            const mockHandler = mockListImportsHandler(async () =>
                HttpResponse.json({
                    data: mockImportData,
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: null,
                    },
                    object: 'list',
                    uri: '/api/integrations/imports',
                }),
            )

            server.use(mockHandler.handler)

            const { result } = renderHook(() => useTableImport(), { wrapper })

            await waitFor(() => {
                expect(result.current.tableProps.isLoading).toBe(false)
            })

            expect(
                result.current.tableProps.importList[0].stats
                    .total_tickets_created,
            ).toBe(undefined)
        })
    })
})
