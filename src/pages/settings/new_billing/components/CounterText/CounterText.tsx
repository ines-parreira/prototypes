import React from 'react'

import {Plan, ProductType} from 'models/billing/types'
import {
    getOverageUnitPriceFormatted,
    getPlanPriceFormatted,
    isLegacyAutomate,
    isTrial,
} from 'models/billing/utils'
import {PRODUCT_INFO} from 'pages/settings/new_billing/constants'

export type CounterTextProps = {
    plan: Plan | undefined
    type: ProductType
    interval: string
}

const CounterText = ({plan, type, interval}: CounterTextProps) => {
    return (
        <>
            {isTrial(plan) && !isLegacyAutomate(plan) && (
                <>
                    <strong>{getOverageUnitPriceFormatted(plan)}</strong>{' '}
                    {PRODUCT_INFO[type].perTicket}
                </>
            )}

            {!isTrial(plan) && isLegacyAutomate(plan) && (
                <>
                    <strong>{getPlanPriceFormatted(plan)}</strong> /{interval}
                </>
            )}

            {!isTrial(plan) && !isLegacyAutomate(plan) && (
                <>
                    {PRODUCT_INFO[type].counter}/{interval}
                </>
            )}
        </>
    )
}

export default CounterText
