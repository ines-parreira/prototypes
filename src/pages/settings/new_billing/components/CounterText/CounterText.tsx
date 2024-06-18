import React from 'react'
import {isLegacyAutomate, isTrial} from 'models/billing/utils'
import {PRODUCT_INFO} from 'pages/settings/new_billing/constants'
import {Plan, ProductType} from 'models/billing/types'

export type CounterTextProps = {
    price: Plan | undefined
    type: ProductType
    interval: string
}

const CounterText = ({price, type, interval}: CounterTextProps) => {
    return (
        <>
            {isTrial(price) && !isLegacyAutomate(price) && (
                <>
                    <strong>
                        ${(price?.extra_ticket_cost ?? 0).toFixed(2)}
                    </strong>{' '}
                    {PRODUCT_INFO[type].perTicket}
                </>
            )}

            {!isTrial(price) && isLegacyAutomate(price) && (
                <>
                    <strong>${((price?.amount ?? 0) / 100).toFixed(2)}</strong>{' '}
                    /{interval}
                </>
            )}

            {!isTrial(price) && !isLegacyAutomate(price) && (
                <>
                    {PRODUCT_INFO[type].counter}/{interval}
                </>
            )}
        </>
    )
}

export default CounterText
