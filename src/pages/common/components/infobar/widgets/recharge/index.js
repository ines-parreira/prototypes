import Subscription from './Subscription'
import Charge from './Charge'

const recharge = (args) => {
    const path = args.template.get('absolutePath', []).join('.')

    if (path.match(/integrations.[0-9]+.subscriptions/)) {
        return Subscription()
    }

    if (path.match(/integrations.[0-9]+.charges/)) {
        return Charge()
    }

    return {}
}

export default recharge
