import {
    payingWithAchCredit,
    payingWithAchDebit,
    payingWithCreditCard,
    payingWithExpiredCreditCard,
    payWithShopify,
    payWithShopifyButNotActivated,
    trial,
} from '@repo/billing/fixtures'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { getBillingState } from 'models/billing/resources'
import { ignoreHTML } from 'tests/ignoreHTML'

import { NewSummaryPaymentSection } from '../NewSummaryPaymentSection'

jest.mock('@repo/logging')
jest.mock('models/billing/resources', () => ({
    ...jest.requireActual('models/billing/resources'),
    getBillingState: jest.fn(),
}))

const mockGetBillingState = getBillingState as jest.Mock
const logEventMock = assumeMock(logEvent)

describe('NewSummaryPaymentSection', () => {
    beforeEach(() => {
        logEventMock.mockClear()
        mockGetBillingState.mockReset()
    })
    it('should render the no-payment-method use-case', async () => {
        mockGetBillingState.mockResolvedValue(trial)
        render(<NewSummaryPaymentSection trackingSource="test" />, {
            storeState: {},
        })
        expect(
            await screen.findByText(
                /No payment method registered on your account/,
            ),
        ).toBeInTheDocument()
        // and merchant can change its payment method
        expect(screen.getByText('Add Payment Method')).toHaveAttribute(
            'href',
            '/app/settings/billing/payment/card',
        )
    })
    it('should render the credit-card use-case', async () => {
        mockGetBillingState.mockResolvedValue(payingWithCreditCard)
        render(<NewSummaryPaymentSection trackingSource="test" />, {
            storeState: {},
        })
        expect(
            await screen.findByText(ignoreHTML(/Visa ending with 4321/)),
        ).toBeInTheDocument()
        expect(screen.queryByText(/is expired/)).not.toBeInTheDocument()
        // and merchant can change its payment method
        expect(screen.getByText('Change Payment Method')).toHaveAttribute(
            'href',
            '/app/settings/billing/payment/card',
        )
    })
    it('should render the expired-credit-card use-case', async () => {
        mockGetBillingState.mockResolvedValue(payingWithExpiredCreditCard)
        render(<NewSummaryPaymentSection trackingSource="test" />, {
            storeState: {},
        })
        expect(
            await screen.findByText(
                ignoreHTML(/Visa ending with 4321 is expired/),
            ),
        ).toBeInTheDocument()
        // and merchant can change its payment method
        expect(screen.getByText('Change Payment Method')).toHaveAttribute(
            'href',
            '/app/settings/billing/payment/card',
        )
    })
    it('should render the ach-debit use-case', async () => {
        mockGetBillingState.mockResolvedValue(payingWithAchDebit)
        render(<NewSummaryPaymentSection trackingSource="test" />, {
            storeState: {},
        })
        expect(
            await screen.findByText(
                ignoreHTML(
                    'Bank transfer (ACH debit) from account Wells Fargo ending with 9876',
                ),
            ),
        ).toBeInTheDocument()
        // and merchant can change its payment method
        expect(screen.getByText('Change Payment Method')).toHaveAttribute(
            'href',
            '/app/settings/billing/payment/card',
        )
    })
    it('should render the ach-credit use-case', async () => {
        mockGetBillingState.mockResolvedValue(payingWithAchCredit)
        render(<NewSummaryPaymentSection trackingSource="test" />, {
            storeState: {},
        })
        expect(
            await screen.findByText(ignoreHTML('Bank transfer (ACH credit)')),
        ).toBeInTheDocument()
        // and merchant CANNOT change its payment method
        expect(
            screen.queryByText(/Change Payment Method/),
        ).not.toBeInTheDocument()
    })
    it('should render the inactivated-shopify-billing use-case', async () => {
        mockGetBillingState.mockResolvedValue(payWithShopifyButNotActivated)
        render(<NewSummaryPaymentSection trackingSource="test" />, {
            storeState: {},
        })
        expect(
            await screen.findByText(/Payment with Shopify is inactive./),
        ).toBeInTheDocument()
        // and merchant can activate its Shopify Billing
        expect(
            screen.getByText('Activate Billing with Shopify'),
        ).toHaveAttribute('href', '/integrations/shopify/billing/activate')
    })
    it('should render the activated-shopify-billing use-case', async () => {
        mockGetBillingState.mockResolvedValue(payWithShopify)
        render(<NewSummaryPaymentSection trackingSource="test" />, {
            storeState: {},
        })
        expect(
            await screen.findByText(
                /Payment with Shopify is active \(Subscription ID: 28982542566\). You're all set./,
            ),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(/Activate Billing with Shopify/),
        ).not.toBeInTheDocument()
    })
    describe('BillingUpdatePaymentMethodClicked tracking', () => {
        it('should track when Add Payment Method is clicked (no payment method)', async () => {
            mockGetBillingState.mockResolvedValue(trial)
            render(<NewSummaryPaymentSection trackingSource="TestSource" />, {
                storeState: {},
            })
            const link = await screen.findByText('Add Payment Method')
            logEventMock.mockClear()
            await act(() => userEvent.click(link))
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUpdatePaymentMethodClicked,
                { action: 'add', source: 'TestSource' },
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
        })
        it('should track when Change Payment Method is clicked (valid credit card)', async () => {
            mockGetBillingState.mockResolvedValue(payingWithCreditCard)
            render(<NewSummaryPaymentSection trackingSource="TestSource" />, {
                storeState: {},
            })
            const link = await screen.findByText('Change Payment Method')
            logEventMock.mockClear()
            await act(() => userEvent.click(link))
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUpdatePaymentMethodClicked,
                { action: 'change', source: 'TestSource' },
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
        })
        it('should track when Change Payment Method is clicked (expired credit card)', async () => {
            mockGetBillingState.mockResolvedValue(payingWithExpiredCreditCard)
            render(<NewSummaryPaymentSection trackingSource="TestSource" />, {
                storeState: {},
            })
            const link = await screen.findByText('Change Payment Method')
            logEventMock.mockClear()
            await act(() => userEvent.click(link))
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUpdatePaymentMethodClicked,
                { action: 'change', source: 'TestSource' },
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
        })
        it('should track when Change Payment Method is clicked (ACH debit)', async () => {
            mockGetBillingState.mockResolvedValue(payingWithAchDebit)
            render(<NewSummaryPaymentSection trackingSource="TestSource" />, {
                storeState: {},
            })
            const link = await screen.findByText('Change Payment Method')
            logEventMock.mockClear()
            await act(() => userEvent.click(link))
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUpdatePaymentMethodClicked,
                { action: 'change', source: 'TestSource' },
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
        })
        it('should render the account-provisioning use-case when customer is undefined', async () => {
            mockGetBillingState.mockResolvedValueOnce({
                ...payingWithCreditCard,
                customer: undefined,
            } as any)
            render(<NewSummaryPaymentSection trackingSource="TestSource" />, {
                storeState: {},
            })
            expect(
                await screen.findByText(/Account is being provisioned/),
            ).toBeInTheDocument()
        })
    })
})
