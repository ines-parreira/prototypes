import { fromJS } from 'immutable'

import { shopifyIntegration } from 'fixtures/integrations'
import useAppSelector from 'hooks/useAppSelector'
import {
    KnowledgeStatus,
    TemporaryKnowledgeData,
} from 'pages/aiAgent/Onboarding/components/steps/types'
import { useGetKnowledgeStatusByShopName } from 'pages/aiAgent/Onboarding/hooks/useGetKnowledgeStatusByShopName'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = useAppSelector as jest.Mock

describe('useGetKnowledgeStatusByShopName', () => {
    it('should return IN_PROGRESS when shopify integration is not found', () => {
        mockUseAppSelector.mockReturnValue(fromJS({}))

        const { result } = renderHook(() =>
            useGetKnowledgeStatusByShopName('test-shop', []),
        )

        expect(result.current).toBe(KnowledgeStatus.IN_PROGRESS)
    })

    it('should return IN_PROGRESS when knowledge data is not found for the shop', () => {
        mockUseAppSelector.mockReturnValue(fromJS(shopifyIntegration))

        const knowledgeData = [
            {
                domain: 'other-shop.myshopify.com',
                status: KnowledgeStatus.DONE,
            },
        ] as TemporaryKnowledgeData[]

        const { result } = renderHook(() =>
            useGetKnowledgeStatusByShopName(
                shopifyIntegration.meta.shop_name,
                knowledgeData,
            ),
        )

        expect(result.current).toBe(KnowledgeStatus.IN_PROGRESS)
    })

    it('should return correct status when knowledge data is found for the shop', () => {
        const shopDomain = shopifyIntegration.meta.shop_domain
        mockUseAppSelector.mockReturnValue(fromJS(shopifyIntegration))

        const knowledgeData = [
            {
                url: shopDomain || 'wrong-shop.myshopify.com',
                domain: shopDomain || 'wrong-shop.myshopify.com',
                status: KnowledgeStatus.DONE,
            },
        ]

        const { result } = renderHook(() =>
            useGetKnowledgeStatusByShopName(shopDomain || '', knowledgeData),
        )

        expect(result.current).toBe(KnowledgeStatus.DONE)
    })
})
