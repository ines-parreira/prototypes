import { renderHook } from '@repo/testing'

import { useStoresKnowledgeStatus } from 'pages/aiAgent/hooks/useStoresKnowledgeStatus'

import { useFetchStoreKnowledgeStatusData } from '../useFetchStoreKnowledgeStatusData'

jest.mock('pages/aiAgent/hooks/useStoresKnowledgeStatus', () => ({
    useStoresKnowledgeStatus: jest.fn(),
}))
const mockUseStoresKnowledgeStatus = jest.mocked(useStoresKnowledgeStatus)

describe('useFetchStoreKnowledgeStatusData', () => {
    const storeName = 'test-store'

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns loading state initially', () => {
        mockUseStoresKnowledgeStatus.mockReturnValue({
            data: {},
            isLoading: true,
        })

        const { result } = renderHook(() =>
            useFetchStoreKnowledgeStatusData({ storeName }),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toEqual(undefined)
    })

    it('should return undefined when stores knowledge status is undefined', () => {
        mockUseStoresKnowledgeStatus.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useFetchStoreKnowledgeStatusData({ storeName }),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBeUndefined()
    })

    it('should return undefined when stores knowledge status does not contain store', () => {
        mockUseStoresKnowledgeStatus.mockReturnValue({
            data: {
                'another-store': {
                    shop_name: 'another-store',
                    help_center_id: 2,
                    has_public_resources: false,
                    is_store_domain_synced: false,
                    has_external_documents: false,
                },
            },
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useFetchStoreKnowledgeStatusData({ storeName }),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBeUndefined()
    })

    it('returns resources specific to store when query succeeds', () => {
        mockUseStoresKnowledgeStatus.mockReturnValue({
            isLoading: false,
            data: {
                [storeName]: {
                    shop_name: storeName,
                    help_center_id: 1,
                    has_public_resources: true,
                    is_store_domain_synced: true,
                    has_external_documents: true,
                },
                'another-store': {
                    shop_name: 'another-store',
                    help_center_id: 2,
                    has_public_resources: false,
                    is_store_domain_synced: false,
                    has_external_documents: false,
                },
            },
        })

        const { result } = renderHook(() =>
            useFetchStoreKnowledgeStatusData({ storeName }),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toEqual({
            shop_name: storeName,
            help_center_id: 1,
            has_public_resources: true,
            is_store_domain_synced: true,
            has_external_documents: true,
        })
    })
})
