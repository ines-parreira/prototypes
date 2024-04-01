import {ConvertPrice, PlanInterval} from 'models/billing/types'

const convertPricesMapping: Record<string, string> = {
    Starter: 'convert-01',
    Basic: 'convert-01',
    Pro: 'convert-01',
    Advanced: 'convert-02',
    Custom: 'convert-03',
}

export const getDefaultConvertPriceIndex = (
    interval?: PlanInterval,
    convertPrices?: ConvertPrice[],
    helpdeskPlanName?: string
): number => {
    let convertInitialIndex =
        convertPrices?.findIndex(
            (price) => !!price.amount && price.interval === interval
        ) ?? 0
    if (helpdeskPlanName && !!convertPricesMapping[helpdeskPlanName]) {
        const mappedIndex = convertPrices?.findIndex(
            (price) =>
                price.interval === interval &&
                price.internal_id.startsWith(
                    convertPricesMapping[helpdeskPlanName]
                )
        )
        convertInitialIndex = mappedIndex ?? convertInitialIndex
    }

    return convertInitialIndex
}
