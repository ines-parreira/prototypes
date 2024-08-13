import userEvent from '@testing-library/user-event'

export const testIds = {
    codeInput: 'codeInput',
    discountTypeSelect: 'discountTypeSelect',
    discountValueInput: 'discountValueInput',
    noMinRequirementsRadio: 'noMinRequirementsRadio',
    minRequirementsRadio: 'minRequirementsRadio',
    minPurchaseAmountInput: 'minPurchaseAmountInput',
    saveBtn: 'saveBtn',
}

export const setupValidModalParameters = async (
    getByTestId: CallableFunction,
    getByRole: CallableFunction
): Promise<void> => {
    const codeInput = getByTestId(testIds.codeInput)
    await userEvent.type(codeInput, 'MYCODE2')

    const discountTypeSelect = getByTestId(
        `selected-${testIds.discountTypeSelect}`
    )
    const discountValueInput = getByTestId(testIds.discountValueInput)
    const minRequirementsRadio = getByTestId(testIds.minRequirementsRadio)
    const noMinRequirementsRadio = getByTestId(testIds.noMinRequirementsRadio)

    userEvent.click(discountTypeSelect)

    userEvent.click(getByRole('menuitem', {name: 'Percentage'}))

    // set discount min amount
    userEvent.click(noMinRequirementsRadio)
    userEvent.click(minRequirementsRadio)
    const minPurchaseAmountInput = getByTestId(testIds.minPurchaseAmountInput)
    userEvent.clear(minPurchaseAmountInput)
    await userEvent.type(minPurchaseAmountInput, '199')

    userEvent.clear(discountValueInput)
    await userEvent.type(discountValueInput, '20')
}
