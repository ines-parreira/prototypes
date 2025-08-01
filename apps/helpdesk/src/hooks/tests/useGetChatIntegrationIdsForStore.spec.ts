import { assumeMock, renderHook } from '@repo/testing'

import { useGetChatIntegrationIdsForStore } from 'hooks/chat/useGetChatIntegrationIdsForStore'
import useAppSelector from 'hooks/useAppSelector'

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)

describe('getChatIntegrationIdsForStore', () => {
    const mockIntegrations = [
        { id: '1', meta: { shop_name: 'shop1', shop_type: 'shopify' } },
        { id: '2', meta: { shop_name: 'shop2', shop_type: 'shopify' } },
        { id: '3', meta: { shop_name: 'shop1', shop_type: 'shopify' } },
    ]

    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(mockIntegrations)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return chat integration ids for the given shop name', () => {
        const { result } = renderHook(() =>
            useGetChatIntegrationIdsForStore({ shopName: 'shop1' }),
        )
        expect(result.current).toEqual([
            { id: '1', channel: 'chat' },
            { id: '3', channel: 'chat' },
        ])
    })

    it('should return an empty array if no integrations match the shop name', () => {
        const { result } = renderHook(() =>
            useGetChatIntegrationIdsForStore({ shopName: 'shop3' }),
        )
        expect(result.current).toEqual([])
    })
})
