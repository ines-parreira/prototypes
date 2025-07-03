import { UseQueryResult } from '@tanstack/react-query'

import { ProductWithAiAgentStatus } from 'constants/integrations/types/shopify'
import useAppDispatch from 'hooks/useAppDispatch'
import { useGetEcommerceItemByExternalId } from 'models/ecommerce/queries'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import history from 'pages/history'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { isProductExcludedFromAiAgent } from '../hooks/usePaginatedProductIntegration'
import { useSelectedProductAndDetail } from '../hooks/useSelectedProductAndDetail'

jest.mock('state/notifications/actions')
jest.mock('hooks/useAppDispatch')
const mockUseAppDispatch = assumeMock(useAppDispatch)
const mockDispatch = jest.fn()

jest.mock('models/ecommerce/queries')
const mockUseGetEcommerceItemByExternalId = assumeMock(
    useGetEcommerceItemByExternalId,
)

jest.mock('models/integration/queries', () => ({
    useGetProductsByIdsFromIntegration: jest.fn(),
}))
const mockUseGetProductsByIdsFromIntegration = assumeMock(
    useGetProductsByIdsFromIntegration,
)

jest.mock('../hooks/usePaginatedProductIntegration', () => ({
    isProductExcludedFromAiAgent: jest.fn(),
}))
const mockIsProductExcludedFromAiAgent = assumeMock(
    isProductExcludedFromAiAgent,
)

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
const mockUseAiAgentNavigation = assumeMock(useAiAgentNavigation)

describe('useSelectedProductAndDetail', () => {
    const mockedIntegrationId = 1
    const mockedProductId = '12345'
    const mockedShopName = 'Test Shop'

    beforeEach(() => {
        jest.resetAllMocks()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockUseGetProductsByIdsFromIntegration.mockReturnValue({
            data: [],
        } as unknown as UseQueryResult<ProductWithAiAgentStatus[]>)
        mockUseGetEcommerceItemByExternalId.mockReturnValue({
            data: null,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetEcommerceItemByExternalId>)
        mockIsProductExcludedFromAiAgent.mockReturnValue(false)
        mockUseAiAgentNavigation.mockReturnValue({
            routes: {
                main: '/main',
                productsContent: '/knowledge/sources/products-content',
            },
            navigationItems: [],
        } as unknown as ReturnType<typeof useAiAgentNavigation>)
    })

    it('returns product and ingested data when both queries succeed', () => {
        const mockedSelectedProduct = {
            id: 1,
            title: 'Duo Baguette Birthstone Ring',
        }
        const scrapedData = { name: 'Duo Baguette Birthstone Ring' }

        mockUseGetProductsByIdsFromIntegration.mockReturnValue({
            data: [mockedSelectedProduct],
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult<ProductWithAiAgentStatus[]>)

        mockUseGetEcommerceItemByExternalId.mockReturnValue({
            data: {
                additional_info: { scraped_data: { data: scrapedData } },
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useGetEcommerceItemByExternalId>)

        const { result } = renderHook(() =>
            useSelectedProductAndDetail({
                shopName: mockedShopName,
                integrationId: mockedIntegrationId,
                productId: mockedProductId,
            }),
        )

        expect(result.current.selectedProduct).toEqual(
            expect.objectContaining({
                ...mockedSelectedProduct,
                is_used_by_ai_agent: true,
            }),
        )
        expect(result.current.productDetail).toEqual(scrapedData)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('redirects and show error notification when product is not found', () => {
        mockUseGetProductsByIdsFromIntegration.mockReturnValue({
            data: [],
            isLoading: false,
            isError: true,
        } as unknown as UseQueryResult<ProductWithAiAgentStatus[]>)

        const { result } = renderHook(() =>
            useSelectedProductAndDetail({
                shopName: mockedShopName,
                integrationId: mockedIntegrationId,
                productId: mockedProductId,
            }),
        )

        expect(notify).toHaveBeenCalledWith({
            message:
                'Content no longer exists. It may have been deleted or moved.',
            status: NotificationStatus.Error,
        })
        expect(history.push).toHaveBeenCalledWith(
            '/knowledge/sources/products-content',
        )
        expect(result.current.selectedProduct).toBeNull()
        expect(result.current.productDetail).toBeNull()
    })
})
