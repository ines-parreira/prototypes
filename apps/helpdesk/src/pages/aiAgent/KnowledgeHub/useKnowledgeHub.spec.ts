import { renderHook } from '@testing-library/react'

import { useDomainSyncStatus } from './hooks/useDomainSyncStatus'
import { useKnowledgeHubArticles } from './hooks/useKnowledgeHubArticles'
import { useShopContext } from './hooks/useShopContext'
import { useKnowledgeHub } from './useKnowledgeHub'

jest.mock('./hooks/useShopContext')
jest.mock('./hooks/useKnowledgeHubArticles')
jest.mock('./hooks/useDomainSyncStatus')

const mockUseShopContext = useShopContext as jest.Mock
const mockUseKnowledgeHubArticles = useKnowledgeHubArticles as jest.Mock
const mockUseDomainSyncStatus = useDomainSyncStatus as jest.Mock

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
})
