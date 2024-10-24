import React from 'react'

import {useBillingState, useSalesCoupons} from 'models/billing/queries'
import {BillingInternalViewUI} from 'pages/settings/new_billing/components/BillingInternalViewUI'

export default React.memo(BillingInternalView)

export function BillingInternalView() {
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

    const {
        helpdeskAndAutomateCoupons,
        automateOnlyCoupons,
        helpdeskOnlyCoupons,
    } = groupCoupons(coupons.data)

    return (
        <>
            {BillingInternalViewUI({
                helpdeskAndAutomateCoupons,
                helpdeskOnlyCoupons,
                automateOnlyCoupons,
                billingState,
            })}
        </>
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
