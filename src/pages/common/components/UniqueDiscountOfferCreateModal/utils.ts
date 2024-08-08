import userEvent from '@testing-library/user-event'
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
    appliesTo: 'appliesTo',
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

export const setupValidModalParameters = async (
    getByTestId: CallableFunction,
    getByRole: CallableFunction
): Promise<void> => {
    const initial = {
        type: 'percentage',
        prefix: 'hello',
        value: 20,
        minimum_purchase_amount: 199,
    }

    // setup
    const prefixInput = getByTestId(testIds.prefixInput)
    await userEvent.type(prefixInput, initial.prefix)

    const discountTypeSelect = getByTestId(
        `selected-${testIds.discountTypeSelect}`
    )
    const discountValueInput = getByTestId(testIds.discountValueInput)
    const minRequirementsRadio = getByTestId(testIds.minRequirementsRadio)
    const noMinRequirementsRadio = getByTestId(testIds.noMinRequirementsRadio)

    userEvent.click(discountTypeSelect)

    userEvent.click(getByRole('menuitem', {name: 'Percentage'}))

    await userEvent.type(discountValueInput, initial.value.toString())

    userEvent.click(noMinRequirementsRadio)
    userEvent.click(minRequirementsRadio)
    const minPurchaseAmountInput = getByTestId(testIds.minPurchaseAmountInput)
    userEvent.clear(minPurchaseAmountInput)
    await userEvent.type(
        minPurchaseAmountInput,
        initial.minimum_purchase_amount.toString()
    )
}
