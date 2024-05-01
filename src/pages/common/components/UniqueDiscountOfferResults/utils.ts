import {Map} from 'immutable'
import getShopifyMoneySymbol from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/shared/helpers'
import {UniqueDiscountOffer} from 'models/convert/discountOffer/types'

export const testIds = {
    discountOffer: 'discountOffer',
    deleteIntentBtn: 'deleteIntentBtn',
    editBtn: 'editBtn',
}

// TODO: Revisit the summary text
// We have to compute the offer summary everytime because this field is not part of the
// payload, and it depends on the currency
export const computeDiscountOfferSummary = (
    offer?: UniqueDiscountOffer,
    integration?: Map<string, string>
): string => {
    if (!offer || !integration || integration.isEmpty()) return ''
    if (offer?.summary) return offer.summary

    switch (offer.type) {
        case 'fixed': {
            const currencySymbol = getShopifyMoneySymbol(
                integration.getIn(['meta', 'currency'])
            )
            return offer.value ? `Get ${currencySymbol}${offer.value} off` : ''
        }
        case 'percentage':
            return offer.value ? `Get ${offer.value}% off` : ''
        case 'free_shipping':
            return 'Get free shipping for this order'
    }
}
