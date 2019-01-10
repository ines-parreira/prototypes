import Customer from './Customer'
import Charge from './Charge'
import Subscription from './Subscription'

const recharge = (args) => {
    const path = args.template.get('absolutePath', []).join('.')

    if (path.match(/integrations.[0-9]+.customer/)) {
        return Customer()
    }

    if (path.match(/integrations.[0-9]+.charges/)) {
        return Charge()
    }

    if (path.match(/integrations.[0-9]+.subscriptions/)) {
        return Subscription()
    }

    return {}
}

export default recharge
