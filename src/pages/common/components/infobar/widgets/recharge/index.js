import Subscription from './Subscription'

const recharge = (args) => {
    const path = args.template.get('absolutePath', []).join('.')

    if (path.match(/integrations.[0-9]+.subscriptions/)) {
        return Subscription()
    }

    return {}
}

export default recharge
