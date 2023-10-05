import {ConvertPrice} from 'models/billing/types'

const convertPricesMapping: Record<string, string> = {
    Basic: 'convert-01',
    Pro: 'convert-03',
    Advanced: 'convert-05',
}

export const getDefaultConvertPriceIndex = (
    convertPrices?: ConvertPrice[],
    helpdeskPlanName?: string
): number => {
    let convertInitialIndex =
        convertPrices?.findIndex((price) => !!price.amount) ?? 0
    if (helpdeskPlanName && !!convertPricesMapping[helpdeskPlanName]) {
        const mappedIndex = convertPrices?.findIndex((price) => {
            return price.internal_id.startsWith(
                convertPricesMapping[helpdeskPlanName]
            )
        })
        convertInitialIndex = mappedIndex ?? convertInitialIndex
    }

    return convertInitialIndex
}
