import Customer from './Customer.tsx'
import Charge from './Charge.tsx'
import Order from './Order.tsx'
import Subscription from './Subscription.tsx'

const recharge = (args) => {
    const path = args.template.get('absolutePath', []).join('.')

    if (path.match(/integrations\.[0-9]+\.customer$/)) {
        return Customer()
    }

    if (path.match(/integrations\.[0-9]+\.charges.\[]$/)) {
        return Charge()
    }

    if (path.match(/integrations\.[0-9]+\.subscriptions.\[]$/)) {
        return Subscription()
    }

    if (path.match(/integrations\.[0-9]+\.orders.\[]$/)) {
        return Order()
    }

    return {}
}

export default recharge
