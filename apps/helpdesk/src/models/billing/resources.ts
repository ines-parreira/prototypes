import client from 'models/api/resources'
import type {
    BillingState,
    ChurnMitigationOfferDecisionEvent,
    CouponForSales,
    Plan,
    SubscriptionCycle,
} from 'models/billing/types'
import { getBillingContactSchema } from 'models/billing/validators'
import type {
    BillingContactDetailResponse,
    BillingContactUpdatePayload,
    CurrentProductsUsages,
    PaymentMethod,
} from 'state/billing/types'

import type { ApiListResponseCursorPagination } from '../api/types'

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

export const getBillingContact = async () => {
    const res = await client.get<BillingContactDetailResponse>(
        '/api/billing/contact/',
    )

    getBillingContactSchema.parse(res.data)

    return res
}

export const updateBillingContact = (
    billingContact: BillingContactUpdatePayload,
) =>
    client.put<BillingContactUpdatePayload>(
        '/api/billing/contact/',
        billingContact,
    )

export async function getAiAgentGeneration6Plan() {
    const res = await client.get<{ plan: Plan } | null>(
        '/api/billing/ai-agent-generation-6',
    )
    return res.data
}

export async function upgradeAiAgentSubscriptionGeneration6Plan() {
    const res = await client.post('/api/billing/ai-agent-generation-6', {})
    return res.data
}

export async function deactivateAccount() {
    const res = await client.post(`/billing/deactivate-account`)
    return res
}

export async function reactivateAccount() {
    const res = await client.post(`/billing/reactivate-account`)
    return res
}

export async function setIsAccountVetted({ value }: { value: boolean }) {
    const res = await client.post(`/billing/vet-account`, { value: value })
    return res
}

export async function getProductsUsage(): Promise<CurrentProductsUsages> {
    const res = await client.get<CurrentProductsUsages>(
        '/billing/products-usages',
    )
    return res.data
}

export async function getPaymentMethod(): Promise<PaymentMethod> {
    const res = await client.get<PaymentMethod>('/api/billing/payment-method/')
    return res.data
}
