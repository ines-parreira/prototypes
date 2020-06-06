import Customer from './Customer'
import Item from './Item'
import Order from './Order'
import Fulfillment from './Fulfillment'

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

    return {}
}

export default shopify
