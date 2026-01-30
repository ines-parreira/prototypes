import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { MemoryRouter } from 'react-router-dom'

import client from 'models/api/resources'
import type { BillingState } from 'models/billing/types'
import {
    payingWithAchCredit,
    payingWithAchDebit,
    payingWithCreditCard,
    payingWithExpiredCreditCard,
    payWithShopify,
    payWithShopifyButNotActivated,
    trial,
} from 'pages/settings/new_billing/fixtures'
import { ignoreHTML } from 'tests/ignoreHTML'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { NewSummaryPaymentSection } from '../NewSummaryPaymentSection'

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

const mockedServer = new MockAdapter(client)

describe('NewSummaryPaymentSection', () => {
    beforeEach(() => {
        logEventMock.mockClear()
    })

    it('should render the no-payment-method use-case', async () => {
        mockedServer.onGet('/billing/state').reply(200, trial)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <NewSummaryPaymentSection trackingSource="test" />
            </MemoryRouter>,
            {},
        )

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
        mockedServer.onGet('/billing/state').reply(200, payingWithCreditCard)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <NewSummaryPaymentSection trackingSource="test" />
            </MemoryRouter>,
            {},
        )

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
        mockedServer
            .onGet('/billing/state')
            .reply(200, payingWithExpiredCreditCard)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <NewSummaryPaymentSection trackingSource="test" />
            </MemoryRouter>,
            {},
        )

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
        mockedServer.onGet('/billing/state').reply(200, payingWithAchDebit)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <NewSummaryPaymentSection trackingSource="test" />
            </MemoryRouter>,
            {},
        )

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
        mockedServer.onGet('/billing/state').reply(200, payingWithAchCredit)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <NewSummaryPaymentSection trackingSource="test" />
            </MemoryRouter>,
            {},
        )

        expect(
            await screen.findByText(ignoreHTML('Bank transfer (ACH credit)')),
        ).toBeInTheDocument()

        // and merchant CANNOT change its payment method
        expect(
            screen.queryByText(/Change Payment Method/),
        ).not.toBeInTheDocument()
    })

    it('should render the inactivated-shopify-billing use-case', async () => {
        mockedServer
            .onGet('/billing/state')
            .reply(200, payWithShopifyButNotActivated)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <NewSummaryPaymentSection trackingSource="test" />
            </MemoryRouter>,
            {},
        )

        expect(
            await screen.findByText(/Payment with Shopify is inactive./),
        ).toBeInTheDocument()

        // and merchant can activate its Shopify Billing
        expect(
            screen.getByText('Activate Billing with Shopify'),
        ).toHaveAttribute('href', '/integrations/shopify/billing/activate')
    })

    it('should render the activated-shopify-billing use-case', async () => {
        mockedServer.onGet('/billing/state').reply(200, payWithShopify)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <NewSummaryPaymentSection trackingSource="test" />
            </MemoryRouter>,
            {},
        )

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
            mockedServer.onGet('/billing/state').reply(200, trial)

            renderWithStoreAndQueryClientProvider(
                <MemoryRouter>
                    <NewSummaryPaymentSection trackingSource="TestSource" />
                </MemoryRouter>,
                {},
            )

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
            mockedServer
                .onGet('/billing/state')
                .reply(200, payingWithCreditCard)

            renderWithStoreAndQueryClientProvider(
                <MemoryRouter>
                    <NewSummaryPaymentSection trackingSource="TestSource" />
                </MemoryRouter>,
                {},
            )

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
            mockedServer
                .onGet('/billing/state')
                .reply(200, payingWithExpiredCreditCard)

            renderWithStoreAndQueryClientProvider(
                <MemoryRouter>
                    <NewSummaryPaymentSection trackingSource="TestSource" />
                </MemoryRouter>,
                {},
            )

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
            mockedServer.onGet('/billing/state').reply(200, payingWithAchDebit)

            renderWithStoreAndQueryClientProvider(
                <MemoryRouter>
                    <NewSummaryPaymentSection trackingSource="TestSource" />
                </MemoryRouter>,
                {},
            )

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
            const accountCreationState: BillingState = {
                ...trial,
                customer: undefined as unknown as BillingState['customer'],
            }

            mockedServer
                .onGet('/billing/state')
                .reply(200, accountCreationState)

            renderWithStoreAndQueryClientProvider(
                <MemoryRouter>
                    <NewSummaryPaymentSection trackingSource="TestSource" />
                </MemoryRouter>,
                {},
            )

            expect(
                await screen.findByText(/Account is being provisioned/),
            ).toBeInTheDocument()
        })
    })
})
