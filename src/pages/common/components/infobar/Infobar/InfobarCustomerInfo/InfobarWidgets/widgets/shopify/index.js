import Customer from './Customer'
import Item from './Item'
import Order from './Order'

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

    return {}
}

export default shopify
