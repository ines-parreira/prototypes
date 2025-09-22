import client from 'models/api/resources'
import {
    BillingState,
    ChurnMitigationOfferDecisionEvent,
    CouponForSales,
    SubscriptionCycle,
} from 'models/billing/types'
import {
    BillingContactDetailResponse,
    BillingContactUpdatePayload,
} from 'state/billing/types'

import { ApiListResponseCursorPagination } from '../api/types'

export const fetchSubscription = async () => {
    const res = await client.get<SubscriptionCycle>('/api/billing/subscription')
    return res.data
}

export const trackBillingEvent = async (
    eventName: string,
    event: ChurnMitigationOfferDecisionEvent,
) =>
    await client.post('/billing/events-tracking', {
        name: eventName,
        data: event,
    })

export async function getBillingState(): Promise<BillingState> {
    const res = await client.get<BillingState>('/billing/state')
    return res.data
}

export async function getCouponsForSales() {
    const res = await client.get<
        ApiListResponseCursorPagination<CouponForSales>
    >('/billing/coupons-for-sales')
    return res.data
}

export async function addSalesCoupon({
    coupon_name,
    reason,
}: {
    coupon_name: string
    reason: string
}) {
    const res = await client.put(`/billing/coupon`, {
        coupon_name: coupon_name,
        reason: reason,
    })
    return res
}

export async function deleteSalesCoupon() {
    const res = await client.delete(`/billing/coupon`)
    return res
}

export async function extendTrial() {
    const res = await client.post(`/billing/extend-trial`)
    return res
}

export async function reactivateTrial() {
    const res = await client.post(`/billing/reactivate-trial`)
    return res
}

export const getBillingContact = () =>
    client.get<BillingContactDetailResponse>('/api/billing/contact/')

export const updateBillingContact = (
    billingContact: BillingContactUpdatePayload,
) =>
    client.put<BillingContactUpdatePayload>(
        '/api/billing/contact/',
        billingContact,
    )
