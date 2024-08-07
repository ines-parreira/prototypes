import {renderHook} from '@testing-library/react-hooks'
import {StoreIntegration, IntegrationType} from 'models/integration/types'
import {assumeMock} from 'utils/testing'
import useStoreIntegrations from '../useStoreIntegrations'
import {useSelfServiceStoreIntegrationByShopName} from '../useSelfServiceStoreIntegration'

jest.mock('../useStoreIntegrations')
const mockUseStoreIntegrations = assumeMock(useStoreIntegrations)

const storeIntegrations = [
    {
        id: 1,
        name: 'Shopify Store 1',
        type: IntegrationType.Shopify,
        meta: {shop_name: 'Shop1'},
    },
    {
        id: 2,
        name: 'Shopify Store 2',
        type: IntegrationType.Shopify,
        meta: {shop_name: 'Shop2'},
    },
    {
        id: 3,
        name: 'BigCommerce Store 1',
        type: IntegrationType.BigCommerce,
        meta: {store_hash: 'Shop3'},
    },
] as unknown as StoreIntegration[]

describe('useSelfServiceStoreIntegrationByShopName', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseStoreIntegrations.mockReturnValue(storeIntegrations)
    })

    it('should return the correct store integration based on shop name', () => {
        const {result} = renderHook(() =>
            useSelfServiceStoreIntegrationByShopName('Shop1')
        )
        expect(result.current).toEqual(storeIntegrations[0])

        const {result: result2} = renderHook(() =>
            useSelfServiceStoreIntegrationByShopName('Shop3')
        )
        expect(result2.current).toEqual(storeIntegrations[2])
    })

    it('should return undefined if no matching store integration is found', () => {
        const {result} = renderHook(() =>
            useSelfServiceStoreIntegrationByShopName('NonExistentShop')
        )
        expect(result.current).toBeUndefined()
    })
})
