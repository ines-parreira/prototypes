import React, {useMemo} from 'react'
import {isAAOLegacyPrice, isTrialPrice} from 'models/billing/utils'
import {PRODUCT_INFO} from 'pages/settings/new_billing/constants'
import {
    AutomationPrice,
    ConvertPrice,
    HelpdeskPrice,
    ProductType,
    SMSOrVoicePrice,
} from 'models/billing/types'

export type CounterTextProps = {
    price:
        | HelpdeskPrice
        | AutomationPrice
        | SMSOrVoicePrice
        | ConvertPrice
        | undefined
    type: ProductType
    interval: string
}

const CounterText = ({price, type, interval}: CounterTextProps) => {
    const isTrial = useMemo(
        () => Boolean(price && isTrialPrice(price, type)),
        [price, type]
    )

    const isLegacy: boolean = useMemo(
        () => Boolean(price && isAAOLegacyPrice(price, type)),
        [price, type]
    )

    return (
        <>
            {isTrial && !isLegacy && (
                <>
                    <strong>
                        ${(price?.extra_ticket_cost ?? 0).toFixed(2)}
                    </strong>{' '}
                    {PRODUCT_INFO[type].perTicket}
                </>
            )}

            {!isTrial && isLegacy && (
                <>
                    <strong>${((price?.amount ?? 0) / 100).toFixed(2)}</strong>{' '}
                    /{interval}
                </>
            )}

            {!isTrial && !isLegacy && (
                <>
                    {PRODUCT_INFO[type].counter}/{interval}
                </>
            )}
        </>
    )
}

export default CounterText
