import client from 'models/api/resources'
import {SubscriptionCycle} from 'models/billing/types'

export const fetchSubscription = async () => {
    const res = await client.get<SubscriptionCycle>('/api/billing/subscription')
    return res.data
}
