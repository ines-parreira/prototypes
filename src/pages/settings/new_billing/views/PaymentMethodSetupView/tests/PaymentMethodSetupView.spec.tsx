import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import {assumeMock} from 'utils/testing'
import {useBillingContact} from 'models/billing/queries'
import {StripeElementsProvider} from 'pages/settings/new_billing/components/StripeElementsProvider/StripeElementsProvider'
import {useHasCreditCard} from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useHasCreditCard'
import {useSetupIntent} from 'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useSetupIntent'
import {PaymentMethodSetupView} from '../PaymentMethodSetupView'

jest.mock(
    'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useSetupIntent'
)
jest.mock(
    'pages/settings/new_billing/views/PaymentMethodSetupView/hooks/useHasCreditCard'
)
jest.mock('models/billing/queries', () => ({
    useBillingContact: jest.fn(),
}))
jest.mock(
    'pages/settings/new_billing/components/StripeElementsProvider/StripeElementsProvider',
    () => ({
        StripeElementsProvider: jest.fn(({children}) => <div>{children}</div>),
    })
)
jest.mock('pages/settings/new_billing/components/BackLink', () => () => (
    <div>BackLink Component</div>
))
jest.mock(
    'pages/settings/new_billing/components/EmailInputField/EmailInputField',
    () => ({
        EmailInputField: jest.fn(() => <div>EmailInputField Component</div>),
    })
)
jest.mock(
    'pages/settings/new_billing/components/StripeAddressElement/StripeAddressElement',
    () => ({
        StripeAddressElement: jest.fn(() => (
            <div>StripeAddressElement Component</div>
        )),
    })
)
jest.mock(
    'pages/settings/new_billing/views/PaymentMethodSetupView/components/StripePaymentElement/StripePaymentElement',
    () => ({
        StripePaymentElement: jest.fn(() => (
            <div>StripePaymentElement Component</div>
        )),
    })
)
jest.mock(
    'pages/settings/new_billing/views/PaymentMethodSetupView/components/VerificationChargeDisclaimer/VerificationChargeDisclaimer',
    () => ({
        VerificationChargeDisclaimer: jest.fn(() => (
            <div>VerificationChargeDisclaimer Component</div>
        )),
    })
)
jest.mock(
    'pages/settings/new_billing/views/PaymentMethodSetupView/components/Form/Form',
    () => ({
        Form: jest.fn(({children}) => <div>Form Component {children}</div>),
    })
)
jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>Loading...</div>
))

assumeMock(useBillingContact).mockReturnValue({isLoading: false} as any)

describe('PaymentMethodSetupView', () => {
    it('should render Loader when setup intent is loading', () => {
        assumeMock(useSetupIntent).mockReturnValue({isLoading: true} as any)

        assumeMock(useHasCreditCard).mockReturnValue({isSuccess: true} as any)

        render(
            <PaymentMethodSetupView
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
            />
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render Loader when clientSecret is not available', () => {
        assumeMock(useSetupIntent).mockReturnValue({
            isLoading: false,
            clientSecret: undefined,
        } as any)

        assumeMock(useHasCreditCard).mockReturnValue({isSuccess: true} as any)

        render(
            <PaymentMethodSetupView
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
            />
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render Loader when hasCreditCard is not successful', () => {
        assumeMock(useSetupIntent).mockReturnValue({
            isLoading: false,
            clientSecret: 'mockClientSecret',
        } as any)
        assumeMock(useHasCreditCard).mockReturnValue({isSuccess: false} as any)

        render(
            <PaymentMethodSetupView
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
            />
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render StripeElementsProvider and form when setup intent and credit card are available', async () => {
        assumeMock(useSetupIntent).mockReturnValue({
            isLoading: false,
            clientSecret: 'mockClientSecret',
        } as any)
        assumeMock(useHasCreditCard).mockReturnValue({
            isSuccess: true,
            data: false,
        } as any)

        render(
            <PaymentMethodSetupView
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
            />
        )

        await waitFor(() => {
            expect(StripeElementsProvider).toHaveBeenCalledWith(
                expect.objectContaining({clientSecret: 'mockClientSecret'}),
                {}
            )
            expect(screen.getByText('Form Component')).toBeInTheDocument()
            expect(
                screen.getByText('StripePaymentElement Component')
            ).toBeInTheDocument()
            expect(
                screen.getByText('VerificationChargeDisclaimer Component')
            ).toBeInTheDocument()
            expect(
                screen.getByText('EmailInputField Component')
            ).toBeInTheDocument()
            expect(
                screen.getByText('StripeAddressElement Component')
            ).toBeInTheDocument()
        })
    })

    it('should not render EmailInputField and StripeAddressElement if user has credit card', async () => {
        assumeMock(useSetupIntent).mockReturnValue({
            isLoading: false,
            clientSecret: 'mockClientSecret',
        } as any)

        assumeMock(useHasCreditCard).mockReturnValue({
            isSuccess: true,
            data: true,
        } as any)

        render(
            <PaymentMethodSetupView
                contactBilling={jest.fn()}
                dispatchBillingError={jest.fn()}
            />
        )

        await waitFor(() => {
            expect(screen.getByText('Form Component')).toBeInTheDocument()
            expect(
                screen.getByText('StripePaymentElement Component')
            ).toBeInTheDocument()
            expect(
                screen.getByText('VerificationChargeDisclaimer Component')
            ).toBeInTheDocument()
            expect(
                screen.queryByText('EmailInputField Component')
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('StripeAddressElement Component')
            ).not.toBeInTheDocument()
        })
    })
})
