import {
    ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
    BILLING_PAYMENT_CARD_PATH,
} from '@repo/billing'
import { waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import { AlertBannerTypes, BannerCategories } from 'AlertBanners'
import useAppDispatch from 'hooks/useAppDispatch'
import client from 'models/api/resources'
import type { CreditCard } from 'models/billing/types'
import {
    payingWithAchCredit,
    payingWithAchDebit,
    payingWithCreditCard,
    payingWithExpiredCreditCard,
    payWithShopify,
    payWithShopifyButNotActivated,
    trial,
} from 'pages/settings/new_billing/fixtures'
import { useIsPaymentEnabled } from 'pages/settings/new_billing/hooks/useIsPaymentEnabled'
import { notify } from 'state/notifications/actions'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'

const mockedServer = new MockAdapter(client)

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
    it('should render the no-payment-method use-case', async () => {
        mockedServer.onGet('/billing/state').reply(200, trial)

        const { result } =
            renderHookWithStoreAndQueryClientProvider(useIsPaymentEnabled)

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
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        const { result: isPaymentEnabled } =
            renderHookWithStoreAndQueryClientProvider(useIsPaymentEnabled)

        await waitFor(() => {
            expect(isPaymentEnabled.current).toBe(true)
        })
        expect(dispatch).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalled()
    })

    it('should render the expired-credit-card use-case', async () => {
        mockedServer
            .onGet('/billing/state')
            .reply(200, payingWithExpiredCreditCard)

        const creditCard = payingWithCreditCard.customer
            .credit_card as CreditCard

        const { result } =
            renderHookWithStoreAndQueryClientProvider(useIsPaymentEnabled)

        await waitFor(() => {
            expect(result.current).toBe(false)
            expect(mockAddBanner).toHaveBeenCalledTimes(1)
            expect(mockAddBanner).toHaveBeenCalledWith({
                message: `${creditCard.brand} credit card ending with ${creditCard.last4} is expired`,
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
        mockedServer.onGet('/billing/state').reply(200, payingWithAchDebit)

        const { result: isPaymentEnabled } =
            renderHookWithStoreAndQueryClientProvider(useIsPaymentEnabled)

        await waitFor(() => {
            expect(isPaymentEnabled.current).toBe(true)
        })
        expect(dispatch).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalled()
    })

    it('should render the ach-credit use-case', async () => {
        mockedServer.onGet('/billing/state').reply(200, payingWithAchCredit)

        const { result: isPaymentEnabled } =
            renderHookWithStoreAndQueryClientProvider(useIsPaymentEnabled)

        await waitFor(() => {
            expect(isPaymentEnabled.current).toBe(true)
        })
        expect(dispatch).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalled()
    })

    it('should render the inactivated-shopify-billing use-case', async () => {
        mockedServer
            .onGet('/billing/state')
            .reply(200, payWithShopifyButNotActivated)

        const { result } =
            renderHookWithStoreAndQueryClientProvider(useIsPaymentEnabled)

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
        mockedServer.onGet('/billing/state').reply(200, payWithShopify)

        const { result: isPaymentEnabled } =
            renderHookWithStoreAndQueryClientProvider(useIsPaymentEnabled)

        await waitFor(() => {
            expect(isPaymentEnabled.current).toBe(true)
        })
        expect(dispatch).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalled()
    })
})
