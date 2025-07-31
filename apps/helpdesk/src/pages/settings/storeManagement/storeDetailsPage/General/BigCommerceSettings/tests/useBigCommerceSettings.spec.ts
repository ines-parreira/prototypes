import { renderHook } from '@repo/testing'

import {
    BigCommerceIntegration,
    IntegrationType,
} from 'models/integration/types'
import { getConnectUrl } from 'pages/integrations/integration/components/bigcommerce/Utils'

import { useBigCommerceSettings } from '../useBigCommerceSettings'

jest.mock(
    'pages/integrations/integration/components/bigcommerce/Utils',
    () => ({
        getConnectUrl: jest.fn(),
    }),
)

describe('useBigCommerceSettings', () => {
    const mockIntegration = {
        type: IntegrationType.BigCommerce,
        meta: {
            shop_domain: 'test-store.mybigcommerce.com',
            import_state: {
                products: {
                    is_over: true,
                    oldest_created_at: '2024-03-20T00:00:00Z',
                },
                customers: {
                    is_over: true,
                    oldest_created_at: '2024-03-20T00:00:00Z',
                },
                external_orders: {
                    is_over: true,
                    oldest_created_at: '2024-03-20T00:00:00Z',
                },
            },
            need_scope_update: false,
            store_hash: 'test-hash',
            shop_id: 12345,
        },
        created_datetime: '2024-03-20T00:00:00Z',
        deactivated_datetime: null,
        name: 'Test Store',
        updated_datetime: '2024-03-20T00:00:00Z',
    } as BigCommerceIntegration

    beforeEach(() => {
        jest.clearAllMocks()
        window.location.href = ''
    })

    it('should format shop name correctly', () => {
        const { result } = renderHook(() =>
            useBigCommerceSettings(mockIntegration),
        )
        expect(result.current.shopName).toBe('test-store')
    })

    it('should return correct active status', () => {
        const { result } = renderHook(() =>
            useBigCommerceSettings(mockIntegration),
        )
        expect(result.current.isActive).toBe(true)
    })

    it('should return inactive status when deactivated', () => {
        const deactivatedIntegration: BigCommerceIntegration = {
            ...mockIntegration,
            deactivated_datetime: '2024-03-20T00:00:00Z',
        }
        const { result } = renderHook(() =>
            useBigCommerceSettings(deactivatedIntegration),
        )
        expect(result.current.isActive).toBe(false)
    })

    it('should return correct sync completion status', () => {
        const { result } = renderHook(() =>
            useBigCommerceSettings(mockIntegration),
        )
        expect(result.current.isSyncComplete).toBe(true)
    })

    it('should return incomplete sync status when any import is not over', () => {
        const incompleteIntegration: BigCommerceIntegration = {
            ...mockIntegration,
            meta: {
                ...mockIntegration.meta,
                import_state: {
                    products: {
                        is_over: false,
                        oldest_created_at: '2024-03-20T00:00:00Z',
                    },
                    customers: {
                        is_over: true,
                        oldest_created_at: '2024-03-20T00:00:00Z',
                    },
                    external_orders: {
                        is_over: true,
                        oldest_created_at: '2024-03-20T00:00:00Z',
                    },
                },
            },
        }
        const { result } = renderHook(() =>
            useBigCommerceSettings(incompleteIntegration),
        )
        expect(result.current.isSyncComplete).toBe(false)
    })

    it('should return correct scope update status', () => {
        const { result } = renderHook(() =>
            useBigCommerceSettings(mockIntegration),
        )
        expect(result.current.needScopeUpdate).toBe(false)
    })

    it('should retrigger OAuth flow when called', () => {
        const mockConnectUrl = 'https://connect.bigcommerce.com/oauth2'
        ;(getConnectUrl as jest.Mock).mockReturnValue(mockConnectUrl)

        const { result } = renderHook(() =>
            useBigCommerceSettings(mockIntegration),
        )
        result.current.retriggerOAuthFlow()

        expect(getConnectUrl).toHaveBeenCalled()
        expect(window.location.href).toBe(mockConnectUrl)
    })

    it('should handle undefined integration gracefully', () => {
        const { result } = renderHook(() =>
            useBigCommerceSettings({
                meta: {},
            } as unknown as BigCommerceIntegration),
        )
        expect(result.current.shopName).toBe('')
        expect(result.current.isActive).toBe(true)
        expect(result.current.isSyncComplete).toBe(false)
        expect(result.current.needScopeUpdate).toBe(false)
    })
})
