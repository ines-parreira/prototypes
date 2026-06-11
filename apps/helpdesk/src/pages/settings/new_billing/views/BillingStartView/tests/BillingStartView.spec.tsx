import {
    BILLING_BASE_PATH,
    BILLING_INFORMATION_PATH,
    BILLING_PAYMENT_CARD_PATH,
    BILLING_PAYMENT_PATH,
} from '@repo/billing'
import {
    currentProductsUsageWithPhone,
    storeWithActiveSubscriptionWithConvert,
    storeWithActiveSubscriptionWithPhone,
    storeWithCanceledSubscription,
    storeWithNewlyActiveSubscriptionWithPhone,
} from '@repo/billing/fixtures'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { resetFeatureFlagsMocks } from '@repo/feature-flags/testing'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import {
    convertStatusLimitReached,
    convertStatusOkWarning,
    convertStatusOkWarningUpgrade,
} from 'fixtures/convert'
import { useGetDateAndTimeFormat } from 'hooks/useGetDateAndTimeFormat'
import { useGetConvertStatus } from 'pages/convert/common/hooks/useGetConvertStatus'

import { BillingStartView } from '../BillingStartView'

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => ({
    useAppDispatch: () => mockedDispatch,
}))

jest.mock('pages/aiAgent/hooks/useMeetAiAgentNotification')
jest.mock('hooks/useGetDateAndTimeFormat')

// Mock React Query hooks
const mockUseProductsUsage = jest.fn()
const mockUsePaymentMethod = jest.fn()

jest.mock('models/billing/queries', () => ({
    ...jest.requireActual('models/billing/queries'),
    useProductsUsage: () => mockUseProductsUsage(),
    usePaymentMethod: () => mockUsePaymentMethod(),
}))

jest.mock('pages/convert/common/hooks/useGetConvertStatus')
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const useFlagMock = useFlag as jest.Mock

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

const mockAddBanner = jest.fn()
const mockRemoveBanner = jest.fn()
jest.mock('AlertBanners/hooks/useBanners', () => ({
    useBanners: jest.fn(() => ({
        addBanner: mockAddBanner,
        removeBanner: mockRemoveBanner,
    })),
}))

const useGetConvertStatusMock = assumeMock(useGetConvertStatus)
const mockUseGetDateAndTimeFormat = jest.mocked(useGetDateAndTimeFormat)

describe('BillingStartView', () => {
    beforeEach(() => {
        mockUseGetDateAndTimeFormat.mockReturnValue('MM/DD/YYYY')
        useFlagMock.mockReset()
        useFlagMock.mockReset()
        window.USER_IMPERSONATED = null
        logEventMock.mockClear()

        // Default mock implementations for React Query hooks
        mockUseProductsUsage.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
        })
        mockUsePaymentMethod.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
        })
    })

    describe('Billing maintenance mode is ON', () => {
        it('should should show the maintenance page', () => {
            let mockFeatureFlags = {
                [FeatureFlagKey.BillingMaintenanceMode]: true,
            } as Record<FeatureFlagKey, boolean>

            useFlagMock.mockImplementation(
                (flag: FeatureFlagKey) => mockFeatureFlags[flag],
            )

            render(<BillingStartView />, {
                storeState: storeWithActiveSubscriptionWithConvert,
                initialEntries: [BILLING_BASE_PATH],
            })
            expect(useFlagMock).toHaveBeenCalledWith(
                FeatureFlagKey.BillingMaintenanceMode,
            )

            expect(
                screen.getByText('Billing maintenance in progress'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /We're performing a scheduled update to our billing system. This should be completed within a few hours. If you have any urgent requests, please contact our/i,
                ),
            ).toBeInTheDocument()

            expect(screen.queryByText(/Usage & Plans/i)).not.toBeInTheDocument()

            expect(
                screen.queryByText(/Payment History/i),
            ).not.toBeInTheDocument()

            expect(
                screen.queryByText(/Payment Information/i),
            ).not.toBeInTheDocument()

            expect(
                screen.queryByText(/Gorgias Internal/i),
            ).not.toBeInTheDocument()
        })

        it('should NOT show the maintenance page for impersonated users', () => {
            window.USER_IMPERSONATED = true

            let mockFeatureFlags = {
                [FeatureFlagKey.BillingMaintenanceMode]: true,
            } as Record<FeatureFlagKey, boolean>

            useFlagMock.mockImplementation(
                (flag: FeatureFlagKey) => mockFeatureFlags[flag],
            )

            render(<BillingStartView />, {
                storeState: storeWithActiveSubscriptionWithConvert,
                initialEntries: [BILLING_BASE_PATH],
            })

            expect(
                screen.queryByText('Billing maintenance in progress'),
            ).not.toBeInTheDocument()

            expect(screen.getByText(/Usage & Plans/i)).toBeInTheDocument()
            expect(screen.getByText(/Payment History/i)).toBeInTheDocument()
            expect(screen.getByText(/Gorgias Internal/i)).toBeInTheDocument()
        })
    })

    describe('When customer has no active subscription ', () => {
        it('should only show the "Usage & Plans" and "Payment History" tabs', () => {
            render(<BillingStartView />, {
                storeState: storeWithCanceledSubscription,
                initialEntries: [BILLING_BASE_PATH],
            })

            expect(
                screen.getByText(/You don't have any active subscriptions/i),
            ).toBeInTheDocument()

            expect(screen.getByText(/Usage & Plans/i)).toBeInTheDocument()

            expect(screen.getByText(/Payment History/i)).toBeInTheDocument()

            expect(
                screen.queryByText(/Payment Information/i),
            ).not.toBeInTheDocument()

            expect(
                screen.queryByText(/Gorgias Internal/i),
            ).not.toBeInTheDocument()
        })

        it('should show the "Gorgias internal" tab if user is impersonated', () => {
            window.USER_IMPERSONATED = true

            render(<BillingStartView />, {
                storeState: storeWithCanceledSubscription,
                initialEntries: [BILLING_BASE_PATH],
            })
            expect(screen.getByText(/Gorgias Internal/i)).toBeInTheDocument()
        })

        it('should NOT show the "Gorgias internal" tab if user is NOT impersonated', () => {
            window.USER_IMPERSONATED = null

            render(<BillingStartView />, {
                storeState: storeWithCanceledSubscription,
                initialEntries: [BILLING_BASE_PATH],
            })
            expect(
                screen.queryByText(/Gorgias Internal/i),
            ).not.toBeInTheDocument()
        })
    })

    // TODO: This test go into infinite loop as hook calls setConvertBanner that triggers page rerender but as hook is expecting an object shallow compare fails and hook rerenders
    describe.skip('Convert limit banner', () => {
        const limitReachedText = "You've reached the limit for your Convert"
        const upgradeText = 'you will be auto-upgraded'
        const warningText = 'campaigns will stop being displayed'

        it('should render a Convert limit-reached banner', () => {
            useGetConvertStatusMock.mockReturnValue(convertStatusLimitReached)

            render(<BillingStartView />, {
                storeState: storeWithActiveSubscriptionWithConvert,
                initialEntries: [BILLING_BASE_PATH],
            })
            expect(
                screen.queryByText(limitReachedText, { exact: false }),
            ).toBeInTheDocument()
        })

        it('should render a Convert auto-upgrade warning banner', () => {
            useGetConvertStatusMock.mockReturnValue(
                convertStatusOkWarningUpgrade,
            )

            render(<BillingStartView />, {
                storeState: storeWithActiveSubscriptionWithConvert,
                initialEntries: [BILLING_BASE_PATH],
            })

            expect(
                screen.queryByText(upgradeText, { exact: false }),
            ).toBeInTheDocument()
        })

        it('should render a Convert capping warning banner', () => {
            useGetConvertStatusMock.mockReturnValue(convertStatusOkWarning)

            render(<BillingStartView />, {
                storeState: storeWithActiveSubscriptionWithConvert,
                initialEntries: [BILLING_BASE_PATH],
            })

            expect(
                screen.queryByText(warningText, { exact: false }),
            ).toBeInTheDocument()
        })

        it('should not render warming because estimation is outside of cycle', () => {
            useGetConvertStatusMock.mockReturnValue({
                ...convertStatusOkWarning,
                estimated_reach_date: '2023-04-01T00:00:00.000Z',
            })

            render(<BillingStartView />, {
                storeState: storeWithActiveSubscriptionWithConvert,
                initialEntries: [BILLING_BASE_PATH],
            })

            expect(
                screen.queryByText(warningText, { exact: false }),
            ).not.toBeInTheDocument()
        })
    })

    describe('PaymentInformation phone self-serve cadence change ', () => {
        beforeEach(() => {
            resetFeatureFlagsMocks()
        })

        it('should allow phone user to change billing frequency', () => {
            render(<BillingStartView />, {
                storeState: storeWithActiveSubscriptionWithPhone,
                initialEntries: [BILLING_PAYMENT_PATH],
            })

            const button = screen.queryByText('Change Frequency', {
                selector: 'a',
            })

            expect(button).toBeInTheDocument()
        })
    })

    describe('Billing Stripe Elements Integration', () => {
        it('should show the new Stripe elements address form', () => {
            render(<BillingStartView />, {
                storeState: storeWithCanceledSubscription,
                initialEntries: [BILLING_INFORMATION_PATH],
            })

            expect(
                screen.getByTestId('billing-address-setup-view'),
            ).toBeInTheDocument()
        })

        it('should show the new Stripe elements payment method form', () => {
            render(<BillingStartView />, {
                storeState: storeWithCanceledSubscription,
                initialEntries: [BILLING_PAYMENT_CARD_PATH],
            })

            expect(
                screen.getByTestId('payment-method-setup-view'),
            ).toBeInTheDocument()
        })
    })

    describe('SMS subscription banner', () => {
        it('should show SMS activation banner for new subscription having a SMS plan', () => {
            mockUseProductsUsage.mockReturnValue({
                data: currentProductsUsageWithPhone,
                isLoading: false,
                error: null,
            })

            render(<BillingStartView />, {
                storeState: storeWithNewlyActiveSubscriptionWithPhone,
                initialEntries: [BILLING_BASE_PATH],
            })

            expect(mockAddBanner).toHaveBeenCalled()
            expect(screen.getByText('SMS')).toBeInTheDocument()
        })

        it('should not show SMS activation banner for old subscriptions', () => {
            mockUseProductsUsage.mockReturnValue({
                data: currentProductsUsageWithPhone,
                isLoading: false,
                error: null,
            })

            render(<BillingStartView />, {
                storeState: storeWithActiveSubscriptionWithPhone,
                initialEntries: [BILLING_BASE_PATH],
            })

            expect(mockAddBanner).not.toHaveBeenCalled()
            expect(screen.queryByText('Set Up SMS')).not.toBeInTheDocument()
        })
    })

    describe('Voice subscription banner', () => {
        it('should show Voice activation banner for new subscription having a Voice plan', () => {
            mockUseProductsUsage.mockReturnValue({
                data: currentProductsUsageWithPhone,
                isLoading: false,
                error: null,
            })

            render(<BillingStartView />, {
                storeState: storeWithNewlyActiveSubscriptionWithPhone,
                initialEntries: [BILLING_BASE_PATH],
            })

            expect(mockAddBanner).toHaveBeenCalled()
            expect(screen.getByText('SMS')).toBeInTheDocument()
        })

        it('should not show Voice activation banner for old subscriptions', () => {
            mockUseProductsUsage.mockReturnValue({
                data: currentProductsUsageWithPhone,
                isLoading: false,
                error: null,
            })

            render(<BillingStartView />, {
                storeState: storeWithActiveSubscriptionWithPhone,
                initialEntries: [BILLING_BASE_PATH],
            })

            expect(mockAddBanner).not.toHaveBeenCalled()
            expect(mockRemoveBanner).toHaveBeenCalled()
            expect(screen.queryByText('Set Up SMS')).not.toBeInTheDocument()
        })
    })

    describe('BillingPaymentInformationTabClicked tracking', () => {
        it('should track event when Payment Information tab is clicked', async () => {
            render(<BillingStartView />, {
                storeState: storeWithActiveSubscriptionWithPhone,
                initialEntries: [BILLING_BASE_PATH],
            })

            const paymentInfoTab = screen.getByText('Payment Information')

            logEventMock.mockClear()

            await act(() => userEvent.click(paymentInfoTab))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingPaymentInformationTabClicked,
            )
        })

        it('should NOT show Payment Information tab when subscription is canceled', () => {
            render(<BillingStartView />, {
                storeState: storeWithCanceledSubscription,
                initialEntries: [BILLING_BASE_PATH],
            })

            expect(
                screen.queryByText('Payment Information'),
            ).not.toBeInTheDocument()
        })
    })

    describe('BillingPaymentHistoryTabClicked tracking', () => {
        it('should track event when Payment History tab is clicked', async () => {
            render(<BillingStartView />, {
                storeState: storeWithActiveSubscriptionWithPhone,
                initialEntries: [BILLING_BASE_PATH],
            })

            const paymentHistoryTab = screen.getByText('Payment History')

            logEventMock.mockClear()

            await act(() => userEvent.click(paymentHistoryTab))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingPaymentHistoryTabClicked,
            )
        })
    })

    describe('Loading states', () => {
        it('should show loader when products usage is loading', () => {
            mockUseProductsUsage.mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            })

            const { container } = render(<BillingStartView />, {
                storeState: storeWithActiveSubscriptionWithPhone,
                initialEntries: [BILLING_BASE_PATH],
            })

            expect(
                container.querySelector('.icon-circle-o-notch'),
            ).toBeInTheDocument()
            expect(screen.queryByText('contact us')).not.toBeInTheDocument()
        })

        it('should show loader when products usage is loading even when payment method is also loading', () => {
            mockUseProductsUsage.mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            })
            mockUsePaymentMethod.mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            })

            const { container } = render(<BillingStartView />, {
                storeState: storeWithActiveSubscriptionWithPhone,
                initialEntries: [BILLING_BASE_PATH],
            })

            expect(
                container.querySelector('.icon-circle-o-notch'),
            ).toBeInTheDocument()
            expect(screen.queryByText('contact us')).not.toBeInTheDocument()
        })
    })

    describe('ContactSupportModal', () => {
        it('should render ContactSupportModal component', () => {
            render(<BillingStartView />, {
                storeState: storeWithActiveSubscriptionWithPhone,
                initialEntries: [BILLING_BASE_PATH],
            })

            expect(screen.getByText('contact us')).toBeInTheDocument()
        })
    })

    describe('Voice banner removal', () => {
        it('should remove voice banner when subscription is no longer new', () => {
            mockUseProductsUsage.mockReturnValue({
                data: currentProductsUsageWithPhone,
                isLoading: false,
                error: null,
            })

            render(<BillingStartView />, {
                storeState: storeWithActiveSubscriptionWithPhone,
                initialEntries: [BILLING_BASE_PATH],
            })

            expect(mockRemoveBanner).toHaveBeenCalled()
        })
    })

    describe('SMS banner removal', () => {
        it('should remove SMS banner when subscription is no longer new', () => {
            mockUseProductsUsage.mockReturnValue({
                data: currentProductsUsageWithPhone,
                isLoading: false,
                error: null,
            })

            render(<BillingStartView />, {
                storeState: storeWithActiveSubscriptionWithPhone,
                initialEntries: [BILLING_BASE_PATH],
            })

            expect(mockRemoveBanner).toHaveBeenCalled()
        })
    })
})
