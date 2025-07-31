import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType, StoreIntegration } from 'models/integration/types'
import { StoreState } from 'state/types'
import { assumeMock } from 'utils/testing'

import { useStoreIntegrationById } from '../useStoreIntegrationById'

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)

const storeIntegrations = [
    {
        id: 1,
        name: 'Shopify Store 1',
        type: IntegrationType.Shopify,
        meta: { shop_name: 'Shop1' },
    },
    {
        id: 2,
        name: 'Shopify Store 2',
        type: IntegrationType.Shopify,
        meta: { shop_name: 'Shop2' },
    },
    {
        id: 3,
        name: 'BigCommerce Store 1',
        type: IntegrationType.BigCommerce,
        meta: { store_hash: 'Shop3' },
    },
] as unknown as StoreIntegration[]

describe('useSelfServiceStoreIntegrationByShopName', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseAppSelector.mockImplementation((selector) =>
            selector({
                integrations: fromJS({ integrations: storeIntegrations }),
            } as unknown as StoreState),
        )
    })

    it('should return the correct store integration based on integration id', () => {
        const { result: firstResult } = renderHook(() =>
            useStoreIntegrationById(1),
        )
        expect(firstResult.current).toEqual(storeIntegrations[0])

        const { result: secondResult } = renderHook(() =>
            useStoreIntegrationById(2),
        )
        expect(secondResult.current).toEqual(storeIntegrations[1])

        const { result: thirdResult } = renderHook(() =>
            useStoreIntegrationById(3),
        )
        expect(thirdResult.current).toEqual(storeIntegrations[2])
    })

    it('should return undefined if no matching store integration is found', () => {
        const { result } = renderHook(() => useStoreIntegrationById(4))

        expect(result.current).toBeUndefined()
    })
})
