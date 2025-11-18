import type { Cadence, Plan, ProductType } from 'models/billing/types'
import {
    getOverageUnitPriceFormatted,
    getPlanPriceFormatted,
    getProductInfo,
    isLegacyAutomate,
    isTrial,
} from 'models/billing/utils'

export type CounterTextProps = {
    plan: Plan | undefined
    type: ProductType
    cadence: Cadence
}

const CounterText = ({ plan, type, cadence }: CounterTextProps) => {
    const productInfo = getProductInfo(type, plan)
    return (
        <>
            {isTrial(plan) && !isLegacyAutomate(plan) && (
                <>
                    <strong>{getOverageUnitPriceFormatted(plan)}</strong>{' '}
                    {productInfo.perTicket}
                </>
            )}

            {!isTrial(plan) && isLegacyAutomate(plan) && (
                <>
                    <strong>{getPlanPriceFormatted(plan)}</strong> /{cadence}
                </>
            )}

            {!isTrial(plan) && !isLegacyAutomate(plan) && (
                <>
                    {productInfo.counter}/{cadence}
                </>
            )}
        </>
    )
}

export default CounterText
