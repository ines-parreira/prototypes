import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { mockFlags } from 'jest-launchdarkly-mock'

import {
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
} from 'fixtures/productPrices'
import client from 'models/api/resources'
import { Cadence } from 'models/billing/types'
import { SelectedPlans } from 'pages/settings/new_billing/views/BillingProcessView/BillingProcessView'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import SummaryTotal from '../SummaryTotal'

const selectedPlans: SelectedPlans = {
    helpdesk: {
        isSelected: true,
        plan: basicMonthlyHelpdeskPlan,
    },
    automation: {
        isSelected: true,
        plan: basicMonthlyAutomationPlan,
    },
    voice: {
        isSelected: false,
    },
    sms: {
        isSelected: false,
    },
    convert: {
        isSelected: false,
    },
}
const totalProductAmount =
    basicMonthlyHelpdeskPlan.amount + basicMonthlyAutomationPlan.amount
const totalProductAmountDifferent = totalProductAmount + 10000
const cadence = Cadence.Month
const currency = 'USD'

const mockedServer = new MockAdapter(client)

describe('SummaryTotal without coupons', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.BillingSummaryTotalWithCoupons]: false,
        })
    })

    it('should render total price without old price', () => {
        renderWithStoreAndQueryClientAndRouter(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
            />,
        )

        expect(screen.queryByLabelText('Old price')).not.toBeInTheDocument()
    })

    it('should render total price with old price', () => {
        renderWithStoreAndQueryClientAndRouter(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmountDifferent}
                cadence={cadence}
                currency={currency}
            />,
        )

        expect(screen.getByLabelText('Old price')).toBeInTheDocument()
    })
})

describe('SummaryTotal with coupons', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.BillingSummaryTotalWithCoupons]: true,
        })
    })

    it('should render subtotal and discount line if there is a coupon', async () => {
        mockedServer.onGet('/billing/state').reply(200, {
            customer: {
                coupon: {
                    name: 'Test 100% off',
                    duration: 'forever',
                    duration_in_months: null,
                    amount_off_in_cents: null,
                    amount_off_decimal: null,
                    percent_off: 100,
                    products: [],
                },
            },
            subscription: {},
        })

        renderWithStoreAndQueryClientAndRouter(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
            />,
        )

        await waitFor(() => {
            expect(screen.queryByLabelText('Subtotal')).toBeVisible()
            expect(
                screen.queryByLabelText('Discount amount'),
            ).toBeInTheDocument()
        })
    })

    it('should not render the discount line if the coupon discount amount is 0', async () => {
        mockedServer.onGet('/billing/state').reply(200, {
            customer: {
                coupon: {
                    name: 'Test $0 off',
                    duration: 'forever',
                    duration_in_months: null,
                    amount_off_in_cents: 0,
                    amount_off_decimal: '0',
                    percent_off: null,
                    products: [],
                },
            },
            subscription: {},
        })
        renderWithStoreAndQueryClientAndRouter(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
            />,
        )

        await waitFor(() => {
            expect(screen.queryByLabelText('Subtotal')).not.toBeInTheDocument()
            expect(
                screen.queryByLabelText('Discount amount'),
            ).not.toBeInTheDocument()
        })
    })

    it('should prioritise using subscription.coupon over customer.coupon if both exist', async () => {
        // discount line wouldn't be shown if customer.coupon was used as the discount amount would be 0
        mockedServer.onGet('/billing/state').reply(200, {
            customer: {
                coupon: {
                    name: 'Test $0 off',
                    duration: 'forever',
                    duration_in_months: null,
                    amount_off_in_cents: 0,
                    amount_off_decimal: '0',
                    percent_off: null,
                    products: [],
                },
            },
            subscription: {
                coupon: {
                    name: 'Test 50% off',
                    duration: 'forever',
                    duration_in_months: null,
                    amount_off_in_cents: null,
                    amount_off_decimal: null,
                    percent_off: 50,
                    products: [],
                },
            },
        })
        renderWithStoreAndQueryClientAndRouter(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
            />,
        )

        await waitFor(() => {
            expect(screen.queryByLabelText('Subtotal')).toBeVisible()
            expect(screen.queryByLabelText('Discount amount')).toBeVisible()
        })
    })

    it('should only render the total, without subtotal & discount line, if there is no coupon', async () => {
        mockedServer.onGet('/billing/state').reply(200, {
            customer: {},
            subscription: {},
        })

        renderWithStoreAndQueryClientAndRouter(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
            />,
        )

        await waitFor(() => {
            expect(screen.queryByLabelText('Subtotal')).not.toBeInTheDocument()
            expect(
                screen.queryByLabelText('Discount amount'),
            ).not.toBeInTheDocument()
            expect(screen.getByLabelText('Total price')).toBeInTheDocument()
        })
    })

    it('should only render the total, without subtotal & discount line, if there is no customer or subscription in the billing state', async () => {
        const mockEndpoint = jest.fn(() => [200, {}])

        mockedServer.onGet('/billing/state').reply(mockEndpoint)

        renderWithStoreAndQueryClientAndRouter(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
            />,
        )

        await waitFor(() => {
            // expect /billing/state to have been called
            expect(mockEndpoint).toHaveBeenCalled()
        })

        await waitFor(() => {
            expect(screen.queryByLabelText('Subtotal')).not.toBeInTheDocument()
            expect(
                screen.queryByLabelText('Discount amount'),
            ).not.toBeInTheDocument()
            expect(screen.getByLabelText('Total price')).toBeInTheDocument()
        })
    })
})
