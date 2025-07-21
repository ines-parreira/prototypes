import { Cadence, Plan, ProductType } from 'models/billing/types'
import {
    getOverageUnitPriceFormatted,
    getPlanPriceFormatted,
    isLegacyAutomate,
    isTrial,
} from 'models/billing/utils'
import { PRODUCT_INFO } from 'pages/settings/new_billing/constants'

export type CounterTextProps = {
    plan: Plan | undefined
    type: ProductType
    cadence: Cadence
}

const CounterText = ({ plan, type, cadence }: CounterTextProps) => {
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
                    <strong>{getPlanPriceFormatted(plan)}</strong> /{cadence}
                </>
            )}

            {!isTrial(plan) && !isLegacyAutomate(plan) && (
                <>
                    {PRODUCT_INFO[type].counter}/{cadence}
                </>
            )}
        </>
    )
}

export default CounterText
