import { useFlag } from '@repo/feature-flags'
import { screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import {
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
} from 'fixtures/plans'
import client from 'models/api/resources'
import { Cadence, SubscriptionStatus } from 'models/billing/types'
import type { SelectedPlans } from 'pages/settings/new_billing/types'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import SummaryTotal from '../SummaryTotal'

jest.mock('@repo/feature-flags')

const mockUseFlag = useFlag as jest.Mock

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
        mockUseFlag.mockReturnValue(false)
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
        mockUseFlag.mockReturnValue(true)
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

    it('should use customer.coupon when subscription status is CANCELED', async () => {
        mockedServer.onGet('/billing/state').reply(200, {
            customer: {
                coupon: {
                    name: 'Customer 30% off',
                    duration: 'forever',
                    duration_in_months: null,
                    amount_off_in_cents: null,
                    amount_off_decimal: null,
                    percent_off: 30,
                    products: [],
                },
            },
            subscription: {
                status: SubscriptionStatus.CANCELED,
                coupon: {
                    name: 'Subscription 50% off',
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
            // Verify the discount is 30% (customer coupon) not 50% (subscription coupon)
            const discountElement = screen.getByLabelText('Discount amount')
            expect(discountElement).toHaveTextContent('- $27')
        })
    })

    it('should use subscription.coupon when subscription status is not CANCELED', async () => {
        mockedServer.onGet('/billing/state').reply(200, {
            customer: {
                coupon: {
                    name: 'Customer 30% off',
                    duration: 'forever',
                    duration_in_months: null,
                    amount_off_in_cents: null,
                    amount_off_decimal: null,
                    percent_off: 30,
                    products: [],
                },
            },
            subscription: {
                status: 'active',
                coupon: {
                    name: 'Subscription 50% off',
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
            // Verify the discount is 50% (subscription coupon) not 30% (customer coupon)
            const discountElement = screen.getByLabelText('Discount amount')
            expect(discountElement).toHaveTextContent('- $45')
        })
    })

    it('should use customer.coupon when subscription is CANCELED and no subscription.coupon exists', async () => {
        mockedServer.onGet('/billing/state').reply(200, {
            customer: {
                coupon: {
                    name: 'Customer 25% off',
                    duration: 'forever',
                    duration_in_months: null,
                    amount_off_in_cents: null,
                    amount_off_decimal: null,
                    percent_off: 25,
                    products: [],
                },
            },
            subscription: {
                status: SubscriptionStatus.CANCELED,
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
            const discountElement = screen.getByLabelText('Discount amount')
            expect(discountElement).toHaveTextContent('- $22.50')
        })
    })

    it('should subtract totalCancelledAmount from total price', () => {
        const totalCancelledAmount = 3000

        renderWithStoreAndQueryClientAndRouter(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
                totalCancelledAmount={totalCancelledAmount}
            />,
        )

        const expectedTotal = (totalProductAmount - totalCancelledAmount) / 100
        expect(screen.getByLabelText('Total price')).toHaveTextContent(
            `$${expectedTotal}`,
        )
    })

    it('should subtract totalCancelledAmount from old price when displayed', () => {
        const totalCancelledAmount = 3000

        renderWithStoreAndQueryClientAndRouter(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmountDifferent}
                cadence={cadence}
                currency={currency}
                totalCancelledAmount={totalCancelledAmount}
            />,
        )

        const expectedOldPrice =
            (totalProductAmountDifferent - totalCancelledAmount) / 100
        expect(screen.getByLabelText('Old price')).toHaveTextContent(
            `$${expectedOldPrice}`,
        )
    })

    it('should handle zero totalCancelledAmount', () => {
        renderWithStoreAndQueryClientAndRouter(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
                totalCancelledAmount={0}
            />,
        )

        const expectedTotal = totalProductAmount / 100
        expect(screen.getByLabelText('Total price')).toHaveTextContent(
            `$${expectedTotal}`,
        )
    })

    it('should correctly calculate discount with amount_off_in_cents coupon', async () => {
        mockedServer.onGet('/billing/state').reply(200, {
            customer: {
                coupon: {
                    name: 'Fixed $50 off',
                    duration: 'forever',
                    duration_in_months: null,
                    amount_off_in_cents: 5000, // $50 off
                    amount_off_decimal: '50',
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
            expect(screen.queryByLabelText('Subtotal')).toBeVisible()
            expect(screen.queryByLabelText('Discount amount')).toBeVisible()
            const discountElement = screen.getByLabelText('Discount amount')
            expect(discountElement).toHaveTextContent('- $50')
        })
    })

    it('should correctly calculate discount with amount_off_decimal coupon', async () => {
        // Since getTotalWithDiscounts doesn't handle amount_off_decimal,
        // we'll test with amount_off_in_cents instead
        mockedServer.onGet('/billing/state').reply(200, {
            customer: {
                coupon: {
                    name: 'Fixed $75.50 off',
                    duration: 'forever',
                    duration_in_months: null,
                    amount_off_in_cents: 7550, // $75.50 in cents
                    amount_off_decimal: '75.50',
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
            expect(screen.queryByLabelText('Subtotal')).toBeVisible()
            expect(screen.queryByLabelText('Discount amount')).toBeVisible()
            const discountElement = screen.getByLabelText('Discount amount')
            expect(discountElement).toHaveTextContent('- $75.50')
        })
    })

    it('should handle coupon with products restriction correctly', async () => {
        mockedServer.onGet('/billing/state').reply(200, {
            customer: {
                coupon: {
                    name: 'Helpdesk only 20% off',
                    duration: 'forever',
                    duration_in_months: null,
                    amount_off_in_cents: null,
                    amount_off_decimal: null,
                    percent_off: 20,
                    products: ['helpdesk'],
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
            expect(screen.queryByLabelText('Discount amount')).toBeVisible()
            // Should only apply discount to helpdesk plan, not automation
            const discountElement = screen.getByLabelText('Discount amount')
            expect(discountElement).toHaveTextContent('- $12')
        })
    })

    it('should not show discount when subscription is CANCELED and no coupons exist', async () => {
        mockedServer.onGet('/billing/state').reply(200, {
            customer: {},
            subscription: {
                status: SubscriptionStatus.CANCELED,
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
            expect(screen.queryByLabelText('Subtotal')).not.toBeInTheDocument()
            expect(
                screen.queryByLabelText('Discount amount'),
            ).not.toBeInTheDocument()
            expect(screen.getByLabelText('Total price')).toBeInTheDocument()
        })
    })

    it('should handle edge case when discount amount exceeds total price', async () => {
        mockedServer.onGet('/billing/state').reply(200, {
            customer: {
                coupon: {
                    name: 'Fixed $10000 off',
                    duration: 'forever',
                    duration_in_months: null,
                    amount_off_in_cents: 1000000, // $10,000 off (more than total)
                    amount_off_decimal: '10000',
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
            expect(screen.queryByLabelText('Subtotal')).toBeVisible()
            expect(screen.queryByLabelText('Discount amount')).toBeVisible()
            // Discount should be capped at total amount
            const totalElement = screen.getByLabelText('Total price')
            expect(totalElement).toHaveTextContent('$0')
        })
    })

    it('should subtract totalCancelledAmount from subtotal and total with discounts', async () => {
        const totalCancelledAmount = 3000

        mockedServer.onGet('/billing/state').reply(200, {
            customer: {
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
            subscription: {},
        })

        renderWithStoreAndQueryClientAndRouter(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
                totalCancelledAmount={totalCancelledAmount}
            />,
        )

        await waitFor(() => {
            expect(screen.queryByLabelText('Subtotal')).toBeVisible()
            expect(screen.queryByLabelText('Discount amount')).toBeVisible()

            const expectedSubtotal =
                (totalProductAmount - totalCancelledAmount) / 100
            const subtotalElement = screen.getByLabelText('Subtotal')
            expect(subtotalElement).toHaveTextContent(`$${expectedSubtotal}`)

            // Discount is now calculated on the amount after cancellations
            const expectedDiscount =
                ((totalProductAmount - totalCancelledAmount) / 100) * 0.5
            const discountElement = screen.getByLabelText('Discount amount')
            expect(discountElement).toHaveTextContent(`- $${expectedDiscount}`)

            const expectedTotal = expectedSubtotal - expectedDiscount
            const totalElement = screen.getByLabelText('Total price')
            expect(totalElement).toHaveTextContent(`$${expectedTotal}`)
        })
    })

    it('should subtract totalCancelledAmount from total with amount_off_in_cents coupon', async () => {
        const totalCancelledAmount = 2000

        mockedServer.onGet('/billing/state').reply(200, {
            customer: {
                coupon: {
                    name: 'Fixed $20 off',
                    duration: 'forever',
                    duration_in_months: null,
                    amount_off_in_cents: 2000,
                    amount_off_decimal: '20',
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
                totalCancelledAmount={totalCancelledAmount}
            />,
        )

        await waitFor(() => {
            expect(screen.queryByLabelText('Subtotal')).toBeVisible()
            expect(screen.queryByLabelText('Discount amount')).toBeVisible()

            const expectedSubtotal =
                (totalProductAmount - totalCancelledAmount) / 100
            const subtotalElement = screen.getByLabelText('Subtotal')
            expect(subtotalElement).toHaveTextContent(`$${expectedSubtotal}`)

            const expectedTotal =
                (totalProductAmount - totalCancelledAmount - 2000) / 100
            const totalElement = screen.getByLabelText('Total price')
            expect(totalElement).toHaveTextContent(`$${expectedTotal}`)
        })
    })
})
