import {Template} from 'models/widget/types'

import Customer from './Customer'
import Item from './Item'
import Order from './Order/OrderWidget'
import ShippingAddress from './Order/ShippingAddress'
import Fulfillment from './Fulfillment'
import DraftOrder from './DraftOrder/DraftOrderWidget'

const shopify = (args: {template: Template}) => {
    const path = (args.template.absolutePath || []).join('.')

    if (path.match(/integrations\.\d+\.customer$/)) {
        return Customer()
    }

    if (path.match(/integrations\.\d+\.draft_orders\.\[]$/)) {
        return DraftOrder()
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
