import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { integrationsState } from 'fixtures/integrations'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import { SmsFooterFormComponent } from '../FormComponents/SmsFooterFormComponent'

const mockUpdateValue = jest.fn()
const mockSetIsPristine = jest.fn()

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: fromJS(integrationsState) as Map<any, any>,
} as RootState

const defaultProps = {
    smsDisclaimer: null,
    updateValue: mockUpdateValue,
    setIsPristine: mockSetIsPristine,
    isRequired: false,
}

const renderWithProvider = (props: any = defaultProps) => {
    return renderWithRouter(
        <QueryClientProvider client={mockQueryClient()}>
            <Provider store={mockStore(defaultState)}>
                <SmsFooterFormComponent {...props} />
            </Provider>
        </QueryClientProvider>,
    )
}

describe('SmsFooterFormComponent', () => {
    beforeEach(() => {
        mockUpdateValue.mockClear()
        mockSetIsPristine.mockClear()
    })

    describe('Initial rendering', () => {
        it('should render with checkbox unchecked when smsDisclaimer is null', () => {
            renderWithProvider()

            const checkbox = screen.getByRole('checkbox', {
                name: /Use initial message footer/i,
            })
            expect(checkbox).not.toBeChecked()
        })

        it('should render with checkbox unchecked when smsDisclaimer is empty string', () => {
            renderWithProvider({ ...defaultProps, smsDisclaimer: '' })

            const checkbox = screen.getByRole('checkbox', {
                name: /Use initial message footer/i,
            })
            expect(checkbox).not.toBeChecked()
        })

        it('should render with checkbox checked when smsDisclaimer has a value', () => {
            renderWithProvider({
                ...defaultProps,
                smsDisclaimer: 'Powered by AI',
            })

            const checkbox = screen.getByRole('checkbox', {
                name: /Use initial message footer/i,
            })
            expect(checkbox).toBeChecked()
        })

        it('should render textarea disabled when checkbox is unchecked', () => {
            renderWithProvider()

            const textarea = screen.getByRole('textbox')
            expect(textarea).toBeDisabled()
        })

        it('should render textarea enabled when checkbox is checked', () => {
            renderWithProvider({
                ...defaultProps,
                smsDisclaimer: 'Powered by AI',
            })

            const textarea = screen.getByRole('textbox')
            expect(textarea).not.toBeDisabled()
        })

        it('should display correct placeholder text', () => {
            renderWithProvider()

            expect(
                screen.getByPlaceholderText('Powered by AI'),
            ).toBeInTheDocument()
        })

        it('should display the description text', () => {
            renderWithProvider()

            expect(
                screen.getByText(
                    /At the end of the first SMS sent by AI Agent/i,
                ),
            ).toBeInTheDocument()
        })
    })

    describe('Checkbox interactions', () => {
        it('should enable textarea and set initial value when checking the checkbox', async () => {
            const user = userEvent.setup()
            renderWithProvider()

            const checkbox = screen.getByRole('checkbox', {
                name: /Use initial message footer/i,
            })

            await act(() => user.click(checkbox))

            expect(mockSetIsPristine).toHaveBeenCalledWith(false)
            expect(mockUpdateValue).toHaveBeenCalledWith(
                'smsDisclaimer',
                'Powered by AI',
            )
        })

        it('should clear disclaimer when unchecking the checkbox', async () => {
            const user = userEvent.setup()
            renderWithProvider({
                ...defaultProps,
                smsDisclaimer: 'Powered by AI',
            })

            const checkbox = screen.getByRole('checkbox', {
                name: /Use initial message footer/i,
            })

            await act(() => user.click(checkbox))

            expect(mockSetIsPristine).toHaveBeenCalledWith(false)
            expect(mockUpdateValue).toHaveBeenCalledWith('smsDisclaimer', null)
        })

        it('should clear disclaimer when unchecking if smsDisclaimer already has a value', async () => {
            const user = userEvent.setup()
            renderWithProvider({
                ...defaultProps,
                smsDisclaimer: 'Custom disclaimer text',
            })

            const checkbox = screen.getByRole('checkbox', {
                name: /Use initial message footer/i,
            })

            await act(() => user.click(checkbox))

            expect(mockUpdateValue).toHaveBeenCalledWith('smsDisclaimer', null)
        })

        it('should set initial value when checking the checkbox if smsDisclaimer is empty string', async () => {
            const user = userEvent.setup()
            renderWithProvider({
                ...defaultProps,
                smsDisclaimer: '',
            })

            // First enable the checkbox
            const checkbox = screen.getByRole('checkbox', {
                name: /Use initial message footer/i,
            })

            await act(() => user.click(checkbox))

            // Should set initial value when smsDisclaimer is empty string
            expect(mockUpdateValue).toHaveBeenCalledWith(
                'smsDisclaimer',
                'Powered by AI',
            )
        })
    })

    describe('Textarea interactions', () => {
        it('should call updateValue when typing in textarea', async () => {
            const user = userEvent.setup()
            renderWithProvider({
                ...defaultProps,
                smsDisclaimer: 'Powered by AI',
            })

            const textarea = screen.getByRole('textbox')

            await act(() => user.clear(textarea))
            await act(() => user.type(textarea, 'New disclaimer'))

            expect(mockUpdateValue).toHaveBeenCalled()
            expect(mockSetIsPristine).toHaveBeenCalled()
        })

        it('should call setIsPristine when changing textarea value', async () => {
            const user = userEvent.setup()
            renderWithProvider({
                ...defaultProps,
                smsDisclaimer: 'Powered by AI',
            })

            const textarea = screen.getByRole('textbox')

            await act(() => user.type(textarea, 'a'))

            expect(mockSetIsPristine).toHaveBeenCalledWith(false)
        })

        it('should not show error when textarea is not blurred', () => {
            renderWithProvider({
                ...defaultProps,
                smsDisclaimer: 'Powered by AI',
                isRequired: true,
            })

            expect(
                screen.queryByText('SMS footer is required.'),
            ).not.toBeInTheDocument()
        })

        it('should not show error when not required even if textarea is empty', async () => {
            const user = userEvent.setup()
            renderWithProvider({
                ...defaultProps,
                smsDisclaimer: 'Powered by AI',
                isRequired: false,
            })

            const textarea = screen.getByRole('textbox')

            await act(() => user.clear(textarea))
            await act(() => user.tab())

            expect(
                screen.queryByText('SMS footer is required.'),
            ).not.toBeInTheDocument()
        })

        it('should not show error when checkbox is disabled', () => {
            renderWithProvider({
                ...defaultProps,
                smsDisclaimer: null,
                isRequired: true,
            })

            expect(
                screen.queryByText('SMS footer is required.'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Validation logic', () => {
        it('should not show error when smsDisclaimer has valid content', async () => {
            const user = userEvent.setup()
            renderWithProvider({
                ...defaultProps,
                smsDisclaimer: 'Valid disclaimer',
                isRequired: true,
            })

            const textarea = screen.getByRole('textbox')

            await act(() => user.click(textarea))
            await act(() => user.tab())

            expect(
                screen.queryByText('SMS footer is required.'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Edge cases', () => {
        it('should work without setIsPristine callback', async () => {
            const user = userEvent.setup()
            const propsWithoutSetIsPristine = {
                ...defaultProps,
                setIsPristine: undefined,
            }
            renderWithProvider(propsWithoutSetIsPristine)

            const checkbox = screen.getByRole('checkbox', {
                name: /Use initial message footer/i,
            })

            await act(() => user.click(checkbox))

            // Should still call updateValue with the initial value even without setIsPristine
            expect(mockUpdateValue).toHaveBeenCalledWith(
                'smsDisclaimer',
                'Powered by AI',
            )
        })

        it('should not reactively update checkbox when smsDisclaimer prop changes', () => {
            const { rerender } = renderWithProvider({
                ...defaultProps,
                smsDisclaimer: null,
            })

            let checkbox = screen.getByRole('checkbox', {
                name: /Use initial message footer/i,
            })
            expect(checkbox).not.toBeChecked()

            // Rerendering with a new prop value should NOT automatically check the checkbox
            // The checkbox state is only set on initial mount, not on prop changes
            rerender(
                <QueryClientProvider client={mockQueryClient()}>
                    <Provider store={mockStore(defaultState)}>
                        <SmsFooterFormComponent
                            {...defaultProps}
                            smsDisclaimer="New value"
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            checkbox = screen.getByRole('checkbox', {
                name: /Use initial message footer/i,
            })
            expect(checkbox).not.toBeChecked()
        })

        it('should display the correct initial value in textarea', () => {
            renderWithProvider({
                ...defaultProps,
                smsDisclaimer: 'Custom initial value',
            })

            const textarea = screen.getByRole('textbox')
            expect(textarea).toHaveValue('Custom initial value')
        })

        it('should display initial value in textarea when smsDisclaimer is null', () => {
            renderWithProvider({ ...defaultProps, smsDisclaimer: null })

            const textarea = screen.getByRole('textbox')
            expect(textarea).toHaveValue('Powered by AI')
        })

        it('should not disable checkbox when clearing textarea while focused', async () => {
            const user = userEvent.setup()
            renderWithProvider({
                ...defaultProps,
                smsDisclaimer: 'Powered by AI',
            })

            const checkbox = screen.getByRole('checkbox', {
                name: /Use initial message footer/i,
            })
            const textarea = screen.getByRole('textbox')

            expect(checkbox).toBeChecked()

            await act(() => user.clear(textarea))

            expect(checkbox).toBeChecked()
        })

        it('should disable checkbox when blurring empty textarea', async () => {
            const user = userEvent.setup()
            const { rerender } = renderWithProvider({
                ...defaultProps,
                smsDisclaimer: 'Powered by AI',
            })

            const checkbox = screen.getByRole('checkbox', {
                name: /Use initial message footer/i,
            })
            let textarea = screen.getByRole('textbox')

            expect(checkbox).toBeChecked()

            // Clear the textarea
            await act(() => user.clear(textarea))

            // Simulate the parent component updating the prop after the onChange
            rerender(
                <QueryClientProvider client={mockQueryClient()}>
                    <Provider store={mockStore(defaultState)}>
                        <SmsFooterFormComponent
                            {...defaultProps}
                            smsDisclaimer=""
                        />
                    </Provider>
                </QueryClientProvider>,
            )

            textarea = screen.getByRole('textbox')

            // Now blur the textarea
            await act(() => user.click(textarea))
            await act(() => user.tab())

            expect(checkbox).not.toBeChecked()
        })

        it('should keep checkbox enabled when blurring textarea with content', async () => {
            const user = userEvent.setup()
            renderWithProvider({
                ...defaultProps,
                smsDisclaimer: 'Powered by AI',
            })

            const checkbox = screen.getByRole('checkbox', {
                name: /Use initial message footer/i,
            })
            const textarea = screen.getByRole('textbox')

            expect(checkbox).toBeChecked()

            await act(() => user.type(textarea, ' - Updated'))
            await act(() => user.tab())

            expect(checkbox).toBeChecked()
        })
    })
})
