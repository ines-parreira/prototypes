import {
    ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
    BILLING_PAYMENT_CARD_PATH,
} from '@repo/billing'
import {
    payingWithAchCredit,
    payingWithAchDebit,
    payingWithCreditCard,
    payingWithExpiredCreditCard,
    payWithShopify,
    payWithShopifyButNotActivated,
    trial,
} from '@repo/billing/fixtures'
import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { AlertBannerTypes, BannerCategories } from 'AlertBanners'
import useAppDispatch from 'hooks/useAppDispatch'
import { getBillingState } from 'models/billing/resources'
import { useIsPaymentEnabled } from 'pages/settings/new_billing/hooks/useIsPaymentEnabled'
import { notify } from 'state/notifications/actions'

jest.mock('models/billing/resources', () => ({
    ...jest.requireActual('models/billing/resources'),
    getBillingState: jest.fn(),
}))

const mockGetBillingState = getBillingState as jest.Mock

// Mock the use of const dispatch = useAppDispatch()
jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock
const dispatch = jest.fn()
useAppDispatchMock.mockReturnValue(dispatch)

// Mock notify
jest.mock('state/notifications/actions')

const mockAddBanner = jest.fn()
const mockRemoveBanner = jest.fn()
jest.mock('AlertBanners/hooks/useBanners', () => ({
    useBanners: jest.fn(() => ({
        addBanner: mockAddBanner,
        removeBanner: mockRemoveBanner,
    })),
}))

describe('useIsPaymentEnabled', () => {
    afterEach(() => {
        mockGetBillingState.mockReset()
    })

    it('should render the no-payment-method use-case', async () => {
        mockGetBillingState.mockResolvedValue(trial)

        const { result } = renderHook(useIsPaymentEnabled)

        await waitFor(() => {
            expect(result.current).toBe(false)
            expect(mockAddBanner).toHaveBeenCalledTimes(1)
            expect(mockAddBanner).toHaveBeenCalledWith({
                message: 'No payment method registered on your account',
                type: AlertBannerTypes.Warning,
                CTA: {
                    type: 'internal',
                    to: BILLING_PAYMENT_CARD_PATH,
                    text: 'Add a payment method',
                },
                category: BannerCategories.PAYMENT_ENABLED,
                instanceId: 'no-payment-method',
            })
        })
    })

    it('should render the credit-card use-case', async () => {
        mockGetBillingState.mockResolvedValue(payingWithCreditCard)

        const { result: isPaymentEnabled } = renderHook(useIsPaymentEnabled)

        await waitFor(() => {
            expect(isPaymentEnabled.current).toBe(true)
        })
        expect(dispatch).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalled()
    })

    it('should render the expired-credit-card use-case', async () => {
        mockGetBillingState.mockResolvedValue(payingWithExpiredCreditCard)
        const creditCard = payingWithCreditCard.customer.credit_card

        const { result } = renderHook(useIsPaymentEnabled)

        await waitFor(() => {
            expect(result.current).toBe(false)
            expect(mockAddBanner).toHaveBeenCalledTimes(1)
            expect(mockAddBanner).toHaveBeenCalledWith({
                message: `${creditCard?.brand} credit card ending with ${creditCard?.last4} is expired`,
                type: AlertBannerTypes.Warning,
                CTA: {
                    type: 'internal',
                    to: BILLING_PAYMENT_CARD_PATH,
                    text: 'Change Payment Method',
                },
                category: BannerCategories.PAYMENT_ENABLED,
                instanceId: 'payment-method-expired',
            })
        })
    })

    it('should render the ach-debit use-case', async () => {
        mockGetBillingState.mockResolvedValue(payingWithAchDebit)

        const { result: isPaymentEnabled } = renderHook(useIsPaymentEnabled)

        await waitFor(() => {
            expect(isPaymentEnabled.current).toBe(true)
        })
        expect(dispatch).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalled()
    })

    it('should render the ach-credit use-case', async () => {
        mockGetBillingState.mockResolvedValue(payingWithAchCredit)

        const { result: isPaymentEnabled } = renderHook(useIsPaymentEnabled)

        await waitFor(() => {
            expect(isPaymentEnabled.current).toBe(true)
        })
        expect(dispatch).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalled()
    })

    it('should render the inactivated-shopify-billing use-case', async () => {
        mockGetBillingState.mockResolvedValue(payWithShopifyButNotActivated)

        const { result } = renderHook(useIsPaymentEnabled)

        await waitFor(() => {
            expect(result.current).toBe(false)
            expect(mockAddBanner).toHaveBeenCalledTimes(1)
            expect(mockAddBanner).toHaveBeenCalledWith({
                message: 'Payment with Shopify is inactive',
                type: AlertBannerTypes.Warning,
                CTA: {
                    type: 'internal',
                    to: ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
                    text: 'Activate Billing with Shopify',
                    opensInNewTab: true,
                },
                category: BannerCategories.PAYMENT_ENABLED,
                instanceId: 'payment-method-expired-shopify-billing',
            })
        })
    })

    it('should render the activated-shopify-billing use-case', async () => {
        mockGetBillingState.mockResolvedValue(payWithShopify)

        const { result: isPaymentEnabled } = renderHook(useIsPaymentEnabled)

        await waitFor(() => {
            expect(isPaymentEnabled.current).toBe(true)
        })
        expect(dispatch).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalled()
    })
})
