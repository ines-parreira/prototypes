import client from 'models/api/resources'
import {
    ChurnMitigationOfferDecisionEvent,
    SubscriptionCycle,
} from 'models/billing/types'

export const fetchSubscription = async () => {
    const res = await client.get<SubscriptionCycle>('/api/billing/subscription')
    return res.data
}

export const trackBillingEvent = async (
    eventName: string,
    event: ChurnMitigationOfferDecisionEvent
) =>
    await client.post('/billing/events-tracking', {
        name: eventName,
        data: event,
    })
