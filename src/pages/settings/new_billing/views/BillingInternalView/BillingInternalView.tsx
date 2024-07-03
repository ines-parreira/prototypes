import React from 'react'
import {
    getCurrentAutomatePlan,
    getCurrentConvertPlan,
    getCurrentHelpdeskPlan,
    getCurrentSmsPlan,
    getCurrentVoicePlan,
} from 'state/billing/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {useBillingState, useSalesCoupons} from 'models/billing/queries'
import UpcomingInvoiceCard from '../../components/UpcomingInvoiceCard'
import ProductCardForCoupon from '../../components/ProductCardForCoupon'
import css from './BillingInternalView.less'

export default React.memo(BillingInternalView)

export function BillingInternalView() {
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const currentVoicePlan = useAppSelector(getCurrentVoicePlan)
    const currentSmsPlan = useAppSelector(getCurrentSmsPlan)
    const currentConvertPlan = useAppSelector(getCurrentConvertPlan)

    const {data: billingState, ...billingStateQuery} = useBillingState()
    const {data: coupons, ...salesCouponsQuery} = useSalesCoupons()

    if (billingStateQuery.isLoading || salesCouponsQuery.isLoading)
        return <div>Loading...</div>

    if (billingStateQuery.error) {
        return (
            <div>An error has occurred: could not fetch the billing state</div>
        )
    }

    if (salesCouponsQuery.error)
        return (
            <div>
                An error has occurred: could not fetch the sales coupons list
            </div>
        )

    if (!billingState || !coupons)
        return (
            <div>
                An error has occurred: cannot proceed further, missing
                information
            </div>
        )

    if (billingState.subscription === null)
        return <div>No active subscription</div>

    const isTrialing = billingState.subscription.is_trialing

    const {
        helpdeskAndAutomateCoupons,
        automateOnlyCoupons,
        helpdeskOnlyCoupons,
    } = groupCoupons(coupons.data)

    const endOfTrialDatetime = billingState.subscription.trial_end_datetime
    const endOfCurrentCycleDatetime =
        billingState.subscription.current_billing_cycle_end_datetime

    const currentCoupon = billingState.subscription.coupon
    const isHelpdeskAndAutomateCoupon = (currentCoupon?.name || '').includes(
        '-hd+ao-'
    )
    const isHelpdeskCoupon = (currentCoupon?.name || '').includes('-hd-')
    const isAutomateCoupon = (currentCoupon?.name || '').includes('-ao-')

    return (
        <div className={css.container}>
            <UpcomingInvoiceCard
                isTrialing={isTrialing}
                endOfTrialDatetime={endOfTrialDatetime}
                endOfCurrentCycleDatetime={endOfCurrentCycleDatetime}
                availableCoupons={helpdeskAndAutomateCoupons}
                currentHelpdeskAndAutomateCoupon={
                    isHelpdeskAndAutomateCoupon ? currentCoupon : null
                }
                upcomingInvoice={billingState.upcoming_invoice}
                hasExtendedTrial={billingState.subscription.trial_extended}
            />
            <div className={css.productCards}>
                <ProductCardForCoupon
                    productName="Helpdesk"
                    isTrialing={isTrialing}
                    endOfTrialDatetime={endOfTrialDatetime}
                    currentCoupon={isHelpdeskCoupon ? currentCoupon : null}
                    plan={currentHelpdeskPlan}
                    canApplyProductCoupon={!currentCoupon}
                    availableCoupons={helpdeskOnlyCoupons}
                />
                <ProductCardForCoupon
                    productName="Automate"
                    isTrialing={isTrialing}
                    endOfTrialDatetime={endOfTrialDatetime}
                    currentCoupon={isAutomateCoupon ? currentCoupon : null}
                    plan={currentAutomatePlan}
                    canApplyProductCoupon={!currentCoupon}
                    availableCoupons={automateOnlyCoupons}
                />
                <ProductCardForCoupon
                    productName="Voice"
                    isTrialing={isTrialing}
                    endOfTrialDatetime={endOfTrialDatetime}
                    currentCoupon={null}
                    plan={currentVoicePlan}
                    canApplyProductCoupon={false}
                />
                <ProductCardForCoupon
                    productName="SMS"
                    isTrialing={isTrialing}
                    endOfTrialDatetime={endOfTrialDatetime}
                    currentCoupon={null}
                    plan={currentSmsPlan}
                    canApplyProductCoupon={false}
                />
                <ProductCardForCoupon
                    productName="Convert"
                    isTrialing={isTrialing}
                    endOfTrialDatetime={endOfTrialDatetime}
                    currentCoupon={null}
                    plan={currentConvertPlan}
                    canApplyProductCoupon={false}
                />
            </div>
        </div>
    )
}

function groupCoupons(coupons: string[]) {
    const automateOnlyCoupons = coupons
        .filter((coupon) => coupon.includes(`-ao-month`))
        .sort()
        .concat(coupons.filter((coupon) => coupon.includes(`-ao-year`)).sort())

    const helpdeskOnlyCoupons = coupons
        .filter((coupon) => coupon.includes(`-hd-month`))
        .sort()
        .concat(coupons.filter((coupon) => coupon.includes(`-hd-year`)).sort())

    const helpdeskAndAutomateCoupons = coupons
        .filter((coupon) => coupon.includes(`-hd+ao-month`))
        .sort()
        .concat(
            coupons.filter((coupon) => coupon.includes(`-hd+ao-year`)).sort()
        )

    return {
        helpdeskAndAutomateCoupons: helpdeskAndAutomateCoupons,
        automateOnlyCoupons: automateOnlyCoupons,
        helpdeskOnlyCoupons: helpdeskOnlyCoupons,
    }
}
