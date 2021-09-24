import Customer from './Customer.tsx'
import Item from './Item'
import Order from './Order/OrderWidget.tsx'
import ShippingAddress from './Order/ShippingAddress.tsx'
import Fulfillment from './Fulfillment.tsx'

const shopify = (args) => {
    const path = args.template.get('absolutePath', []).join('.')

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
