import { screen } from '@testing-library/react'

import { userEvent } from 'utils/testing/userEvent'

export const setupValidModalParameters = async () => {
    const codeInput = screen.getByLabelText('Discount code')
    await userEvent.type(codeInput, 'MYCODE')

    const discountTypeSelect = screen.getByLabelText('Discount type')
    const discountValueInput = screen.getByLabelText('Discount')
    const minRequirementsRadio = screen.getByLabelText(
        'Minimum purchase amount',
    )
    const noMinRequirementsRadio = screen.getByLabelText(
        'No minimum requirements',
    )

    userEvent.click(discountTypeSelect)
    userEvent.click(screen.getByRole('menuitem', { name: 'Percentage' }))

    // set discount min amount
    userEvent.click(noMinRequirementsRadio)
    userEvent.click(minRequirementsRadio)
    const minPurchaseAmountInput = screen.getByLabelText(
        'Minimum purchase amount value',
    )
    userEvent.clear(minPurchaseAmountInput)
    await userEvent.type(minPurchaseAmountInput, '199')

    userEvent.clear(discountValueInput)
    await userEvent.type(discountValueInput, '20')
}
