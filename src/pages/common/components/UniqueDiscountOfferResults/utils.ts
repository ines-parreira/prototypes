import {Map} from 'immutable'
import getShopifyMoneySymbol from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/shared/helpers'
import {UniqueDiscountOfferTypeEnum} from 'models/convert/discountOffer/types'

export const testIds = {
    discountOffer: 'discountOffer',
    deleteIntentBtn: 'deleteIntentBtn',
    editBtn: 'editBtn',
}

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
            const currencySymbol = getShopifyMoneySymbol(
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
