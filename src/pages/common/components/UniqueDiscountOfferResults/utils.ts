import {Map} from 'immutable'

import {UniqueDiscountOfferTypeEnum} from 'models/convert/discountOffer/types'
import {getMoneySymbol} from 'utils/getMoneySymbol'

// TODO: Revisit the summary text
// We have to compute the offer summary everytime because this field is not part of the
// payload, and it depends on the currency
export const computeDiscountOfferSummary = (
    type: UniqueDiscountOfferTypeEnum,
    value?: string | number | null,
    integration?: Map<string, string>
): string => {
    switch (type) {
        case 'fixed': {
            if (!integration || integration.isEmpty()) return ''
            const currencySymbol = getMoneySymbol(
                integration.getIn(['meta', 'currency'])
            )
            return value ? `${currencySymbol}${value} off` : ''
        }
        case 'percentage':
            return value ? `${value}% off` : ''
        case 'free_shipping':
            return 'Free shipping'
    }
}
