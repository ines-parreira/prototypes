import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError } from 'axios'

import { UniqueDiscountOfferCreatePayload } from 'models/convert/discountOffer/types'

export const transformAxiosError = (
    errors?: AxiosError<{
        detail: Partial<UniqueDiscountOfferCreatePayload>[]
    }> | null,
): Partial<UniqueDiscountOfferCreatePayload> => {
    if (!errors) {
        return {}
    }

    return errors.response?.data?.detail?.[0] || {}
}

export const setupValidModalParameters = async () => {
    const initial = {
        type: 'percentage',
        prefix: 'hello',
        value: 20,
        minimum_purchase_amount: 199,
    }

    // setup
    const prefixInput = screen.getByLabelText(/Unique code prefix/)
    await userEvent.type(prefixInput, initial.prefix)

    const discountTypeSelect = screen.getByLabelText('Discount')
    const discountValueInput = screen.getByLabelText('Discount value')
    const minRequirementsRadio = screen.getByLabelText(
        'Minimum purchase amount',
    )
    const noMinRequirementsRadio = screen.getByLabelText(
        'No minimum requirements',
    )

    userEvent.click(discountTypeSelect)

    userEvent.click(screen.getByRole('menuitem', { name: 'Percentage' }))

    await userEvent.type(discountValueInput, initial.value.toString())

    userEvent.click(noMinRequirementsRadio)
    userEvent.click(minRequirementsRadio)
    const minPurchaseAmountInput = screen.getByLabelText(
        'Minimum purchase amount value',
    )
    userEvent.clear(minPurchaseAmountInput)
    await userEvent.type(
        minPurchaseAmountInput,
        initial.minimum_purchase_amount.toString(),
    )
}
