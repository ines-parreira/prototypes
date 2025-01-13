import {screen} from '@testing-library/react'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'

import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    convertStatusLimitReached,
    convertStatusOkWarning,
    convertStatusOkWarningUpgrade,
} from 'fixtures/convert'
import useGetConvertStatus from 'pages/convert/common/hooks/useGetConvertStatus'
import {
    BILLING_BASE_PATH,
    BILLING_INFORMATION_PATH,
    BILLING_PAYMENT_CARD_PATH,
    BILLING_PAYMENT_PATH,
} from 'pages/settings/new_billing/constants'
import {
    storeWithActiveSubscriptionWithConvert,
    storeWithActiveSubscriptionWithPhone,
    storeWithCanceledSubscription,
} from 'pages/settings/new_billing/fixtures'
import {renderWithStoreAndQueryClientAndRouter} from 'tests/renderWithStoreAndQueryClientAndRouter'
import {assumeMock} from 'utils/testing'

import BillingStartView from '../BillingStartView'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('pages/aiAgent/hooks/useMeetAiAgentNotification')

// Mock action creators
jest.mock('state/billing/actions', () => {
    const actions: Record<string, unknown> = jest.requireActual(
        'state/billing/actions'
    )
    return {
        ...actions,
        fetchCurrentProductsUsage: () =>
            jest.fn().mockResolvedValue({
                type: 'FETCH_CURRENT_PRODUCTS_USAGE_SUCCESS',
            }),
    }
})

jest.mock('pages/convert/common/hooks/useGetConvertStatus')

jest.mock('../../BillingAddressSetupView/BillingAddressSetupView', () => ({
    BillingAddressSetupView: () => (
        <div data-testid="billing-address-setup-view" />
    ),
}))

jest.mock('../../PaymentMethodSetupView/PaymentMethodSetupView', () => ({
    PaymentMethodSetupView: () => (
        <div data-testid="payment-method-setup-view" />
    ),
}))

const useGetConvertStatusMock = assumeMock(useGetConvertStatus)

describe('BillingStartView', () => {
    it('should render a BillingStartView component and load the Usage & Plans view', () => {
        const {container} = renderWithStoreAndQueryClientAndRouter(
            <BillingStartView />,
            storeWithActiveSubscriptionWithConvert,
            {
                route: BILLING_BASE_PATH,
            }
        )

        expect(container).toMatchSnapshot()
    })

    describe('When customer has no active subscription ', () => {
        it('should only show the "Usage & Plans" and "Payment History" tabs', () => {
            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithCanceledSubscription,
                {
                    route: BILLING_BASE_PATH,
                }
            )
            expect(
                screen.getByText(/You don't have any active subscriptions/i)
            ).toBeInTheDocument()

            expect(screen.getByText(/Usage & Plans/i)).toBeInTheDocument()

            expect(screen.getByText(/Payment History/i)).toBeInTheDocument()

            expect(
                screen.queryByText(/Payment Information/i)
            ).not.toBeInTheDocument()

            expect(
                screen.queryByText(/Gorgias Internal/i)
            ).not.toBeInTheDocument()
        })

        it('should show the "Gorgias internal" tab if user is impersonated', () => {
            window.USER_IMPERSONATED = true

            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithCanceledSubscription,
                {
                    route: BILLING_BASE_PATH,
                }
            )
            expect(screen.getByText(/Gorgias Internal/i)).toBeInTheDocument()
        })

        it('should NOT show the "Gorgias internal" tab if user is NOT impersonated', () => {
            window.USER_IMPERSONATED = null

            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithCanceledSubscription,
                {
                    route: BILLING_BASE_PATH,
                }
            )
            expect(
                screen.queryByText(/Gorgias Internal/i)
            ).not.toBeInTheDocument()
        })
    })

    describe('Convert limit banner', () => {
        const limitReachedText = "You've reached the limit for your Convert"
        const upgradeText = 'you will be auto-upgraded'
        const warningText = 'campaigns will stop being displayed'

        it('should render a Convert limit-reached banner', () => {
            useGetConvertStatusMock.mockReturnValue(convertStatusLimitReached)

            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithActiveSubscriptionWithConvert,
                {
                    route: BILLING_BASE_PATH,
                }
            )

            expect(
                screen.queryByText(limitReachedText, {exact: false})
            ).toBeInTheDocument()
        })

        it('should render a Convert auto-upgrade warning banner', () => {
            useGetConvertStatusMock.mockReturnValue(
                convertStatusOkWarningUpgrade
            )

            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithActiveSubscriptionWithConvert,
                {
                    route: BILLING_BASE_PATH,
                }
            )

            expect(
                screen.queryByText(upgradeText, {exact: false})
            ).toBeInTheDocument()
        })

        it('should render a Convert capping warning banner', () => {
            useGetConvertStatusMock.mockReturnValue(convertStatusOkWarning)

            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithActiveSubscriptionWithConvert,
                {
                    route: BILLING_BASE_PATH,
                }
            )

            expect(
                screen.queryByText(warningText, {exact: false})
            ).toBeInTheDocument()
        })

        it('should not render warming because estimation is outside of cycle', () => {
            useGetConvertStatusMock.mockReturnValue({
                ...convertStatusOkWarning,
                estimated_reach_date: '2023-04-01T00:00:00.000Z',
            })

            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithActiveSubscriptionWithConvert,
                {
                    route: BILLING_BASE_PATH,
                }
            )

            expect(
                screen.queryByText(warningText, {exact: false})
            ).not.toBeInTheDocument()
        })
    })

    describe('PaymentInformation phone self-serve cadence change ', () => {
        beforeEach(() => {
            resetLDMocks()
            mockFlags({
                [FeatureFlagKey.BillingVoiceSmsSelfServe]: false,
            })
        })

        it('should allow phone user to change billing frequency from monthly to yearly', () => {
            mockFlags({
                [FeatureFlagKey.BillingVoiceSmsSelfServe]: true,
            })

            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithActiveSubscriptionWithPhone,
                {route: BILLING_PAYMENT_PATH}
            )

            const button = screen.queryByText('Change Frequency', {
                selector: 'a',
            })

            expect(button).toBeInTheDocument()
        })

        it('should not allow phone user to change billing frequency from monthly to yearly if they dont have the flag', () => {
            mockFlags({
                [FeatureFlagKey.BillingVoiceSmsSelfServe]: false,
            })

            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithActiveSubscriptionWithPhone,
                {route: BILLING_PAYMENT_PATH}
            )

            const button = screen.queryByText('Change Frequency', {
                selector: 'a',
            })

            expect(button).not.toBeInTheDocument()
        })
    })

    describe('Billing Stripe Elements Integration', () => {
        it('should show the new Stripe elements address form', () => {
            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithCanceledSubscription,
                {
                    route: BILLING_INFORMATION_PATH,
                }
            )

            expect(
                screen.getByTestId('billing-address-setup-view')
            ).toBeInTheDocument()
        })

        it('should show the new Stripe elements payment method form', () => {
            renderWithStoreAndQueryClientAndRouter(
                <BillingStartView />,
                storeWithCanceledSubscription,
                {
                    route: BILLING_PAYMENT_CARD_PATH,
                }
            )

            expect(
                screen.getByTestId('payment-method-setup-view')
            ).toBeInTheDocument()
        })
    })
})
