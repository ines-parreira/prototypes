import type { List } from 'immutable'
import { fromJS } from 'immutable'

import type { eventMaker } from './types'

const rechargeEvent = ({
    integration,
    actionConfig,
    payload,
    data,
}: eventMaker) => {
    const storeName = integration.getIn(['meta', 'store_name']) as string
    const hash = data.getIn(['customer', 'hash']) as string

    const _getSubscription = (subscriptionId: number) => {
        return (((data.get('subscriptions') || fromJS([])) as List<any>).find(
            (subscription: Map<any, any>) =>
                (subscription.get('id') as number).toString() ===
                subscriptionId.toString(),
        ) || fromJS({})) as Map<any, any>
    }

    const _getCharge = (chargeId: number) => {
        return (((data.get('charges') || fromJS([])) as List<any>).find(
            (charge: Map<any, any>) =>
                (charge.get('id') as number).toString() === chargeId.toString(),
        ) || fromJS({})) as Map<any, any>
    }

    if (actionConfig.objectType === 'subscription') {
        const subscription = _getSubscription(payload.get('subscription_id'))
        return {
            objectLabel: subscription.get('id'),
            objectLink: `https://${storeName}.myshopify.com/tools/recurring/customers/${hash}/subscriptions/${
                subscription.get('id') as number
            }`,
        }
    } else if (actionConfig.objectType === 'charge') {
        const charge = _getCharge(payload.get('charge_id'))
        return {
            objectLabel: charge.get('id'),
            objectLink: `https://${storeName}.myshopify.com/tools/recurring/customers/${hash}/orders`,
        }
    }
}

export default rechargeEvent
