import {renderHook} from '@testing-library/react-hooks'

import {Source} from 'models/widget/types'

import {useShopifyContextData} from '../useShopifyContextData'
import {defaultShopifyContextValue} from '../../contexts/ShopifyContext'

describe('useShopifyContextData', () => {
    it("should early return the default context if the source isn't a record", () => {
        const source = 'not a record'
        const hook = renderHook(() => useShopifyContextData(source))

        expect(hook.result.current).toEqual(defaultShopifyContextValue)
    })

    it('should return the matching data_source', () => {
        const type = 'customer'
        const source: Source = {
            admin_graphql_api_id: `gid://shopify/${type}/123`,
        }
        const hook = renderHook(() => useShopifyContextData(source))

        expect(hook.result.current.data_source).toBe(type)
    })

    it('should return data_source as null', () => {
        const source = {
            admin_graphql_api_id: {wrong: 'format'},
        }
        const hook = renderHook(() => useShopifyContextData(source))

        expect(hook.result.current.data_source).toBeNull()
    })

    it("should return the source's id and customer id or null", () => {
        const targetId = 123
        const customerId = 456
        let source: Source = {
            id: targetId,
            customer: {
                id: customerId,
            },
            admin_graphql_api_id: 'gid://shopify/customer/123',
        }
        let hook = renderHook(() => useShopifyContextData(source))

        expect(hook.result.current?.widget_resource_ids).toEqual({
            target_id: targetId,
            customer_id: customerId,
        })

        source = {
            admin_graphql_api_id: 'gid://shopify/customer/123',
        }
        hook = renderHook(() => useShopifyContextData(source))
        expect(hook.result.current?.widget_resource_ids).toEqual({
            target_id: null,
            customer_id: null,
        })
    })
})
