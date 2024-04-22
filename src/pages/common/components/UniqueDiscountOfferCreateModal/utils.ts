import {AxiosError} from 'axios'
import {UniqueDiscountOfferCreatePayload} from 'models/convert/discountOffer/types'

export const testIds = {
    header: 'header',
    editAlert: 'editAlert',
    prefixInput: 'prefixInput',
    discountTypeSelect: 'discountTypeSelect',
    discountValueInput: 'discountValueInput',
    noMinRequirementsRadio: 'noMinRequirementsRadio',
    minRequirementsRadio: 'minRequirementsRadio',
    minPurchaseAmountInput: 'minPurchaseAmountInput',
    backBtn: 'backBtn',
    saveBtn: 'saveBtn',
}

export const transformAxiosError = (
    errors?: AxiosError<{
        detail: Partial<UniqueDiscountOfferCreatePayload>[]
    }> | null
): Partial<UniqueDiscountOfferCreatePayload> => {
    if (!errors) {
        return {}
    }

    return errors.response?.data?.detail?.[0] || {}
}
