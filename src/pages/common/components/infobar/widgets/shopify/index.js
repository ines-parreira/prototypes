import Customer from './Customer'
import Item from './Item'
import Order from './Order'

const shopify = (args) => {
    const path = args.template.get('absolutePath', []).join('.')

    if (path.endsWith('_shopify.customer')) {
        return Customer()
    }

    if (path.endsWith('_shopify.orders.[]')) {
        return Order()
    }

    if (path.endsWith('_shopify.orders.[].line_items.[]')) {
        return Item()
    }

    return {}
}

export default shopify
