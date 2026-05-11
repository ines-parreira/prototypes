import { BILLING_INTERNAL_MANAGE_PLAN_PATH } from '@repo/billing'
import { useHistory } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import { useIsAccountDeactivated } from 'hooks/useIsAccountDeactivated'
import type { BillingState } from 'models/billing/types'
import { SubscriptionStatus } from 'models/billing/types'

import { useDeactivateAccountWithSideEffects } from '../../hooks/useDeactivateAccountWithSideEffects'
import { useReactivateAccountWithSideEffects } from '../../hooks/useReactivateAccountWithSideEffects'
import { useSetIsVettedWithSideEffects } from '../../hooks/useSetIsVettedWithSideEffects'
import ProductCardForCoupon from '../ProductCardForCoupon/ProductCardForCoupon'
import UpcomingInvoiceCard from '../UpcomingInvoiceCard/UpcomingInvoiceCard'

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
    const history = useHistory()
    const deactivateAccount = useDeactivateAccountWithSideEffects()
    const reactivateAccount = useReactivateAccountWithSideEffects()
    const setIsVettedAccount = useSetIsVettedWithSideEffects()
    const currentCoupon = billingState.subscription?.coupon

    const isHelpdeskAndAutomateCoupon = (currentCoupon?.name || '').includes(
        '-hd+ao-',
    )
    const isHelpdeskCoupon = (currentCoupon?.name || '').includes('-hd-')
    const isAutomateCoupon = (currentCoupon?.name || '').includes('-ao-')
    const isDeactivated = useIsAccountDeactivated()
    const isTrialing =
        billingState.subscription.status === SubscriptionStatus.TRIALING
    const endOfTrialDatetime = billingState.subscription.trial_end_datetime

    return (
        <div className={css.container}>
            <div className={css.buttons_line}>
                {isDeactivated ? (
                    <Button
                        onClick={() => {
                            reactivateAccount.mutate([])
                        }}
                        isLoading={reactivateAccount.isLoading}
                    >
                        Reactivate account
                    </Button>
                ) : (
                    <Button
                        onClick={() => {
                            deactivateAccount.mutate([])
                        }}
                        isLoading={deactivateAccount.isLoading}
                        intent="destructive"
                    >
                        Deactivate account
                    </Button>
                )}
                <Button
                    onClick={() => {
                        setIsVettedAccount.mutate([
                            { value: !billingState.customer.is_vetted },
                        ])
                    }}
                    isLoading={setIsVettedAccount.isLoading}
                    isDisabled={isDeactivated}
                >
                    {billingState.customer.is_vetted
                        ? 'Unvet account'
                        : 'Vet account'}
                </Button>
                <Button
                    onClick={() => {
                        history.push(BILLING_INTERNAL_MANAGE_PLAN_PATH)
                    }}
                >
                    Manage plans
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
                    isDeactivated={isDeactivated}
                />
                <ProductCardForCoupon
                    productName="AI Agent"
                    isTrialing={isTrialing}
                    endOfTrialDatetime={endOfTrialDatetime}
                    currentCoupon={isAutomateCoupon ? currentCoupon : null}
                    plan={billingState.current_plans.automate}
                    canApplyProductCoupon={!currentCoupon}
                    availableCoupons={automateOnlyCoupons}
                    isDeactivated={isDeactivated}
                />
                <ProductCardForCoupon
                    productName="Voice"
                    isTrialing={isTrialing}
                    endOfTrialDatetime={endOfTrialDatetime}
                    currentCoupon={null}
                    plan={billingState.current_plans.voice}
                    canApplyProductCoupon={false}
                    isDeactivated={isDeactivated}
                />
                <ProductCardForCoupon
                    productName="SMS"
                    isTrialing={isTrialing}
                    endOfTrialDatetime={endOfTrialDatetime}
                    currentCoupon={null}
                    plan={billingState.current_plans.sms}
                    canApplyProductCoupon={false}
                    isDeactivated={isDeactivated}
                />
                <ProductCardForCoupon
                    productName="Convert"
                    isTrialing={isTrialing}
                    endOfTrialDatetime={endOfTrialDatetime}
                    currentCoupon={null}
                    plan={billingState.current_plans.convert}
                    canApplyProductCoupon={false}
                    isDeactivated={isDeactivated}
                />
            </div>
        </div>
    )
}
