import {generateConfiguration} from '../generateConfiguration'

describe('generateConfiguration()', () => {
    it('should generate a base self_service_configuration entity', () => {
        const id = 1 // FIXME: remove the need to provide any id value
        const shopName = 'my-shop'
        const shopType = 'shopify'

        expect(generateConfiguration(id, shopType, shopName)).toEqual({
            id,
            shop_name: shopName,
            type: shopType,
            updated_datetime: expect.any(String),
            created_datetime: expect.any(String),
            deactivated_datetime: null,
            report_issue_policy: {
                enabled: true,
            },
            track_order_policy: {
                enabled: true,
            },
            return_order_policy: {
                enabled: true,
            },
            cancel_order_policy: {
                enabled: true,
            },
        })
    })
})
