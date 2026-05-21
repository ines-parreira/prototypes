import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import type { RootState } from 'state/types'

import { SocialsFooterFormComponent } from '../FormComponents/SocialsFooterFormComponent'

const mockUpdateValue = jest.fn()
const mockSetIsPristine = jest.fn()

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: fromJS(integrationsState) as Map<any, any>,
} as RootState

const defaultProps = {
    socialsDisclaimer: null,
    updateValue: mockUpdateValue,
    setIsPristine: mockSetIsPristine,
    isRequired: false,
}

const renderWithProvider = (props: any = defaultProps) => {
    return render(<SocialsFooterFormComponent {...props} />, {
        storeState: defaultState,
    })
}

describe('SocialsFooterFormComponent', () => {
    beforeEach(() => {
        mockUpdateValue.mockClear()
        mockSetIsPristine.mockClear()
    })

    it('renders with checkbox unchecked when socialsDisclaimer is null', () => {
        renderWithProvider()
        const checkbox = screen.getByRole('checkbox', {
            name: /Use initial message footer/i,
        })
        expect(checkbox).not.toBeChecked()
    })

    it('renders with checkbox checked when socialsDisclaimer has a value', () => {
        renderWithProvider({
            ...defaultProps,
            socialsDisclaimer: 'Powered by AI',
        })
        const checkbox = screen.getByRole('checkbox', {
            name: /Use initial message footer/i,
        })
        expect(checkbox).toBeChecked()
    })

    it('disables textarea when checkbox is unchecked', () => {
        renderWithProvider()
        const textarea = screen.getByRole('textbox')
        expect(textarea).toBeDisabled()
    })

    it('sets initial value and pristine flag when checking the checkbox', async () => {
        const user = userEvent.setup()
        renderWithProvider()
        const checkbox = screen.getByRole('checkbox', {
            name: /Use initial message footer/i,
        })
        await act(() => user.click(checkbox))
        expect(mockSetIsPristine).toHaveBeenCalledWith(false)
        expect(mockUpdateValue).toHaveBeenCalledWith(
            'socialsDisclaimer',
            'Powered by AI',
        )
    })

    it('clears disclaimer when unchecking', async () => {
        const user = userEvent.setup()
        renderWithProvider({
            ...defaultProps,
            socialsDisclaimer: 'Powered by AI',
        })
        const checkbox = screen.getByRole('checkbox', {
            name: /Use initial message footer/i,
        })
        await act(() => user.click(checkbox))
        expect(mockUpdateValue).toHaveBeenCalledWith('socialsDisclaimer', null)
    })

    it('updates value when typing in textarea', async () => {
        const user = userEvent.setup()
        renderWithProvider({
            ...defaultProps,
            socialsDisclaimer: 'Powered by AI',
        })
        const textarea = screen.getByRole('textbox')
        await act(() => user.type(textarea, 'a'))
        expect(mockSetIsPristine).toHaveBeenCalledWith(false)
        expect(mockUpdateValue).toHaveBeenCalled()
    })

    it('shows initial placeholder text', () => {
        renderWithProvider()
        expect(screen.getByPlaceholderText('Powered by AI')).toBeInTheDocument()
    })
})
