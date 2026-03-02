import React from 'react'

import { act, renderHook } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import type { History } from 'history'
import { Router } from 'react-router-dom'

import { KnowledgeType } from '../types'
import type { GroupedKnowledgeItem } from '../types'
import { useKnowledgeHubUrlParams } from './useKnowledgeHubUrlParams'

jest.mock('../../hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: jest.fn(() => ({
        routes: {
            knowledgeSources: '/app/shop/test-shop/ai-agent/knowledge',
        },
    })),
}))

jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(() => ({
        error: jest.fn(),
        success: jest.fn(),
        info: jest.fn(),
        warning: jest.fn(),
    })),
}))

describe('useKnowledgeHubUrlParams', () => {
    const TEST_SHOP_NAME = 'test-shop'
    const mockTableData: GroupedKnowledgeItem[] = [
        {
            id: '1',
            title: 'Test URL Folder',
            type: KnowledgeType.URL,
            source: 'https://example.com/url',
            isGrouped: true,
        } as GroupedKnowledgeItem,
        {
            id: '2',
            title: 'Test Domain Folder',
            type: KnowledgeType.Domain,
            source: 'https://example.com/domain',
            isGrouped: true,
        } as GroupedKnowledgeItem,
        {
            id: '3',
            title: 'Test FAQ Item',
            type: KnowledgeType.FAQ,
            source: '',
            isGrouped: false,
        } as GroupedKnowledgeItem,
    ]

    const createRouterWrapper = (routerHistory: History) => {
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(Router, { history: routerHistory }, children)
        return wrapper
    }

    describe('initialization', () => {
        it('initializes with no filter or folder when URL has no params', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.selectedFilter).toBeNull()
            expect(result.current.selectedFolder).toBeNull()
            expect(result.current.searchTerm).toBe('')
            expect(result.current.dateRange).toEqual({
                startDate: null,
                endDate: null,
            })
            expect(result.current.inUseByAIFilter).toBeNull()
        })

        it('initializes filter from URL parameter', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.selectedFilter).toBe(KnowledgeType.URL)
            expect(result.current.selectedFolder).toBeNull()
        })

        it('initializes folder from URL parameter', () => {
            const folderUrl = 'https://example.com/folder'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?folder=${encodeURIComponent(folderUrl)}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.selectedFilter).toBeNull()
            expect(result.current.selectedFolder).toMatchObject({
                source: folderUrl,
                title: folderUrl,
            })
        })

        it('initializes both filter and folder from URL parameters', () => {
            const folderUrl = 'https://example.com/folder'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?filter=url&folder=${encodeURIComponent(folderUrl)}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.selectedFilter).toBe(KnowledgeType.URL)
            expect(result.current.selectedFolder).toMatchObject({
                source: folderUrl,
                title: folderUrl,
            })
        })

        it('initializes search term from URL parameter', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?search=test%20query'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.searchTerm).toBe('test query')
        })

        it('initializes date range from URL parameters', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    '/knowledge?startDate=2024-01-01&endDate=2024-12-31',
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.dateRange).toEqual({
                startDate: '2024-01-01',
                endDate: '2024-12-31',
            })
        })

        it('initializes partial date range (only startDate)', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?startDate=2024-01-01'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.dateRange).toEqual({
                startDate: '2024-01-01',
                endDate: null,
            })
        })

        it('initializes inUseByAI filter from URL parameter (true)', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?inUseByAI=true'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.inUseByAIFilter).toBe(true)
        })

        it('initializes inUseByAI filter from URL parameter (false)', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?inUseByAI=false'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.inUseByAIFilter).toBe(false)
        })

        it('initializes all filters from URL parameters', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    '/knowledge?filter=url&search=test&startDate=2024-01-01&endDate=2024-12-31&inUseByAI=true',
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.selectedFilter).toBe(KnowledgeType.URL)
            expect(result.current.searchTerm).toBe('test')
            expect(result.current.dateRange).toEqual({
                startDate: '2024-01-01',
                endDate: '2024-12-31',
            })
            expect(result.current.inUseByAIFilter).toBe(true)
        })
    })

    describe('URL decoding', () => {
        it('handles double-encoded URLs', () => {
            const originalUrl = 'https://example.com/path'
            const doubleEncoded = encodeURIComponent(
                encodeURIComponent(originalUrl),
            )
            const history = createMemoryHistory({
                initialEntries: [`/knowledge?folder=${doubleEncoded}`],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.selectedFolder?.source).toBe(originalUrl)
        })

        it('handles decoding errors gracefully', () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation()

            const invalidEncoded = '%E0%A4%A'
            const history = createMemoryHistory({
                initialEntries: [`/knowledge?folder=${invalidEncoded}`],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // The URL router decodes once: %E0%A4%A → �%A
            // Then our code tries to decode �%A which fails
            const partiallyDecoded = '�%A'

            // reportError logs the error in development
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error))
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error extra:',
                expect.objectContaining({
                    original: partiallyDecoded,
                    error: expect.any(String),
                }),
            )
            // Fallback to the value we received (already decoded once by router)
            expect(result.current.selectedFolder?.source).toBe(partiallyDecoded)

            consoleErrorSpy.mockRestore()
        })

        it('stops decoding when no more percent-encoded characters', () => {
            const partiallyEncoded = 'https://example.com/test%20space'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?folder=${encodeURIComponent(partiallyEncoded)}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // The hook decodes until no more % characters remain
            expect(result.current.selectedFolder?.source).toBe(
                'https://example.com/test space',
            )
        })

        it('limits decoding iterations to prevent infinite loops', () => {
            // Create a URL with many layers of encoding (more than MAX_ITERATIONS)
            let deeplyEncoded = 'https://example.com'
            for (let i = 0; i < 15; i++) {
                deeplyEncoded = encodeURIComponent(deeplyEncoded)
            }

            const history = createMemoryHistory({
                initialEntries: [`/knowledge?folder=${deeplyEncoded}`],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Should stop after MAX_ITERATIONS (10) and return partially decoded result
            expect(result.current.selectedFolder?.source).toBeDefined()
            expect(result.current.selectedFolder?.source).not.toBe(
                deeplyEncoded,
            )
            // Should still contain % characters since we exceeded iteration limit
            expect(result.current.selectedFolder?.source).toContain('%')
        })
    })

    describe('buildUrlWithParams', () => {
        it('returns base path when no params are selected', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            const url = result.current.buildUrlWithParams('/knowledge')
            expect(url).toBe('/knowledge')
        })

        it('includes filter parameter when filter is selected', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            const url = result.current.buildUrlWithParams('/knowledge')
            expect(url).toBe('/knowledge?filter=url')
        })

        it('includes folder parameter when folder is selected', () => {
            const folderUrl = 'https://example.com/folder'
            // Pass double-encoded to simulate real URL encoding behavior
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?folder=${encodeURIComponent(encodeURIComponent(folderUrl))}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            const url = result.current.buildUrlWithParams('/knowledge')
            // buildUrlWithParams encodes with encodeURIComponent, then URLSearchParams.toString() encodes again
            expect(url).toBe(
                `/knowledge?folder=${encodeURIComponent(encodeURIComponent(folderUrl))}`,
            )
        })

        it('includes both filter and folder parameters', () => {
            const folderUrl = 'https://example.com/folder'
            // Pass double-encoded to simulate real URL encoding behavior
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?filter=url&folder=${encodeURIComponent(encodeURIComponent(folderUrl))}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            const url = result.current.buildUrlWithParams('/knowledge')
            // buildUrlWithParams encodes with encodeURIComponent, then URLSearchParams.toString() encodes again
            expect(url).toBe(
                `/knowledge?filter=url&folder=${encodeURIComponent(encodeURIComponent(folderUrl))}`,
            )
        })

        it('includes search parameter when search term is set', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?search=test%20query'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            const url = result.current.buildUrlWithParams('/knowledge')
            expect(url).toBe('/knowledge?search=test+query')
        })

        it('includes date range parameters when dates are set', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    '/knowledge?startDate=2024-01-01&endDate=2024-12-31',
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            const url = result.current.buildUrlWithParams('/knowledge')
            expect(url).toBe(
                '/knowledge?startDate=2024-01-01&endDate=2024-12-31',
            )
        })

        it('includes inUseByAI parameter when filter is set', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?inUseByAI=true'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            const url = result.current.buildUrlWithParams('/knowledge')
            expect(url).toBe('/knowledge?inUseByAI=true')
        })

        it('includes all parameters when all filters are set', () => {
            const folderUrl = 'https://example.com/folder'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?filter=url&folder=${encodeURIComponent(encodeURIComponent(folderUrl))}&search=test&startDate=2024-01-01&endDate=2024-12-31&inUseByAI=true`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            const url = result.current.buildUrlWithParams('/knowledge')
            expect(url).toContain('filter=url')
            expect(url).toContain('search=test')
            expect(url).toContain('startDate=2024-01-01')
            expect(url).toContain('endDate=2024-12-31')
            expect(url).toContain('inUseByAI=true')
            expect(url).toContain(
                `folder=${encodeURIComponent(encodeURIComponent(folderUrl))}`,
            )
        })
    })

    describe('filter state management', () => {
        it('syncs filter state when URL changes', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.selectedFilter).toBeNull()

            act(() => {
                history.push('/knowledge?filter=url')
            })

            expect(result.current.selectedFilter).toBe(KnowledgeType.URL)
        })

        it('updates filter using setSelectedFilter without reverting (state-only change)', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.setSelectedFilter(KnowledgeType.FAQ)
            })

            expect(history.location.search).toBe('')
        })
    })

    describe('folder state management', () => {
        it('clears folder when URL has no folder param', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?folder=${encodeURIComponent('https://example.com')}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.selectedFolder).not.toBeNull()

            act(() => {
                history.push('/knowledge')
            })

            expect(result.current.selectedFolder).toBeNull()
        })

        it('upgrades folder when tableData loads even if it has a title', () => {
            const folderUrl = 'https://example.com/url'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?folder=${encodeURIComponent(encodeURIComponent(folderUrl))}`,
                ],
            })

            // Start with empty tableData, then add data to see if upgrade happens
            const { result, rerender } = renderHook(
                (props) =>
                    useKnowledgeHubUrlParams(TEST_SHOP_NAME, props.tableData),
                {
                    wrapper: createRouterWrapper(history),
                    initialProps: { tableData: [] as GroupedKnowledgeItem[] },
                },
            )

            // Initially has minimal folder object with title
            expect(result.current.selectedFolder).toMatchObject({
                source: folderUrl,
                title: folderUrl,
            })

            // Update with tableData
            act(() => {
                rerender({ tableData: mockTableData })
            })

            // Folder IS upgraded because the minimal object is missing the type property
            // The upgrade logic triggers when !selectedFolder.type
            expect(result.current.selectedFolder).toMatchObject({
                id: '1',
                title: 'Test URL Folder',
                type: KnowledgeType.URL,
                source: folderUrl,
                isGrouped: true,
            })
            // Should now have the full object properties
            expect(result.current.selectedFolder).toHaveProperty('id', '1')
            expect(result.current.selectedFolder).toHaveProperty(
                'type',
                KnowledgeType.URL,
            )
        })

        it('clears folder when not found in tableData (deleted folder)', () => {
            const unknownUrl = 'https://example.com/unknown'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?folder=${encodeURIComponent(unknownUrl)}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Folder should be cleared when not found (treated as deleted)
            expect(result.current.selectedFolder).toBeNull()
            // URL parameter should also be removed
            expect(history.location.search).toBe('')
        })

        it('updates folder using setSelectedFolder but gets reverted without URL change', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            const newFolder = mockTableData[0]

            act(() => {
                result.current.setSelectedFolder(newFolder)
            })

            // setSelectedFolder alone doesn't update URL, so useEffect reverts it
            expect(result.current.selectedFolder).toBe(null)
        })
    })

    describe('deleted folder validation', () => {
        it('clears folder param from URL when folder is deleted', () => {
            const deletedFolderUrl = 'https://example.com/deleted'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?folder=${encodeURIComponent(deletedFolderUrl)}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Folder param should be removed from URL
            expect(history.location.search).toBe('')
            // selectedFolder should be null
            expect(result.current.selectedFolder).toBeNull()
        })

        it('clears selectedFolder state when folder is deleted', () => {
            const deletedFolderUrl = 'https://example.com/deleted'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?folder=${encodeURIComponent(deletedFolderUrl)}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.selectedFolder).toBeNull()
        })

        it('does not show error when tableData is empty (loading state)', () => {
            const deletedFolderUrl = 'https://example.com/deleted'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?folder=${encodeURIComponent(deletedFolderUrl)}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Should create minimal folder object when tableData is empty
            expect(result.current.selectedFolder).toMatchObject({
                source: deletedFolderUrl,
                title: deletedFolderUrl,
            })
            // URL should not be modified while loading
            expect(history.location.search).toBe(
                `?folder=${encodeURIComponent(deletedFolderUrl)}`,
            )
        })

        it('silently clears folder param when viewing article with deleted folder', () => {
            const deletedFolderUrl = 'https://example.com/deleted'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge/document/123?folder=${encodeURIComponent(deletedFolderUrl)}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Folder param should be removed from URL
            expect(history.location.search).toBe('')
            // selectedFolder should be null
            expect(result.current.selectedFolder).toBeNull()
        })

        it('preserves other URL params when clearing deleted folder', () => {
            const deletedFolderUrl = 'https://example.com/deleted'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?filter=url&folder=${encodeURIComponent(deletedFolderUrl)}&search=test`,
                ],
            })

            renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Filter param should be preserved (knowledge type filter)
            expect(history.location.search).toContain('filter=url')
            // Search param should be cleared along with folder
            expect(history.location.search).not.toContain('search=test')
            // Folder param should be removed
            expect(history.location.search).not.toContain('folder=')
        })

        it('handles transition from valid to deleted folder', () => {
            const validFolderUrl = 'https://example.com/url'
            const deletedFolderUrl = 'https://example.com/deleted'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?folder=${encodeURIComponent(validFolderUrl)}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Initially has valid folder
            expect(result.current.selectedFolder).toMatchObject({
                source: validFolderUrl,
                type: KnowledgeType.URL,
            })

            // Navigate to deleted folder
            act(() => {
                history.push(
                    `/knowledge?folder=${encodeURIComponent(deletedFolderUrl)}`,
                )
            })

            // Folder param should be removed from URL
            expect(history.location.search).toBe('')
            // selectedFolder should be null
            expect(result.current.selectedFolder).toBeNull()
        })

        it('handles folder becoming available after loading', () => {
            const folderUrl = 'https://example.com/url'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?folder=${encodeURIComponent(folderUrl)}`,
                ],
            })

            const { result, rerender } = renderHook(
                (props) =>
                    useKnowledgeHubUrlParams(TEST_SHOP_NAME, props.tableData),
                {
                    wrapper: createRouterWrapper(history),
                    initialProps: { tableData: [] as GroupedKnowledgeItem[] },
                },
            )

            // Initially has minimal folder object (tableData is empty/loading)
            expect(result.current.selectedFolder).toMatchObject({
                source: folderUrl,
                title: folderUrl,
            })

            // Load tableData with the folder
            act(() => {
                rerender({ tableData: mockTableData })
            })

            // Should upgrade to full folder object
            expect(result.current.selectedFolder).toMatchObject({
                id: '1',
                type: KnowledgeType.URL,
                source: folderUrl,
                isGrouped: true,
            })
            // URL should be preserved
            expect(history.location.search).toContain('folder=')
        })

        it('creates minimal folder object then validates after tableData loads', () => {
            const deletedFolderUrl = 'https://example.com/deleted'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?folder=${encodeURIComponent(deletedFolderUrl)}`,
                ],
            })

            const { result, rerender } = renderHook(
                (props) =>
                    useKnowledgeHubUrlParams(TEST_SHOP_NAME, props.tableData),
                {
                    wrapper: createRouterWrapper(history),
                    initialProps: { tableData: [] as GroupedKnowledgeItem[] },
                },
            )

            // Initially has minimal folder object when tableData is empty
            expect(result.current.selectedFolder).toMatchObject({
                source: deletedFolderUrl,
                title: deletedFolderUrl,
            })

            // Load tableData without the folder
            act(() => {
                rerender({ tableData: mockTableData })
            })

            // Folder should be cleared after validation
            expect(result.current.selectedFolder).toBeNull()
            // URL should be updated
            expect(history.location.search).toBe('')
        })
    })

    describe('handleDocumentFilterChange', () => {
        it('updates filter and URL when changing filter', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.handleDocumentFilterChange(KnowledgeType.URL)
            })

            expect(result.current.selectedFilter).toBe(KnowledgeType.URL)
            expect(history.location.search).toBe('?filter=url')
        })

        it('clears filter and URL param when setting to null', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.handleDocumentFilterChange(null)
            })

            expect(result.current.selectedFilter).toBeNull()
            expect(history.location.search).toBe('')
        })

        it('clears folder when changing to incompatible filter', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?filter=url&folder=${encodeURIComponent('https://example.com')}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.setSelectedFolder({
                    ...mockTableData[0],
                    type: KnowledgeType.URL,
                })
            })

            expect(result.current.selectedFolder).not.toBeNull()

            act(() => {
                result.current.handleDocumentFilterChange(KnowledgeType.FAQ)
            })

            expect(result.current.selectedFilter).toBe(KnowledgeType.FAQ)
            expect(result.current.selectedFolder).toBeNull()
            expect(history.location.search).toBe('?filter=faq')
        })

        it('preserves folder when changing to compatible filter', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.setSelectedFolder({
                    ...mockTableData[0],
                    type: KnowledgeType.URL,
                })
            })

            const folderBeforeChange = result.current.selectedFolder

            act(() => {
                result.current.handleDocumentFilterChange(KnowledgeType.URL)
            })

            expect(result.current.selectedFolder).toBe(folderBeforeChange)
        })
    })

    describe('updateUrlWithFolderParam', () => {
        it('adds folder parameter to URL', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[0])
            })

            // URLSearchParams.toString() encodes the already-encoded value, resulting in double-encoding
            expect(history.location.search).toBe(
                `?folder=${encodeURIComponent(encodeURIComponent(mockTableData[0].source!))}`,
            )
        })

        it('updates existing folder parameter in URL', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?folder=${encodeURIComponent(encodeURIComponent('https://old.com'))}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[0])
            })

            // URLSearchParams.toString() encodes the already-encoded value, resulting in double-encoding
            expect(history.location.search).toBe(
                `?folder=${encodeURIComponent(encodeURIComponent(mockTableData[0].source!))}`,
            )
        })

        it('preserves filter parameter when updating folder', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[0])
            })

            expect(history.location.search).toContain('filter=url')
            // URLSearchParams.toString() encodes the already-encoded value, resulting in double-encoding
            expect(history.location.search).toContain(
                `folder=${encodeURIComponent(encodeURIComponent(mockTableData[0].source!))}`,
            )
        })
    })

    describe('removeFolderParamFromUrl', () => {
        it('removes folder parameter from URL', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?folder=${encodeURIComponent('https://example.com')}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.removeFolderParamFromUrl()
            })

            expect(history.location.search).toBe('')
        })

        it('preserves filter parameter when removing folder', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?filter=url&folder=${encodeURIComponent('https://example.com')}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.removeFolderParamFromUrl()
            })

            expect(history.location.search).toBe('?filter=url')
        })

        it('handles removing folder param when none exists', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.removeFolderParamFromUrl()
            })

            expect(history.location.search).toBe('?filter=url')
        })
    })

    describe('search term management', () => {
        it('syncs search term when URL changes', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.searchTerm).toBe('')

            act(() => {
                history.push('/knowledge?search=test')
            })

            expect(result.current.searchTerm).toBe('test')
        })

        it('updates search term and URL using setSearchTerm', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.setSearchTerm('new search')
            })

            expect(result.current.searchTerm).toBe('new search')
            expect(history.location.search).toContain('search=new+search')
        })

        it('clears search term and URL param when setting to empty string', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?search=test'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.setSearchTerm('')
            })

            expect(result.current.searchTerm).toBe('')
            expect(history.location.search).toBe('')
        })

        it('preserves other params when updating search', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.setSearchTerm('test')
            })

            expect(history.location.search).toContain('filter=url')
            expect(history.location.search).toContain('search=test')
        })
    })

    describe('date range management', () => {
        it('syncs date range when URL changes', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.dateRange).toEqual({
                startDate: null,
                endDate: null,
            })

            act(() => {
                history.push(
                    '/knowledge?startDate=2024-01-01&endDate=2024-12-31',
                )
            })

            expect(result.current.dateRange).toEqual({
                startDate: '2024-01-01',
                endDate: '2024-12-31',
            })
        })

        it('updates date range and URL using setDateRange', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.setDateRange('2024-01-01', '2024-12-31')
            })

            expect(result.current.dateRange).toEqual({
                startDate: '2024-01-01',
                endDate: '2024-12-31',
            })
            expect(history.location.search).toBe(
                '?startDate=2024-01-01&endDate=2024-12-31',
            )
        })

        it('clears date range and URL params when setting to null', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    '/knowledge?startDate=2024-01-01&endDate=2024-12-31',
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.setDateRange(null, null)
            })

            expect(result.current.dateRange).toEqual({
                startDate: null,
                endDate: null,
            })
            expect(history.location.search).toBe('')
        })

        it('handles partial date range (only startDate)', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.setDateRange('2024-01-01', null)
            })

            expect(result.current.dateRange).toEqual({
                startDate: '2024-01-01',
                endDate: null,
            })
            expect(history.location.search).toBe('?startDate=2024-01-01')
        })

        it('preserves other params when updating date range', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.setDateRange('2024-01-01', '2024-12-31')
            })

            expect(history.location.search).toContain('filter=url')
            expect(history.location.search).toContain('startDate=2024-01-01')
            expect(history.location.search).toContain('endDate=2024-12-31')
        })
    })

    describe('inUseByAI filter management', () => {
        it('syncs inUseByAI filter when URL changes', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.inUseByAIFilter).toBeNull()

            act(() => {
                history.push('/knowledge?inUseByAI=true')
            })

            expect(result.current.inUseByAIFilter).toBe(true)
        })

        it('updates inUseByAI filter and URL using setInUseByAIFilter', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.setInUseByAIFilter(true)
            })

            expect(result.current.inUseByAIFilter).toBe(true)
            expect(history.location.search).toBe('?inUseByAI=true')
        })

        it('handles false value for inUseByAI filter', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.setInUseByAIFilter(false)
            })

            expect(result.current.inUseByAIFilter).toBe(false)
            expect(history.location.search).toBe('?inUseByAI=false')
        })

        it('clears inUseByAI filter and URL param when setting to null', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?inUseByAI=true'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.setInUseByAIFilter(null)
            })

            expect(result.current.inUseByAIFilter).toBeNull()
            expect(history.location.search).toBe('')
        })

        it('preserves other params when updating inUseByAI filter', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.setInUseByAIFilter(true)
            })

            expect(history.location.search).toContain('filter=url')
            expect(history.location.search).toContain('inUseByAI=true')
        })
    })

    describe('handleCloseEditorPath', () => {
        it('navigates to knowledge sources base path with no params', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge/edit'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.handleCloseEditorPath()
            })

            expect(history.location.pathname).toBe(
                '/app/shop/test-shop/ai-agent/knowledge',
            )
            expect(history.location.search).toBe('')
        })

        it('navigates to knowledge sources with filter param', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge/edit?filter=url'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.handleCloseEditorPath()
            })

            expect(history.location.pathname).toBe(
                '/app/shop/test-shop/ai-agent/knowledge',
            )
            expect(history.location.search).toBe('?filter=url')
        })

        it('navigates to knowledge sources with folder param', () => {
            const folderUrl = 'https://example.com/folder'
            const tableData: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    title: 'Test Folder',
                    type: KnowledgeType.URL,
                    source: folderUrl,
                    isGrouped: true,
                } as GroupedKnowledgeItem,
            ]
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge/edit?folder=${encodeURIComponent(encodeURIComponent(folderUrl))}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, tableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.handleCloseEditorPath()
            })

            expect(history.location.pathname).toBe(
                '/app/shop/test-shop/ai-agent/knowledge',
            )
            expect(history.location.search).toBe(
                `?folder=${encodeURIComponent(encodeURIComponent(folderUrl))}`,
            )
        })

        it('navigates to knowledge sources with both filter and folder params', () => {
            const folderUrl = 'https://example.com/folder'
            const tableData: GroupedKnowledgeItem[] = [
                {
                    id: '1',
                    title: 'Test Folder',
                    type: KnowledgeType.URL,
                    source: folderUrl,
                    isGrouped: true,
                } as GroupedKnowledgeItem,
            ]
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge/edit?filter=url&folder=${encodeURIComponent(encodeURIComponent(folderUrl))}`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, tableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.handleCloseEditorPath()
            })

            expect(history.location.pathname).toBe(
                '/app/shop/test-shop/ai-agent/knowledge',
            )
            expect(history.location.search).toBe(
                `?filter=url&folder=${encodeURIComponent(encodeURIComponent(folderUrl))}`,
            )
        })

        it('navigates to knowledge sources with all filters preserved', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    '/knowledge/edit?filter=url&search=test&startDate=2024-01-01&endDate=2024-12-31&inUseByAI=true',
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.handleCloseEditorPath()
            })

            expect(history.location.pathname).toBe(
                '/app/shop/test-shop/ai-agent/knowledge',
            )
            expect(history.location.search).toContain('filter=url')
            expect(history.location.search).toContain('search=test')
            expect(history.location.search).toContain('startDate=2024-01-01')
            expect(history.location.search).toContain('endDate=2024-12-31')
            expect(history.location.search).toContain('inUseByAI=true')
        })

        it('uses history.push to navigate', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge/edit?filter=url'],
            })
            const pushSpy = jest.spyOn(history, 'push')

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.handleCloseEditorPath()
            })

            expect(pushSpy).toHaveBeenCalledWith(
                '/app/shop/test-shop/ai-agent/knowledge?filter=url',
            )
            expect(pushSpy).toHaveBeenCalledTimes(1)

            pushSpy.mockRestore()
        })
    })

    describe('article viewing and folder preservation', () => {
        it('preserves folder data when viewing an article', () => {
            const folderUrl = 'https://example.com/url'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge/document/123?folder=${encodeURIComponent(folderUrl)}`,
                ],
            })

            const { result } = renderHook(
                (props) =>
                    useKnowledgeHubUrlParams(TEST_SHOP_NAME, props.tableData),
                {
                    wrapper: createRouterWrapper(history),
                    initialProps: { tableData: mockTableData },
                },
            )

            // selectedFolder should be upgraded to full folder object from tableData
            expect(result.current.selectedFolder).toMatchObject({
                id: '1',
                title: 'Test URL Folder',
                type: KnowledgeType.URL,
                source: folderUrl,
                isGrouped: true,
            })
        })

        it('does not change selectedFolder when viewing article if folder already has full data', () => {
            const folderUrl = 'https://example.com/url'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge/document/123?folder=${encodeURIComponent(folderUrl)}`,
                ],
            })

            const { result, rerender } = renderHook(
                (props) =>
                    useKnowledgeHubUrlParams(TEST_SHOP_NAME, props.tableData),
                {
                    wrapper: createRouterWrapper(history),
                    initialProps: { tableData: mockTableData },
                },
            )

            const firstFolder = result.current.selectedFolder

            // Rerender with same data - should not change selectedFolder
            act(() => {
                rerender({ tableData: mockTableData })
            })

            expect(result.current.selectedFolder).toBe(firstFolder)
        })

        it('upgrades selectedFolder when viewing article if missing required properties', () => {
            const folderUrl = 'https://example.com/url'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge/document/123?folder=${encodeURIComponent(folderUrl)}`,
                ],
            })

            const { result, rerender } = renderHook(
                (props) =>
                    useKnowledgeHubUrlParams(TEST_SHOP_NAME, props.tableData),
                {
                    wrapper: createRouterWrapper(history),
                    initialProps: { tableData: [] as GroupedKnowledgeItem[] },
                },
            )

            // Initially has minimal folder object
            expect(result.current.selectedFolder).toMatchObject({
                source: folderUrl,
                title: folderUrl,
            })
            expect(result.current.selectedFolder).not.toHaveProperty('type')

            // Update with tableData - should upgrade even when viewing article
            act(() => {
                rerender({ tableData: mockTableData })
            })

            // Should now have full folder object
            expect(result.current.selectedFolder).toMatchObject({
                id: '1',
                title: 'Test URL Folder',
                type: KnowledgeType.URL,
                source: folderUrl,
                isGrouped: true,
            })
        })

        it('maintains folder data after closing article editor', () => {
            const folderUrl = 'https://example.com/url'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge/document/123?folder=${encodeURIComponent(folderUrl)}`,
                ],
            })

            const { result } = renderHook(
                (props) =>
                    useKnowledgeHubUrlParams(TEST_SHOP_NAME, props.tableData),
                {
                    wrapper: createRouterWrapper(history),
                    initialProps: { tableData: mockTableData },
                },
            )

            // selectedFolder should have full folder object
            const folderBeforeClose = result.current.selectedFolder
            expect(folderBeforeClose).toMatchObject({
                id: '1',
                title: 'Test URL Folder',
                type: KnowledgeType.URL,
                source: folderUrl,
            })

            // Simulate closing editor by navigating to folder view
            act(() => {
                history.push(
                    `/app/shop/test-shop/ai-agent/knowledge?folder=${encodeURIComponent(folderUrl)}`,
                )
            })

            // selectedFolder should still have same folder data
            expect(result.current.selectedFolder).toMatchObject({
                id: '1',
                title: 'Test URL Folder',
                type: KnowledgeType.URL,
                source: folderUrl,
                isGrouped: true,
            })
        })

        it('creates folder object from individual items when not already grouped', () => {
            const folderUrl = 'https://example.com/ungrouped'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?folder=${encodeURIComponent(folderUrl)}`,
                ],
            })

            const ungroupedItems: GroupedKnowledgeItem[] = [
                {
                    id: '10',
                    title: 'Individual Item 1',
                    type: KnowledgeType.Document,
                    source: folderUrl,
                    isGrouped: false,
                    lastUpdatedAt: '2024-01-02',
                } as GroupedKnowledgeItem,
                {
                    id: '11',
                    title: 'Individual Item 2',
                    type: KnowledgeType.Document,
                    source: folderUrl,
                    isGrouped: false,
                    lastUpdatedAt: '2024-01-01',
                } as GroupedKnowledgeItem,
            ]

            const { result } = renderHook(
                (props) =>
                    useKnowledgeHubUrlParams(TEST_SHOP_NAME, props.tableData),
                {
                    wrapper: createRouterWrapper(history),
                    initialProps: { tableData: ungroupedItems },
                },
            )

            // Should create folder object from individual items
            expect(result.current.selectedFolder).toMatchObject({
                type: KnowledgeType.Document,
                source: folderUrl,
                title: folderUrl, // Uses source as title for ungrouped items
                isGrouped: true,
                itemCount: 2,
            })

            // Should use most recent item's properties
            expect(result.current.selectedFolder?.id).toBe('10')
            expect(result.current.selectedFolder?.lastUpdatedAt).toBe(
                '2024-01-02',
            )
        })
    })

    describe('clearSearchParams', () => {
        it('clears search term and updates URL', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?search=test'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Initial state
            expect(result.current.searchTerm).toBe('test')
            expect(history.location.search).toBe('?search=test')

            // Clear search params
            act(() => {
                result.current.clearSearchParams()
            })

            // State should be cleared
            expect(result.current.searchTerm).toBe('')
            // URL should be updated
            expect(history.location.search).toBe('')
        })

        it('clears date range and updates URL', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    '/knowledge?startDate=2024-01-01&endDate=2024-12-31',
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Initial state
            expect(result.current.dateRange).toEqual({
                startDate: '2024-01-01',
                endDate: '2024-12-31',
            })

            // Clear search params
            act(() => {
                result.current.clearSearchParams()
            })

            // State should be cleared
            expect(result.current.dateRange).toEqual({
                startDate: null,
                endDate: null,
            })
            // URL should be updated
            expect(history.location.search).toBe('')
        })

        it('clears inUseByAI filter and updates URL', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?inUseByAI=true'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Initial state
            expect(result.current.inUseByAIFilter).toBe(true)

            // Clear search params
            act(() => {
                result.current.clearSearchParams()
            })

            // State should be cleared
            expect(result.current.inUseByAIFilter).toBeNull()
            // URL should be updated
            expect(history.location.search).toBe('')
        })

        it('clears all search params at once', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    '/knowledge?search=test&startDate=2024-01-01&endDate=2024-12-31&inUseByAI=true',
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Initial state
            expect(result.current.searchTerm).toBe('test')
            expect(result.current.dateRange).toEqual({
                startDate: '2024-01-01',
                endDate: '2024-12-31',
            })
            expect(result.current.inUseByAIFilter).toBe(true)

            // Clear all search params
            act(() => {
                result.current.clearSearchParams()
            })

            // All state should be cleared
            expect(result.current.searchTerm).toBe('')
            expect(result.current.dateRange).toEqual({
                startDate: null,
                endDate: null,
            })
            expect(result.current.inUseByAIFilter).toBeNull()
            // URL should be updated
            expect(history.location.search).toBe('')
        })

        it('preserves filter parameter when clearing search params', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    '/knowledge?filter=url&search=test&startDate=2024-01-01',
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Clear search params
            act(() => {
                result.current.clearSearchParams()
            })

            // Filter should be preserved
            expect(result.current.selectedFilter).toBe(KnowledgeType.URL)
            expect(history.location.search).toBe('?filter=url')

            // Search params should be cleared
            expect(result.current.searchTerm).toBe('')
            expect(result.current.dateRange).toEqual({
                startDate: null,
                endDate: null,
            })
        })

        it('preserves folder parameter when clearing search params', () => {
            const folderUrl = 'https://example.com/url' // Use a folder that exists in mockTableData
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?folder=${encodeURIComponent(folderUrl)}&search=test&inUseByAI=true`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Clear search params
            act(() => {
                result.current.clearSearchParams()
            })

            // Folder should be preserved
            expect(result.current.selectedFolder?.source).toBe(folderUrl)
            expect(history.location.search).toContain(
                `folder=${encodeURIComponent(folderUrl)}`,
            )

            // Search params should be cleared
            expect(result.current.searchTerm).toBe('')
            expect(result.current.inUseByAIFilter).toBeNull()
        })

        it('preserves both filter and folder when clearing search params', () => {
            const folderUrl = 'https://example.com/url'
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?filter=url&folder=${encodeURIComponent(folderUrl)}&search=test&startDate=2024-01-01&endDate=2024-12-31&inUseByAI=false`,
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Clear search params
            act(() => {
                result.current.clearSearchParams()
            })

            // Filter and folder should be preserved
            expect(result.current.selectedFilter).toBe(KnowledgeType.URL)
            expect(result.current.selectedFolder?.source).toBe(folderUrl)
            expect(history.location.search).toContain('filter=url')
            expect(history.location.search).toContain(
                `folder=${encodeURIComponent(folderUrl)}`,
            )

            // All search params should be cleared
            expect(result.current.searchTerm).toBe('')
            expect(result.current.dateRange).toEqual({
                startDate: null,
                endDate: null,
            })
            expect(result.current.inUseByAIFilter).toBeNull()
            expect(history.location.search).not.toContain('search=')
            expect(history.location.search).not.toContain('startDate=')
            expect(history.location.search).not.toContain('endDate=')
            expect(history.location.search).not.toContain('inUseByAI=')
        })

        it('handles clearing when no search params exist', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Clear search params (even though none exist)
            act(() => {
                result.current.clearSearchParams()
            })

            // Should not error and filter should remain
            expect(result.current.selectedFilter).toBe(KnowledgeType.URL)
            expect(result.current.searchTerm).toBe('')
            expect(result.current.dateRange).toEqual({
                startDate: null,
                endDate: null,
            })
            expect(result.current.inUseByAIFilter).toBeNull()
        })

        it('can clear search params multiple times', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?search=test'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Clear first time
            act(() => {
                result.current.clearSearchParams()
            })

            expect(result.current.searchTerm).toBe('')

            // Set search again
            act(() => {
                result.current.setSearchTerm('new search')
            })

            expect(result.current.searchTerm).toBe('new search')

            // Clear second time
            act(() => {
                result.current.clearSearchParams()
            })

            expect(result.current.searchTerm).toBe('')
            expect(history.location.search).toBe('')
        })
    })

    describe('history navigation behavior', () => {
        it('updateUrlWithFolderParam uses history.push to create new entry', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })
            const pushSpy = jest.spyOn(history, 'push')

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[0])
            })

            expect(pushSpy).toHaveBeenCalledTimes(1)
            expect(pushSpy).toHaveBeenCalledWith(
                expect.stringContaining('folder='),
            )

            pushSpy.mockRestore()
        })

        it('handleDocumentFilterChange uses history.push to create new entry', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })
            const pushSpy = jest.spyOn(history, 'push')

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.handleDocumentFilterChange(KnowledgeType.URL)
            })

            expect(pushSpy).toHaveBeenCalledTimes(1)
            expect(pushSpy).toHaveBeenCalledWith('/knowledge?filter=url')

            pushSpy.mockRestore()
        })

        it('removeFolderParamFromUrl uses history.push to create new entry', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    `/knowledge?folder=${encodeURIComponent('https://example.com')}`,
                ],
            })
            const pushSpy = jest.spyOn(history, 'push')

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.removeFolderParamFromUrl()
            })

            expect(pushSpy).toHaveBeenCalledTimes(1)
            expect(pushSpy).toHaveBeenCalledWith('/knowledge')

            pushSpy.mockRestore()
        })

        it('setSearchTerm uses history.push to create new entry', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })
            const pushSpy = jest.spyOn(history, 'push')

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.setSearchTerm('test query')
            })

            expect(pushSpy).toHaveBeenCalledTimes(1)
            expect(pushSpy).toHaveBeenCalledWith('/knowledge?search=test+query')

            pushSpy.mockRestore()
        })

        it('setDateRange uses history.push to create new entry', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })
            const pushSpy = jest.spyOn(history, 'push')

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.setDateRange('2024-01-01', '2024-12-31')
            })

            expect(pushSpy).toHaveBeenCalledTimes(1)
            expect(pushSpy).toHaveBeenCalledWith(
                '/knowledge?startDate=2024-01-01&endDate=2024-12-31',
            )

            pushSpy.mockRestore()
        })

        it('setInUseByAIFilter uses history.push to create new entry', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })
            const pushSpy = jest.spyOn(history, 'push')

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.setInUseByAIFilter(true)
            })

            expect(pushSpy).toHaveBeenCalledTimes(1)
            expect(pushSpy).toHaveBeenCalledWith('/knowledge?inUseByAI=true')

            pushSpy.mockRestore()
        })

        it('clearSearchParams uses history.push to create new entry', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?search=test&inUseByAI=true'],
            })
            const pushSpy = jest.spyOn(history, 'push')

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            act(() => {
                result.current.clearSearchParams()
            })

            expect(pushSpy).toHaveBeenCalledTimes(1)
            expect(pushSpy).toHaveBeenCalledWith('/knowledge')

            pushSpy.mockRestore()
        })

        it('browser back button works after folder selection', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Initial state - no folder
            expect(result.current.selectedFolder).toBeNull()
            expect(history.location.search).toBe('')

            // Select a folder
            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[0])
            })

            // Folder should be selected
            expect(history.location.search).toContain('folder=')

            // Go back
            act(() => {
                history.goBack()
            })

            // Should return to initial state
            expect(history.location.search).toBe('')
        })

        it('browser back button works after filter change', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Initial state - no filter
            expect(result.current.selectedFilter).toBeNull()
            expect(history.location.search).toBe('')

            // Set a filter
            act(() => {
                result.current.handleDocumentFilterChange(KnowledgeType.FAQ)
            })

            // Filter should be set
            expect(result.current.selectedFilter).toBe(KnowledgeType.FAQ)
            expect(history.location.search).toBe('?filter=faq')

            // Go back
            act(() => {
                history.goBack()
            })

            // Should return to initial state
            expect(result.current.selectedFilter).toBeNull()
            expect(history.location.search).toBe('')
        })

        it('history length increases with each navigation action', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            const initialLength = history.length

            // Each action should increase history length
            act(() => {
                result.current.handleDocumentFilterChange(KnowledgeType.URL)
            })

            expect(history.length).toBe(initialLength + 1)

            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[0])
            })

            expect(history.length).toBe(initialLength + 2)

            act(() => {
                result.current.setSearchTerm('test')
            })

            expect(history.length).toBe(initialLength + 3)
        })
    })

    describe('guardedPush - duplicate URL prevention', () => {
        it('prevents duplicate history pushes when URL does not change', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            const initialLength = history.length

            // First push - should succeed
            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[0])
            })

            expect(history.length).toBe(initialLength + 1)
            expect(history.location.search).toContain('folder=')

            // Second push with same folder - should be blocked
            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[0])
            })

            expect(history.length).toBe(initialLength + 1) // No new entry
        })

        it('allows history push when URL actually changes', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            const initialLength = history.length

            // Push first folder
            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[0])
            })

            expect(history.length).toBe(initialLength + 1)

            // Push different folder - should succeed
            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[1])
            })

            expect(history.length).toBe(initialLength + 2)
        })

        it('prevents duplicate pushes from handleDocumentFilterChange', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            const initialLength = history.length

            // Change to same filter - should be blocked
            act(() => {
                result.current.handleDocumentFilterChange(KnowledgeType.URL)
            })

            expect(history.length).toBe(initialLength) // No new entry
        })

        it('allows push from handleDocumentFilterChange when filter changes', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            const initialLength = history.length

            // Change to different filter - should succeed
            act(() => {
                result.current.handleDocumentFilterChange(KnowledgeType.FAQ)
            })

            expect(history.length).toBe(initialLength + 1)
            expect(history.location.search).toBe('?filter=faq')
        })
    })

    describe('filter sync effect - dependency fix', () => {
        it('does not revert filter state when user clicks filter button', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=faq'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.selectedFilter).toBe(KnowledgeType.FAQ)

            // User clicks "All content" button
            act(() => {
                result.current.handleDocumentFilterChange(null)
            })

            // State should be null (all content)
            expect(result.current.selectedFilter).toBeNull()
            expect(history.location.search).toBe('')
        })

        it('syncs filter state when URL changes via browser navigation', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.selectedFilter).toBeNull()

            // Simulate browser navigation (back/forward button)
            act(() => {
                history.push('/knowledge?filter=url')
            })

            // State should sync from URL
            expect(result.current.selectedFilter).toBe(KnowledgeType.URL)
        })

        it('shows all content when filter is null', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=faq'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, []),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Change to all content
            act(() => {
                result.current.handleDocumentFilterChange(null)
            })

            expect(result.current.selectedFilter).toBeNull()
            expect(history.location.search).toBe('')
        })
    })

    describe('filter clearing when entering folder', () => {
        it('clears search, date, and AI filters when entering folder from list view', () => {
            const history = createMemoryHistory({
                initialEntries: [
                    '/knowledge?filter=url&search=test&startDate=2024-01-01&endDate=2024-12-31&inUseByAI=true',
                ],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.searchTerm).toBe('test')
            expect(result.current.dateRange.startDate).toBe('2024-01-01')
            expect(result.current.inUseByAIFilter).toBe(true)

            // Enter folder
            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[0])
            })

            // Filters should be cleared
            expect(result.current.searchTerm).toBe('')
            expect(result.current.dateRange).toEqual({
                startDate: null,
                endDate: null,
            })
            expect(result.current.inUseByAIFilter).toBeNull()

            // URL should not have search/date/AI params
            expect(history.location.search).not.toContain('search=')
            expect(history.location.search).not.toContain('startDate=')
            expect(history.location.search).not.toContain('endDate=')
            expect(history.location.search).not.toContain('inUseByAI=')
        })

        it('preserves type filter when entering folder', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url&search=test'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.selectedFilter).toBe(KnowledgeType.URL)

            // Enter folder
            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[0])
            })

            // Type filter should be preserved
            expect(result.current.selectedFilter).toBe(KnowledgeType.URL)
            expect(history.location.search).toContain('filter=url')
            expect(history.location.search).toContain('folder=')
        })

        it('does not clear filters when navigating within folder view', () => {
            // Use folder from mockTableData that exists
            const folderUrl = encodeURIComponent(mockTableData[0].source!)
            const history = createMemoryHistory({
                initialEntries: [`/knowledge?filter=url&folder=${folderUrl}`],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            // Verify we're in folder view
            expect(result.current.selectedFolder).not.toBeNull()

            // Navigate to different folder (also from mockTableData)
            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[1])
            })

            // Should still be in folder view
            expect(history.location.search).toContain('folder=')
            expect(result.current.selectedFolder).not.toBeNull()
        })

        it('clears only search term when entering folder (line 326)', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url&search=test'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.searchTerm).toBe('test')
            expect(result.current.dateRange.startDate).toBeNull()
            expect(result.current.inUseByAIFilter).toBeNull()

            // Enter folder
            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[0])
            })

            // Only search term should be cleared
            expect(result.current.searchTerm).toBe('')
            expect(history.location.search).not.toContain('search=')
        })

        it('clears only start date when entering folder (lines 327-328)', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url&startDate=2024-01-01'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.dateRange.startDate).toBe('2024-01-01')
            expect(result.current.dateRange.endDate).toBeNull()
            expect(result.current.searchTerm).toBe('')
            expect(result.current.inUseByAIFilter).toBeNull()

            // Enter folder
            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[0])
            })

            // Only date range should be cleared
            expect(result.current.dateRange).toEqual({
                startDate: null,
                endDate: null,
            })
            expect(history.location.search).not.toContain('startDate=')
        })

        it('clears only end date when entering folder (lines 327-328)', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url&endDate=2024-12-31'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.dateRange.startDate).toBeNull()
            expect(result.current.dateRange.endDate).toBe('2024-12-31')
            expect(result.current.searchTerm).toBe('')
            expect(result.current.inUseByAIFilter).toBeNull()

            // Enter folder
            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[0])
            })

            // Only date range should be cleared
            expect(result.current.dateRange).toEqual({
                startDate: null,
                endDate: null,
            })
            expect(history.location.search).not.toContain('endDate=')
        })

        it('clears only AI filter when entering folder (line 330)', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url&inUseByAI=true'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.inUseByAIFilter).toBe(true)
            expect(result.current.searchTerm).toBe('')
            expect(result.current.dateRange.startDate).toBeNull()

            // Enter folder
            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[0])
            })

            // Only AI filter should be cleared
            expect(result.current.inUseByAIFilter).toBeNull()
            expect(history.location.search).not.toContain('inUseByAI=')
        })

        it('clears search term via URL navigation when entering folder (covers line 326)', () => {
            const folderUrl = encodeURIComponent(mockTableData[0].source!)
            const history = createMemoryHistory({
                initialEntries: [
                    '/knowledge?filter=url&search=test',
                    `/knowledge?filter=url&folder=${folderUrl}`,
                ],
                initialIndex: 0,
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.searchTerm).toBe('test')

            // Navigate forward to folder URL (simulates clicking a folder link)
            act(() => {
                history.goForward()
            })

            expect(result.current.searchTerm).toBe('')
        })

        it('clears date range via URL navigation when entering folder (covers lines 327-328)', () => {
            const folderUrl = encodeURIComponent(mockTableData[0].source!)
            const history = createMemoryHistory({
                initialEntries: [
                    '/knowledge?filter=url&startDate=2024-01-01&endDate=2024-12-31',
                    `/knowledge?filter=url&folder=${folderUrl}`,
                ],
                initialIndex: 0,
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.dateRange.startDate).toBe('2024-01-01')
            expect(result.current.dateRange.endDate).toBe('2024-12-31')

            // Navigate forward to folder URL
            act(() => {
                history.goForward()
            })

            expect(result.current.dateRange).toEqual({
                startDate: null,
                endDate: null,
            })
        })

        it('clears inUseByAI filter via URL navigation when entering folder (covers line 330)', () => {
            const folderUrl = encodeURIComponent(mockTableData[0].source!)
            const history = createMemoryHistory({
                initialEntries: [
                    '/knowledge?filter=url&inUseByAI=false',
                    `/knowledge?filter=url&folder=${folderUrl}`,
                ],
                initialIndex: 0,
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.inUseByAIFilter).toBe(false)

            // Navigate forward to folder URL
            act(() => {
                history.goForward()
            })

            expect(result.current.inUseByAIFilter).toBeNull()
        })

        it('clears all filters via URL navigation when entering folder (covers lines 326-330)', () => {
            const folderUrl = encodeURIComponent(mockTableData[0].source!)
            const history = createMemoryHistory({
                initialEntries: [
                    '/knowledge?filter=url&search=test&startDate=2024-01-01&endDate=2024-12-31&inUseByAI=true',
                    `/knowledge?filter=url&folder=${folderUrl}`,
                ],
                initialIndex: 0,
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.searchTerm).toBe('test')
            expect(result.current.dateRange.startDate).toBe('2024-01-01')
            expect(result.current.dateRange.endDate).toBe('2024-12-31')
            expect(result.current.inUseByAIFilter).toBe(true)

            // Navigate forward to folder URL
            act(() => {
                history.goForward()
            })

            expect(result.current.searchTerm).toBe('')
            expect(result.current.dateRange).toEqual({
                startDate: null,
                endDate: null,
            })
            expect(result.current.inUseByAIFilter).toBeNull()
        })
    })

    describe('back button behavior with folders', () => {
        it('clears folder state when back button removes folder param', () => {
            const folderUrl = encodeURIComponent(mockTableData[0].source!)
            const history = createMemoryHistory({
                initialEntries: [
                    '/knowledge?filter=url',
                    `/knowledge?filter=url&folder=${folderUrl}`,
                ],
                initialIndex: 1,
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            expect(result.current.selectedFolder).not.toBeNull()

            act(() => {
                history.goBack()
            })

            expect(result.current.selectedFolder).toBeNull()
            expect(history.location.search).toBe('?filter=url')
        })

        it('handles back button navigation without creating duplicate entries', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            const initialLength = history.length

            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[0])
            })

            expect(history.length).toBe(initialLength + 1)

            act(() => {
                history.goBack()
            })

            expect(history.length).toBe(initialLength + 1)
            expect(history.location.search).toBe('')
        })
    })

    describe('circular dependency prevention', () => {
        it('does not trigger infinite re-renders when entering folder', () => {
            const history = createMemoryHistory({
                initialEntries: ['/knowledge?filter=url&search=test'],
            })

            const { result } = renderHook(
                () => useKnowledgeHubUrlParams(TEST_SHOP_NAME, mockTableData),
                {
                    wrapper: createRouterWrapper(history),
                },
            )

            const renderCount = { count: 0 }

            const originalUseEffect = React.useEffect
            jest.spyOn(React, 'useEffect').mockImplementation(
                (effect, deps) => {
                    renderCount.count++
                    return originalUseEffect(effect, deps)
                },
            )

            act(() => {
                result.current.updateUrlWithFolderParam(mockTableData[0])
            })

            expect(renderCount.count).toBeLessThan(50)

            jest.restoreAllMocks()
        })
    })
})
