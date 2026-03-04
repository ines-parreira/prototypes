import { Button } from '@gorgias/axiom'

import type { BillingState } from 'models/billing/types'
import { SubscriptionStatus } from 'models/billing/types'

import ProductCardForCoupon from '../../components/ProductCardForCoupon'
import UpcomingInvoiceCard from '../../components/UpcomingInvoiceCard'
import { useDeactivateAccountWithSideEffects } from '../../hooks/useDeactivateAccountWithSideEffects'
import { useReactivateAccountWithSideEffects } from '../../hooks/useReactivateAccountWithSideEffects'
import { useSetIsVettedWithSideEffects } from '../../hooks/useSetIsVettedWithSideEffects'

import css from './BillingInternalViewUI.less'

interface BillingInternalViewUIProps {
    billingState: BillingState
    helpdeskAndAutomateCoupons: string[]
    helpdeskOnlyCoupons: string[]
    automateOnlyCoupons: string[]
}
export function BillingInternalViewUI({
    billingState,
    helpdeskAndAutomateCoupons,
    helpdeskOnlyCoupons,
    automateOnlyCoupons,
}: BillingInternalViewUIProps) {
    const deactivateAccount = useDeactivateAccountWithSideEffects()
    const reactivateAccount = useReactivateAccountWithSideEffects()
    const setIsVettedAccount = useSetIsVettedWithSideEffects()

    const currentCoupon = billingState.subscription?.coupon

    const isHelpdeskAndAutomateCoupon = (currentCoupon?.name || '').includes(
        '-hd+ao-',
    )
    const isHelpdeskCoupon = (currentCoupon?.name || '').includes('-hd-')
    const isAutomateCoupon = (currentCoupon?.name || '').includes('-ao-')
    const isTrialing =
        billingState.subscription.status === SubscriptionStatus.TRIALING
    const endOfTrialDatetime = billingState.subscription.trial_end_datetime

    return (
        <div className={css.container}>
            <div className={css.buttons_line}>
                <Button
                    onClick={() => {
                        deactivateAccount.mutate([])
                    }}
                    isLoading={deactivateAccount.isLoading}
                >
                    Deactivate/Ban account
                </Button>
                <Button
                    onClick={() => {
                        reactivateAccount.mutate([])
                    }}
                    isLoading={reactivateAccount.isLoading}
                >
                    Reactivate account
                </Button>
            </div>
            <div className={css.buttons_line}>
                <Button
                    onClick={() => {
                        setIsVettedAccount.mutate([
                            { value: !billingState.customer.is_vetted },
                        ])
                    }}
                    isLoading={setIsVettedAccount.isLoading}
                >
                    {billingState.customer.is_vetted
                        ? 'Unvet account'
                        : 'Vet account'}
                </Button>
            </div>
            <UpcomingInvoiceCard
                subscriptionStatus={billingState.subscription.status}
                endOfTrialDatetime={endOfTrialDatetime}
                hasExtendedTrial={!!billingState.customer.trial_extended_until}
                endOfCurrentCycleDatetime={
                    billingState.subscription.current_billing_cycle_end_datetime
                }
                upcomingInvoice={billingState.upcoming_invoice}
                availableCoupons={helpdeskAndAutomateCoupons}
                currentHelpdeskAndAutomateCoupon={
                    isHelpdeskAndAutomateCoupon ? currentCoupon : null
                }
            />
            <div className={css.productCards}>
                <ProductCardForCoupon
                    productName="Helpdesk"
                    isTrialing={isTrialing}
                    endOfTrialDatetime={endOfTrialDatetime}
                    currentCoupon={isHelpdeskCoupon ? currentCoupon : null}
                    plan={billingState.current_plans.helpdesk}
                    canApplyProductCoupon={!currentCoupon}
                    availableCoupons={helpdeskOnlyCoupons}
                />
                <ProductCardForCoupon
                    productName="AI Agent"
                    isTrialing={isTrialing}
                    endOfTrialDatetime={endOfTrialDatetime}
                    currentCoupon={isAutomateCoupon ? currentCoupon : null}
                    plan={billingState.current_plans.automate}
                    canApplyProductCoupon={!currentCoupon}
                    availableCoupons={automateOnlyCoupons}
                />
                <ProductCardForCoupon
                    productName="Voice"
                    isTrialing={isTrialing}
                    endOfTrialDatetime={endOfTrialDatetime}
                    currentCoupon={null}
                    plan={billingState.current_plans.voice}
                    canApplyProductCoupon={false}
                />
                <ProductCardForCoupon
                    productName="SMS"
                    isTrialing={isTrialing}
                    endOfTrialDatetime={endOfTrialDatetime}
                    currentCoupon={null}
                    plan={billingState.current_plans.sms}
                    canApplyProductCoupon={false}
                />
                <ProductCardForCoupon
                    productName="Convert"
                    isTrialing={isTrialing}
                    endOfTrialDatetime={endOfTrialDatetime}
                    currentCoupon={null}
                    plan={billingState.current_plans.convert}
                    canApplyProductCoupon={false}
                />
            </div>
        </div>
    )
}
