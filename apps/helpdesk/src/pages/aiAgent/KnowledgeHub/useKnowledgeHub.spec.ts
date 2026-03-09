import { renderHook } from '@testing-library/react'

import { useDomainSyncStatus } from './hooks/useDomainSyncStatus'
import { useFileIngestionStatus } from './hooks/useFileIngestionStatus'
import { useKnowledgeHubArticles } from './hooks/useKnowledgeHubArticles'
import { useShopContext } from './hooks/useShopContext'
import { useUrlSyncStatus } from './hooks/useUrlSyncStatus'
import { useKnowledgeHub } from './useKnowledgeHub'

jest.mock('./hooks/useShopContext')
jest.mock('./hooks/useKnowledgeHubArticles')
jest.mock('./hooks/useDomainSyncStatus')
jest.mock('./hooks/useUrlSyncStatus')
jest.mock('./hooks/useFileIngestionStatus')
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterCustomDomainHostnames')
jest.mock('./hooks/useShopContext')
jest.mock('./hooks/useKnowledgeHubArticles')
jest.mock('./hooks/useDomainSyncStatus')

const mockUseShopContext = useShopContext as jest.Mock
const mockUseKnowledgeHubArticles = useKnowledgeHubArticles as jest.Mock
const mockUseDomainSyncStatus = useDomainSyncStatus as jest.Mock
const mockUseUrlSyncStatus = useUrlSyncStatus as jest.Mock
const mockUseFileIngestionStatus = useFileIngestionStatus as jest.Mock

describe('useKnowledgeHub', () => {
    const mockRefetch = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseShopContext.mockReturnValue({
            shopName: 'test-shop',
            storeUrl: 'https://test-shop.myshopify.com',
        })

        mockUseKnowledgeHubArticles.mockReturnValue({
            tableData: [{ id: 1, title: 'Article 1' }],
            isInitialLoading: false,
            hasWebsiteSync: false,
            faqHelpCenterId: 3,
            snippetHelpCenterId: 2,
            refetchKnowledgeHubArticles: mockRefetch,
        })

        mockUseDomainSyncStatus.mockReturnValue({
            syncStatus: 'successful',
            storeDomainIngestionLog: undefined,
        })

        mockUseUrlSyncStatus.mockReturnValue({
            syncStatus: undefined,
            latestUrlIngestionLog: undefined,
            syncingUrls: [],
            urlIngestionLogs: [],
        })

        mockUseFileIngestionStatus.mockReturnValue({
            fileIngestionStatus: undefined,
            fileIngestionLogs: [],
        })

        jest.mocked(
            require('pages/settings/helpCenter/hooks/useHelpCenterCustomDomainHostnames')
                .default,
        ).mockReturnValue({
            customDomainHostnames: [],
        })
    })

    it('orchestrates all sub-hooks and returns combined data', () => {
        const { result } = renderHook(() => useKnowledgeHub())

        expect(result.current).toEqual({
            shopName: 'test-shop',
            tableData: [{ id: 1, title: 'Article 1' }],
            isInitialLoading: false,
            hasWebsiteSync: false,
            faqHelpCenterId: 3,
            syncStatus: 'successful',
            snippetHelpCenterId: 2,
            refetchKnowledgeHubArticles: mockRefetch,
            storeDomainIngestionLog: undefined,
            urlSyncStatus: undefined,
            syncingUrls: [],
            urlIngestionLogs: [],
            existingUrls: [],
            fileIngestionStatus: undefined,
            fileIngestionLogs: [],
        })
    })

    it('calls useShopContext', () => {
        renderHook(() => useKnowledgeHub())

        expect(mockUseShopContext).toHaveBeenCalled()
    })

    it('calls useKnowledgeHubArticles', () => {
        renderHook(() => useKnowledgeHub())

        expect(mockUseKnowledgeHubArticles).toHaveBeenCalled()
    })

    it('calls useDomainSyncStatus with correct parameters', () => {
        renderHook(() => useKnowledgeHub())

        expect(mockUseDomainSyncStatus).toHaveBeenCalledWith({
            helpCenterId: 2,
            storeUrl: 'https://test-shop.myshopify.com',
        })
    })

    it('handles missing snippetHelpCenterId gracefully', () => {
        mockUseKnowledgeHubArticles.mockReturnValue({
            tableData: [],
            isInitialLoading: false,
            hasWebsiteSync: false,
            faqHelpCenterId: 3,
            snippetHelpCenterId: undefined,
            refetchKnowledgeHubArticles: mockRefetch,
        })

        renderHook(() => useKnowledgeHub())

        expect(mockUseDomainSyncStatus).toHaveBeenCalledWith({
            helpCenterId: 0,
            storeUrl: 'https://test-shop.myshopify.com',
        })
    })

    it('passes through all data from sub-hooks', () => {
        mockUseShopContext.mockReturnValue({
            shopName: 'different-shop',
            storeUrl: 'https://different-shop.myshopify.com',
        })

        mockUseKnowledgeHubArticles.mockReturnValue({
            tableData: [{ id: 2, title: 'Article 2' }],
            isInitialLoading: true,
            hasWebsiteSync: true,
            faqHelpCenterId: 5,
            snippetHelpCenterId: 4,
            refetchKnowledgeHubArticles: mockRefetch,
        })

        mockUseDomainSyncStatus.mockReturnValue({
            syncStatus: 'pending',
        })

        const { result } = renderHook(() => useKnowledgeHub())

        expect(result.current.shopName).toBe('different-shop')
        expect(result.current.tableData).toEqual([
            { id: 2, title: 'Article 2' },
        ])
        expect(result.current.isInitialLoading).toBe(true)
        expect(result.current.hasWebsiteSync).toBe(true)
        expect(result.current.faqHelpCenterId).toBe(5)
        expect(result.current.syncStatus).toBe('pending')
        expect(result.current.snippetHelpCenterId).toBe(4)
    })

    describe('existingUrls extraction', () => {
        it('extracts URLs from tableData with url type', () => {
            mockUseKnowledgeHubArticles.mockReturnValue({
                tableData: [
                    { id: 1, type: 'url', source: 'https://example.com' },
                    { id: 2, type: 'domain', source: 'https://store.com' },
                    { id: 3, type: 'url', source: 'https://blog.com' },
                ],
                isInitialLoading: false,
                hasWebsiteSync: false,
                faqHelpCenterId: 3,
                snippetHelpCenterId: 2,
                refetchKnowledgeHubArticles: mockRefetch,
            })

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.existingUrls).toEqual([
                'https://example.com',
                'https://blog.com',
            ])
        })

        it('filters out items without source', () => {
            mockUseKnowledgeHubArticles.mockReturnValue({
                tableData: [
                    { id: 1, type: 'url', source: 'https://example.com' },
                    { id: 2, type: 'url', source: null },
                    { id: 3, type: 'url', source: undefined },
                    { id: 4, type: 'url', source: '' },
                ],
                isInitialLoading: false,
                hasWebsiteSync: false,
                faqHelpCenterId: 3,
                snippetHelpCenterId: 2,
                refetchKnowledgeHubArticles: mockRefetch,
            })

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.existingUrls).toEqual(['https://example.com'])
        })

        it('deduplicates URLs', () => {
            mockUseKnowledgeHubArticles.mockReturnValue({
                tableData: [
                    { id: 1, type: 'url', source: 'https://example.com' },
                    { id: 2, type: 'url', source: 'https://example.com' },
                    { id: 3, type: 'url', source: 'https://blog.com' },
                ],
                isInitialLoading: false,
                hasWebsiteSync: false,
                faqHelpCenterId: 3,
                snippetHelpCenterId: 2,
                refetchKnowledgeHubArticles: mockRefetch,
            })

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.existingUrls).toEqual([
                'https://example.com',
                'https://blog.com',
            ])
        })

        it('returns empty array when no url type items exist', () => {
            mockUseKnowledgeHubArticles.mockReturnValue({
                tableData: [
                    { id: 1, type: 'domain', source: 'https://store.com' },
                    { id: 2, type: 'guidance', source: null },
                ],
                isInitialLoading: false,
                hasWebsiteSync: false,
                faqHelpCenterId: 3,
                snippetHelpCenterId: 2,
                refetchKnowledgeHubArticles: mockRefetch,
            })

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.existingUrls).toEqual([])
        })

        it('returns empty array when tableData is empty', () => {
            mockUseKnowledgeHubArticles.mockReturnValue({
                tableData: [],
                isInitialLoading: false,
                hasWebsiteSync: false,
                faqHelpCenterId: 3,
                snippetHelpCenterId: 2,
                refetchKnowledgeHubArticles: mockRefetch,
            })

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.existingUrls).toEqual([])
        })
    })

    describe('useUrlSyncStatus integration', () => {
        it('calls useUrlSyncStatus with correct parameters', () => {
            mockUseKnowledgeHubArticles.mockReturnValue({
                tableData: [
                    { id: 1, type: 'url', source: 'https://example.com' },
                ],
                isInitialLoading: false,
                hasWebsiteSync: false,
                faqHelpCenterId: 3,
                snippetHelpCenterId: 2,
                refetchKnowledgeHubArticles: mockRefetch,
            })

            jest.mocked(
                require('pages/settings/helpCenter/hooks/useHelpCenterCustomDomainHostnames')
                    .default,
            ).mockReturnValue({
                customDomainHostnames: ['custom.domain.com'],
            })

            renderHook(() => useKnowledgeHub())

            expect(mockUseUrlSyncStatus).toHaveBeenCalledWith({
                helpCenterId: 2,
                existingUrls: ['https://example.com'],
                helpCenterCustomDomains: ['custom.domain.com'],
                shopName: 'test-shop',
            })
        })

        it('passes empty array when customDomainHostnames is null', () => {
            mockUseKnowledgeHubArticles.mockReturnValue({
                tableData: [],
                isInitialLoading: false,
                hasWebsiteSync: false,
                faqHelpCenterId: 3,
                snippetHelpCenterId: 2,
                refetchKnowledgeHubArticles: mockRefetch,
            })

            jest.mocked(
                require('pages/settings/helpCenter/hooks/useHelpCenterCustomDomainHostnames')
                    .default,
            ).mockReturnValue({
                customDomainHostnames: null,
            })

            renderHook(() => useKnowledgeHub())

            expect(mockUseUrlSyncStatus).toHaveBeenCalledWith({
                helpCenterId: 2,
                existingUrls: [],
                helpCenterCustomDomains: [],
                shopName: 'test-shop',
            })
        })

        it('returns URL sync status data', () => {
            mockUseUrlSyncStatus.mockReturnValue({
                syncStatus: 'pending',
                syncingUrls: ['https://example.com'],
                urlIngestionLogs: [
                    { url: 'https://example.com', status: 'pending' },
                ],
            })

            const { result } = renderHook(() => useKnowledgeHub())

            expect(result.current.urlSyncStatus).toBe('pending')
            expect(result.current.syncingUrls).toEqual(['https://example.com'])
            expect(result.current.urlIngestionLogs).toEqual([
                { url: 'https://example.com', status: 'pending' },
            ])
        })
    })
})
