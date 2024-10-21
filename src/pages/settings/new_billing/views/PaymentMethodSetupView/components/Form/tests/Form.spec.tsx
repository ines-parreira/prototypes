import {render, fireEvent, waitFor, screen} from '@testing-library/react'
import React from 'react'
import {useStore} from 'react-redux'
import {fromJS} from 'immutable'
import {useEmailInputField} from 'pages/settings/new_billing/components/EmailInputField/useEmailInputField'
import {useStripeAddressElement} from 'pages/settings/new_billing/components/StripeAddressElement/useStripeAddressElement'
import useAppDispatch from 'hooks/useAppDispatch'
import {assumeMock} from 'utils/testing'
import {getCurrentUser} from 'state/currentUser/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {useStripePaymentElement} from 'pages/settings/new_billing/views/PaymentMethodSetupView/components/StripePaymentElement/useStripePaymentElement'
import {useStartSubscription} from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useStartSubscription'
import {useSubmitPaymentMethodWithBillingContact} from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useSubmitPaymentMethodWithBillingContact'
import {Form} from '../Form'

jest.mock(
    'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useSubmitPaymentMethodWithBillingContact'
)
jest.mock(
    'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useStartSubscription'
)
jest.mock(
    'pages/settings/new_billing/views/PaymentMethodSetupView/components/StripePaymentElement/useStripePaymentElement'
)
jest.mock(
    'pages/settings/new_billing/components/StripeAddressElement/useStripeAddressElement'
)
jest.mock(
    'pages/settings/new_billing/components/EmailInputField/useEmailInputField'
)
jest.mock('react-router-dom', () => ({
    useHistory: jest.fn().mockReturnValue({
        push: mockHistoryPush,
        goBack: mockHistoryGoBack,
    } as any),
}))
jest.mock('react-redux', () => ({useStore: jest.fn()}))
jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock('state/currentUser/selectors')
jest.mock('state/currentAccount/selectors')
jest.mock(
    'pages/settings/new_billing/views/PaymentMethodSetupView/components/SubscriptionSummary/SubscriptionSummary',
    () => ({
        SubscriptionSummary: jest.fn(({handleSubmit}) => (
            <div>
                <h1>Mocked Subscription Summary</h1>
                <button onClick={handleSubmit}>On Submit</button>
            </div>
        )),
    })
)
jest.mock('state/notifications/actions')

const mockDispatch = jest.fn()
const mockHistoryPush = jest.fn()
const mockHistoryGoBack = jest.fn()

assumeMock(useAppDispatch).mockReturnValue(mockDispatch)
assumeMock(getCurrentUser).mockReturnValue(fromJS({id: 'mockUserId'}))
assumeMock(getCurrentAccountState).mockReturnValue(
    fromJS({domain: 'mockDomain'})
)

describe('Form', () => {
    let mockSubmitPaymentMethodWithBillingContact: jest.Mock
    let mockSubmitPaymentMethod: jest.Mock
    let mockStartSubscription: jest.Mock

    beforeEach(() => {
        mockSubmitPaymentMethodWithBillingContact = jest
            .fn()
            .mockResolvedValue({})
        mockSubmitPaymentMethod = jest.fn().mockResolvedValue({})
        mockStartSubscription = jest.fn().mockResolvedValue({})

        assumeMock(useSubmitPaymentMethodWithBillingContact).mockReturnValue({
            submitPaymentMethodWithBillingContact:
                mockSubmitPaymentMethodWithBillingContact,
            submitPaymentMethod: mockSubmitPaymentMethod,
            isLoading: false,
        } as any)

        assumeMock(useStartSubscription).mockReturnValue(mockStartSubscription)
        assumeMock(useStripePaymentElement).mockReturnValue({isComplete: true})
        assumeMock(useStripeAddressElement).mockReturnValue({
            getSelf: jest.fn().mockReturnValue(true),
            isComplete: true,
            getValue: jest.fn().mockReturnValue({address: 'mock address'}),
            error: undefined,
        })
        assumeMock(useEmailInputField).mockReturnValue({
            isComplete: true,
            getValue: jest.fn().mockReturnValue('test@example.com'),
        })
        assumeMock(useStore).mockReturnValue({getState: jest.fn()} as any)
    })

    it('should render form with submit button', () => {
        render(
            <Form contactBilling={jest.fn()} dispatchBillingError={jest.fn()} />
        )

        expect(
            screen.getByRole('button', {name: 'Add payment method'})
        ).toBeVisible()
    })

    it('should call submitPaymentMethodWithBillingContact on form submit', async () => {
        render(
            <Form contactBilling={jest.fn()} dispatchBillingError={jest.fn()} />
        )

        fireEvent.click(
            screen.getByRole('button', {name: 'Add payment method'})
        )

        await waitFor(() => {
            expect(
                mockSubmitPaymentMethodWithBillingContact
            ).toHaveBeenCalledWith({
                email: 'test@example.com',
                shipping: {address: 'mock address'},
            })
        })
    })

    it('should disable submit button if payment is not complete', () => {
        assumeMock(useStripePaymentElement).mockReturnValue({isComplete: false})

        render(
            <Form contactBilling={jest.fn()} dispatchBillingError={jest.fn()} />
        )

        expect(
            screen.getByRole('button', {name: 'Add payment method'})
        ).toBeAriaDisabled()
    })

    it('should disable submit button if address element is incomplete', () => {
        assumeMock(useStripeAddressElement).mockReturnValue({
            getSelf: jest.fn().mockReturnValue(true),
            isComplete: false,
        } as any)

        render(
            <Form contactBilling={jest.fn()} dispatchBillingError={jest.fn()} />
        )

        expect(
            screen.getByRole('button', {name: 'Add payment method'})
        ).toBeAriaDisabled()
    })

    it('should disable submit button if email field is incomplete', () => {
        assumeMock(useEmailInputField).mockReturnValue({
            isComplete: false,
        } as any)

        render(
            <Form contactBilling={jest.fn()} dispatchBillingError={jest.fn()} />
        )

        expect(
            screen.getByRole('button', {name: 'Add payment method'})
        ).toBeAriaDisabled()
    })
})
