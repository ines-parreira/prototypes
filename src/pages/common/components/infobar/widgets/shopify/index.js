import Customer from './Customer'
import Item from './Item'
import Order from './Order'

const shopify = (args) => {
    const path = args.template.get('absolutePath', []).join('.')

    if (path.match(/integrations.[0-9]+.customer$/)) {
        return Customer()
    }

    if (path.match(/integrations.[0-9]+.orders.\[]$/)) {
        return Order()
    }

    if (path.match(/integrations.[0-9]+.orders.\[].line_items.\[]$/)) {
        return Item()
    }

    return {}
}

export default shopify
