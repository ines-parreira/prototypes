import {Source} from 'models/widget/types'

import {buildShopifyContextData} from '../buildShopifyContextData'

describe('buildShopifyContextData', () => {
    it("should throw if the source isn't a record", () => {
        const source = 'not a record'

        expect(() => buildShopifyContextData(source)).toThrow()
    })

    it('should throw if data_source is null', () => {
        const source = {
            admin_graphql_api_id: {wrong: 'format'},
            id: 123,
        }

        expect(() => buildShopifyContextData(source)).toThrow()
    })

    it("should throw if the source's id and customer id are null", () => {
        const source = {
            admin_graphql_api_id: 'gid://shopify/customer/123',
        }

        expect(() => buildShopifyContextData(source)).toThrow()
    })

    it('should return the matching data_source', () => {
        const type = 'customer'
        const source: Source = {
            admin_graphql_api_id: `gid://shopify/${type}/123`,
            id: 123,
        }
        const data = buildShopifyContextData(source)

        expect(data.data_source).toBe(type)
    })

    it("should return the source's id and customer id or null", () => {
        const targetId = 123
        const customerId = 456
        let source: Source = {
            id: targetId,
            admin_graphql_api_id: 'gid://shopify/customer/123',
        }
        let data = buildShopifyContextData(source)

        expect(data?.widget_resource_ids).toEqual({
            target_id: targetId,
            customer_id: null,
        })

        source = {
            admin_graphql_api_id: 'gid://shopify/customer/123',
            customer: {
                id: customerId,
            },
        }
        data = buildShopifyContextData(source)
        expect(data?.widget_resource_ids).toEqual({
            target_id: null,
            customer_id: customerId,
        })
    })
})
