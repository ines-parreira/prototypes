import {
    AutomatePrice,
    ConvertPrice,
    HelpdeskPrice,
    PlanInterval,
    SMSOrVoicePrice,
} from 'models/billing/types'

export type PriceForIntervalProps<
    T extends HelpdeskPrice | AutomatePrice | SMSOrVoicePrice | ConvertPrice
> = {
    prices: T[]
    currentPrice?: T
    interval: PlanInterval
}

export const getPriceForInterval = <
    T extends HelpdeskPrice | AutomatePrice | SMSOrVoicePrice | ConvertPrice
>({
    prices,
    currentPrice,
    interval,
}: PriceForIntervalProps<T>): T | undefined => {
    const switchInterval =
        interval === PlanInterval.Month
            ? {to: 'monthly', from: 'yearly'}
            : {to: 'yearly', from: 'monthly'}
    const internalId = currentPrice?.internal_id.replace(
        switchInterval.from,
        switchInterval.to
    )

    const price = prices.find((price) => price.internal_id === internalId)

    if (!price) {
        return currentPrice
    }

    return price
}
