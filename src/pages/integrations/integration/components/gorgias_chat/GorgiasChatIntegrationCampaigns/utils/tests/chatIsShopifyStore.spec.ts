import {fromJS} from 'immutable'

import {chatIsShopifyStore} from '../chatIsShopifyStore'

const shopifyChat = fromJS({
    meta: {
        shop_type: 'shopify',
    },
})
const regularChat = fromJS({
    meta: {
        shop_type: null,
    },
})

describe('chatIsShopifyStore(integration)', () => {
    it('returns if a chat integration has a Shopify store', () => {
        expect(chatIsShopifyStore(shopifyChat)).toBeTruthy()
        expect(chatIsShopifyStore(regularChat)).toBeFalsy()
    })
})
