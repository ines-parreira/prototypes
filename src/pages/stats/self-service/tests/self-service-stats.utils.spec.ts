import {fromJS} from 'immutable'

import {hasShopifyIntegrationSSPEnabled} from '../self-service-stats.utils'
import {ShopType} from '../../../../models/selfServiceConfiguration/types'
describe('hasShopifyIntegrationSSPEnabled', () => {
    it('should return true if for the shopifyIntegration passed theres a corresponding SSP configuration enabled', () => {
        const shopifyIntegration = fromJS({
            id: 1,
            type: 'shopify',
            meta: {
                shop_name: `mystore1`,
            },
            uri: `/api/integrations/1/`,
        })
        const sspConfigurations = [
            {
                id: 1,
                type: 'shopify' as ShopType,
                shop_name: `mystore1`,
                created_datetime: '2021-01-26T00:29:00Z',
                updated_datetime: '2021-01-26T00:29:30Z',
                deactivated_datetime: null,
                report_issue_policy: {
                    enabled: true,
                    cases: [],
                },
                track_order_policy: {
                    enabled: true,
                },
                cancel_order_policy: {
                    enabled: true,
                },
                return_order_policy: {
                    enabled: true,
                },
                quick_response_policies: [],
            },
        ]
        expect(
            hasShopifyIntegrationSSPEnabled(
                shopifyIntegration,
                sspConfigurations
            )
        ).toBe(true)
    })

    it('should return false if', () => {
        const shopifyIntegration = fromJS({
            id: 1,
            type: 'shopify',
            meta: {
                shop_name: `mystore1`,
            },
            uri: `/api/integrations/1/`,
        })
        const sspConfigurations = [
            {
                id: 1,
                type: 'shopify' as ShopType,
                shop_name: `mystore1`,
                created_datetime: '2021-01-26T00:29:00Z',
                updated_datetime: '2021-01-26T00:29:30Z',
                deactivated_datetime: '2021-01-26T00:29:30Z',
                report_issue_policy: {
                    enabled: true,
                    cases: [],
                },
                track_order_policy: {
                    enabled: true,
                },
                cancel_order_policy: {
                    enabled: true,
                },
                return_order_policy: {
                    enabled: true,
                },
                quick_response_policies: [],
            },
        ]
        expect(
            hasShopifyIntegrationSSPEnabled(
                shopifyIntegration,
                sspConfigurations
            )
        ).toBe(false)
    })
})
