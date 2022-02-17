import {List, Map} from 'immutable'

import Customer from './Customer'
import Item from './Item'
import Order from './Order/OrderWidget'
import ShippingAddress from './Order/ShippingAddress'
import Fulfillment from './Fulfillment'

const shopify = (args: {
    template: Map<any, any>
    source: Map<any, any>
    parent: Map<any, any>
}) => {
    const path = (args.template.get('absolutePath', []) as List<string>).join(
        '.'
    )

    if (path.match(/integrations\.\d+\.customer$/)) {
        return Customer()
    }

    if (path.match(/integrations\.\d+\.orders\.\[]$/)) {
        return Order()
    }

    if (path.match(/integrations\.\d+\.orders\.\[]\.line_items\.\[]$/)) {
        return Item()
    }

    if (path.match(/integrations\.\d+\.orders\.\[]\.fulfillments\.\[]$/)) {
        return Fulfillment()
    }

    if (path.match(/integrations\.\d+\.orders\.\[]\.shipping_address$/)) {
        return ShippingAddress()
    }

    return {}
}

export default shopify
