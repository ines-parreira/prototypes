import LD from 'launchdarkly-react-client-sdk'

import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'
import {screen} from '@testing-library/react'
import {assumeMock, renderWithRouter} from 'utils/testing'
import {
    BILLING_BASE_PATH,
    BILLING_INFORMATION_PATH,
    BILLING_PAYMENT_PATH,
} from 'pages/settings/new_billing/constants'
import useGetConvertStatus from 'pages/convert/common/hooks/useGetConvertStatus'
import {
    convertStatusLimitReached,
    convertStatusOkWarning,
    convertStatusOkWarningUpgrade,
} from 'fixtures/convert'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    storeWithActiveSubscriptionWithConvert,
    storeWithActiveSubscriptionWithPhone,
    storeWithCanceledSubscription,
} from 'pages/settings/new_billing/fixtures'
import BillingStartView from '../BillingStartView'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

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

const useGetConvertStatusMock = assumeMock(useGetConvertStatus)

const WrappedBillingStartView = () => (
    <Provider store={storeWithActiveSubscriptionWithConvert}>
        <BillingStartView />
    </Provider>
)

describe('BillingStartView', () => {
    it('should render a BillingStartView component and load the Usage & Plans view', () => {
        const {container} = renderWithRouter(<WrappedBillingStartView />, {
            route: BILLING_BASE_PATH,
        })

        expect(container).toMatchSnapshot()
    })

    describe('When customer has no active subscription ', () => {
        it('should only show the "Usage & Plans" and "Payment History" tabs', () => {
            renderWithRouter(
                <Provider store={storeWithCanceledSubscription}>
                    <BillingStartView />
                </Provider>,
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

            renderWithRouter(
                <Provider store={storeWithCanceledSubscription}>
                    <BillingStartView />
                </Provider>,
                {
                    route: BILLING_BASE_PATH,
                }
            )
            expect(screen.getByText(/Gorgias Internal/i)).toBeInTheDocument()
        })

        it('should NOT show the "Gorgias internal" tab if user is NOT impersonated', () => {
            window.USER_IMPERSONATED = null

            renderWithRouter(
                <Provider store={storeWithCanceledSubscription}>
                    <BillingStartView />
                </Provider>,
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

            const {queryByText} = renderWithRouter(
                <WrappedBillingStartView />,
                {
                    route: BILLING_BASE_PATH,
                }
            )

            expect(
                queryByText(limitReachedText, {exact: false})
            ).toBeInTheDocument()
        })

        it('should render a Convert auto-upgrade warning banner', () => {
            useGetConvertStatusMock.mockReturnValue(
                convertStatusOkWarningUpgrade
            )

            const {queryByText} = renderWithRouter(
                <WrappedBillingStartView />,
                {
                    route: BILLING_BASE_PATH,
                }
            )

            expect(queryByText(upgradeText, {exact: false})).toBeInTheDocument()
        })

        it('should render a Convert capping warning banner', () => {
            useGetConvertStatusMock.mockReturnValue(convertStatusOkWarning)

            const {queryByText} = renderWithRouter(
                <WrappedBillingStartView />,
                {
                    route: BILLING_BASE_PATH,
                }
            )

            expect(queryByText(warningText, {exact: false})).toBeInTheDocument()
        })

        it('should not render warming because estimation is outside of cycle', () => {
            useGetConvertStatusMock.mockReturnValue({
                ...convertStatusOkWarning,
                estimated_reach_date: '2023-04-01T00:00:00.000Z',
            })

            const {queryByText} = renderWithRouter(
                <WrappedBillingStartView />,
                {
                    route: BILLING_BASE_PATH,
                }
            )

            expect(
                queryByText(warningText, {exact: false})
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
            renderWithRouter(
                <Provider store={storeWithActiveSubscriptionWithPhone}>
                    <BillingStartView />
                </Provider>,
                {
                    route: BILLING_PAYMENT_PATH,
                }
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
            renderWithRouter(
                <Provider store={storeWithActiveSubscriptionWithPhone}>
                    <BillingStartView />
                </Provider>,
                {
                    route: BILLING_PAYMENT_PATH,
                }
            )

            const button = screen.queryByText('Change Frequency', {
                selector: 'a',
            })

            expect(button).not.toBeInTheDocument()
        })
    })

    describe('Billing Stripe Elements Integration', () => {
        it('should NOT show the new Stripe elements address form if the integration flag is off', () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.BillingStripeElementsPaymentIntegration]: false,
            }))

            jest.mock(
                '../../BillingAddressSetupView/BillingAddressSetupView',
                () => ({
                    BillingAddressSetupView: () => (
                        <div data-testid="billing-address-setup-view" />
                    ),
                })
            )

            renderWithRouter(
                <Provider store={storeWithCanceledSubscription}>
                    <BillingStartView />
                </Provider>,
                {
                    route: BILLING_INFORMATION_PATH,
                }
            )

            expect(
                screen.queryByTestId('billing-address-setup-view')
            ).not.toBeInTheDocument()
        })

        it('should show the new Stripe elements address form if the integration flag is on', () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.BillingStripeElementsPaymentIntegration]: true,
            }))

            renderWithRouter(
                <Provider store={storeWithCanceledSubscription}>
                    <BillingStartView />
                </Provider>,
                {
                    route: BILLING_INFORMATION_PATH,
                }
            )

            expect(
                screen.getByTestId('billing-address-setup-view')
            ).toBeInTheDocument()
        })
    })
})
