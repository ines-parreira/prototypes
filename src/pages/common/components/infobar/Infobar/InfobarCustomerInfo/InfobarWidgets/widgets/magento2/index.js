import Customer from './Customer.tsx'
import Order from './Order.tsx'

const magento2 = (args) => {
    const path = args.template.get('absolutePath', []).join('.')

    if (path.match(/integrations\.[0-9]+\.customer$/)) {
        return Customer()
    }

    if (path.match(/integrations\.[0-9]+\.orders.\[]$/)) {
        return Order()
    }

    return {}
}

export default magento2
