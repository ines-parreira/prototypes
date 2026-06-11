import type { SelectedPlans } from '@repo/billing'
import { Cadence, ProductType, useBillingState } from '@repo/billing'
import { useFlag } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
} from 'fixtures/plans'

import { SummaryTotal } from '../SummaryTotal'

jest.mock('@repo/feature-flags')
jest.mock('@repo/billing', () => ({
    ...jest.requireActual('@repo/billing'),
    useBillingState: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock
const mockUseBillingState = useBillingState as jest.Mock

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
const unbilledChargesDisclaimer =
    "Balance due today doesn't include existing unbilled charges. These charges will be billed at the same time."

describe('SummaryTotal balance due', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
        mockUseBillingState.mockReturnValue({ data: undefined })
    })

    it('renders the "Balance due today" label with a skeleton (no amount) while estimate is loading', () => {
        render(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
                isEstimateLoading
            />,
        )

        expect(screen.getByText('Balance due today')).toBeInTheDocument()
        expect(screen.queryByText(/^\$.* due today$/)).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /retry/i }),
        ).not.toBeInTheDocument()
    })

    it('renders the error message and Retry button when the estimate fails', async () => {
        const onRetryEstimate = jest.fn()
        const user = userEvent.setup()

        render(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
                estimateErrorMessage="Failed to load estimate."
                onRetryEstimate={onRetryEstimate}
            />,
        )

        expect(screen.getByText('Balance due today')).toBeInTheDocument()
        expect(screen.getByText('Failed to load estimate.')).toBeInTheDocument()

        await act(() =>
            user.click(screen.getByRole('button', { name: /retry/i })),
        )

        expect(onRetryEstimate).toHaveBeenCalledTimes(1)
    })

    it('renders the formatted balance due amount when the estimate is positive', () => {
        render(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
                balanceDue={2550}
            />,
        )

        expect(screen.getByText('Balance due today')).toBeInTheDocument()
        expect(screen.getByText('$25.50 due today')).toBeInTheDocument()
    })

    it('renders the unbilled charges disclaimer tooltip when unbilled charges exist', async () => {
        const user = userEvent.setup()
        mockUseBillingState.mockReturnValue({
            data: {
                customer: {
                    unbilled_charges: 500,
                },
            },
        })

        render(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
                balanceDue={2550}
            />,
        )

        const tooltipTrigger = screen.getByRole('button', {
            name: 'Unbilled charges disclaimer',
        })

        await act(() => user.tab())

        expect(document.activeElement).toContainElement(tooltipTrigger)

        expect(await screen.findByText(unbilledChargesDisclaimer)).toBeVisible()
    })

    it('does not render the unbilled charges disclaimer tooltip when unbilled charges are zero', () => {
        mockUseBillingState.mockReturnValue({
            data: {
                customer: {
                    unbilled_charges: 0,
                },
            },
        })

        render(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
                balanceDue={2550}
            />,
        )

        expect(
            screen.queryByRole('button', {
                name: 'Unbilled charges disclaimer',
            }),
        ).not.toBeInTheDocument()
    })

    it('does not render the balance due row when the estimate resolves to 0', () => {
        render(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
                balanceDue={0}
            />,
        )

        expect(screen.queryByText('Balance due today')).not.toBeInTheDocument()
    })
})

describe('SummaryTotal existing credits', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
        mockUseBillingState.mockReturnValue({ data: undefined })
    })

    it('renders the existing-credits row when the customer has a positive credit balance', () => {
        mockUseBillingState.mockReturnValue({
            data: { customer: { existing_credits: 5000 } },
        })

        render(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
                balanceDue={2550}
            />,
        )

        expect(screen.getByText('Existing credits')).toBeInTheDocument()
        expect(screen.getByText('$50')).toBeInTheDocument()
    })

    it('hides the existing-credits row when existing_credits is null', () => {
        mockUseBillingState.mockReturnValue({
            data: { customer: { existing_credits: null } },
        })

        render(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
                balanceDue={2550}
            />,
        )

        expect(screen.queryByText('Existing credits')).not.toBeInTheDocument()
    })

    it('hides the existing-credits row when existing_credits is 0', () => {
        mockUseBillingState.mockReturnValue({
            data: { customer: { existing_credits: 0 } },
        })

        render(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
                balanceDue={2550}
            />,
        )

        expect(screen.queryByText('Existing credits')).not.toBeInTheDocument()
    })

    it('shows the existing-credits row even when there is no balance due to display', () => {
        mockUseBillingState.mockReturnValue({
            data: { customer: { existing_credits: 1234 } },
        })

        render(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
                balanceDue={0}
            />,
        )

        expect(screen.getByText('Existing credits')).toBeInTheDocument()
        expect(screen.queryByText('Balance due today')).not.toBeInTheDocument()
    })
})

describe('SummaryTotal without coupons', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
        mockUseBillingState.mockReturnValue({ data: undefined })
    })

    it('should render total price without old price', () => {
        render(
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
        render(
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
        mockUseBillingState.mockReturnValue({ data: undefined })
    })

    it('should render subtotal and discount line if there is a discount', async () => {
        mockUseBillingState.mockReturnValue({
            data: {
                subscription: {
                    discounts: [
                        {
                            coupon_name: 'Test 100% off',
                            discount_applicability: 1,
                            discount_object_type: 1,
                            discount_type: 'percentage',
                            percent_off: 100,
                            products: [],
                        },
                    ],
                },
            },
        })

        render(
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
        mockUseBillingState.mockReturnValue({
            data: {
                subscription: {
                    discounts: [
                        {
                            coupon_name: 'Test $0 off',
                            discount_applicability: 1,
                            discount_object_type: 1,
                            discount_type: 'fixed_amount',
                            amount_off_in_cents: 0,
                            products: [],
                        },
                    ],
                },
            },
        })

        render(
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

    it('should render subtotal and discount line with percentage discount from subscription.discounts', async () => {
        mockUseBillingState.mockReturnValue({
            data: {
                subscription: {
                    discounts: [
                        {
                            coupon_name: 'Test 50% off',
                            discount_applicability: 1,
                            discount_object_type: 1,
                            discount_type: 'percentage',
                            percent_off: 50,
                            products: [],
                        },
                    ],
                },
            },
        })

        render(
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
        mockUseBillingState.mockReturnValue({
            data: {
                subscription: {
                    discounts: [],
                },
            },
        })

        render(
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

    it('should only render the total, without subtotal & discount line, if there is no subscription in the billing state', async () => {
        mockUseBillingState.mockReturnValue({ data: {} })

        render(
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

    it('should apply a 30% discount from subscription.discounts', async () => {
        mockUseBillingState.mockReturnValue({
            data: {
                subscription: {
                    discounts: [
                        {
                            coupon_name: '30% off',
                            discount_applicability: 1,
                            discount_object_type: 1,
                            discount_type: 'percentage',
                            percent_off: 30,
                            products: [],
                        },
                    ],
                },
            },
        })

        render(
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
            expect(discountElement).toHaveTextContent('- $27')
        })
    })

    it('should apply a 50% discount from subscription.discounts', async () => {
        mockUseBillingState.mockReturnValue({
            data: {
                subscription: {
                    discounts: [
                        {
                            coupon_name: '50% off',
                            discount_applicability: 1,
                            discount_object_type: 1,
                            discount_type: 'percentage',
                            percent_off: 50,
                            products: [],
                        },
                    ],
                },
            },
        })

        render(
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
            expect(discountElement).toHaveTextContent('- $45')
        })
    })

    it('should apply a 25% discount from subscription.discounts', async () => {
        mockUseBillingState.mockReturnValue({
            data: {
                subscription: {
                    discounts: [
                        {
                            coupon_name: '25% off',
                            discount_applicability: 1,
                            discount_object_type: 1,
                            discount_type: 'percentage',
                            percent_off: 25,
                            products: [],
                        },
                    ],
                },
            },
        })

        render(
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

        render(
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

        render(
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
        render(
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
        mockUseBillingState.mockReturnValue({
            data: {
                subscription: {
                    discounts: [
                        {
                            coupon_name: 'Fixed $50 off',
                            discount_applicability: 1,
                            discount_object_type: 1,
                            discount_type: 'fixed_amount',
                            amount_off_in_cents: 5000,
                            products: [],
                        },
                    ],
                },
            },
        })

        render(
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
        mockUseBillingState.mockReturnValue({
            data: {
                subscription: {
                    discounts: [
                        {
                            coupon_name: 'Fixed $75.50 off',
                            discount_applicability: 1,
                            discount_object_type: 1,
                            discount_type: 'fixed_amount',
                            amount_off_in_cents: 7550,
                            products: [],
                        },
                    ],
                },
            },
        })

        render(
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
        mockUseBillingState.mockReturnValue({
            data: {
                subscription: {
                    discounts: [
                        {
                            coupon_name: 'Helpdesk only 20% off',
                            discount_applicability: 1,
                            discount_object_type: 1,
                            discount_type: 'percentage',
                            percent_off: 20,
                            products: ['helpdesk'],
                        },
                    ],
                },
            },
        })

        render(
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

    it('should not show discount when there are no discounts in subscription', async () => {
        mockUseBillingState.mockReturnValue({
            data: {
                subscription: {
                    discounts: [],
                },
            },
        })

        render(
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
        mockUseBillingState.mockReturnValue({
            data: {
                subscription: {
                    discounts: [
                        {
                            coupon_name: 'Fixed $10000 off',
                            discount_applicability: 1,
                            discount_object_type: 1,
                            discount_type: 'fixed_amount',
                            amount_off_in_cents: 1000000,
                            products: [],
                        },
                    ],
                },
            },
        })

        render(
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

        mockUseBillingState.mockReturnValue({
            data: {
                subscription: {
                    discounts: [
                        {
                            coupon_name: 'Test 50% off',
                            discount_applicability: 1,
                            discount_object_type: 1,
                            discount_type: 'percentage',
                            percent_off: 50,
                            products: [],
                        },
                    ],
                },
            },
        })

        render(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
                totalCancelledAmount={totalCancelledAmount}
                cancelledProducts={[ProductType.Automation]}
            />,
        )

        await waitFor(() => {
            expect(screen.queryByLabelText('Subtotal')).toBeVisible()
            expect(screen.queryByLabelText('Discount amount')).toBeVisible()

            const expectedSubtotal =
                (totalProductAmount - totalCancelledAmount) / 100
            const subtotalElement = screen.getByLabelText('Subtotal')
            expect(subtotalElement).toHaveTextContent(`$${expectedSubtotal}`)

            // Automation (3000) is excluded from remainingByProduct, so the 50%
            // discount is applied only to the helpdesk plan (6000 = post-cancellation amount).
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
        const totalCancelledAmount = basicMonthlyAutomationPlan.amount

        mockUseBillingState.mockReturnValue({
            data: {
                subscription: {
                    discounts: [
                        {
                            coupon_name: 'Fixed $20 off',
                            discount_applicability: 1,
                            discount_object_type: 1,
                            discount_type: 'fixed_amount',
                            amount_off_in_cents: 2000,
                            products: [],
                        },
                    ],
                },
            },
        })

        render(
            <SummaryTotal
                selectedPlans={selectedPlans}
                totalProductAmount={totalProductAmount}
                cadence={cadence}
                currency={currency}
                totalCancelledAmount={totalCancelledAmount}
                cancelledProducts={[ProductType.Automation]}
            />,
        )

        await waitFor(() => {
            expect(screen.queryByLabelText('Subtotal')).toBeVisible()
            expect(screen.queryByLabelText('Discount amount')).toBeVisible()

            const expectedSubtotal =
                (totalProductAmount - totalCancelledAmount) / 100
            const subtotalElement = screen.getByLabelText('Subtotal')
            expect(subtotalElement).toHaveTextContent(`$${expectedSubtotal}`)

            // Automation is cancelled so only helpdesk (6000) is eligible for the $20 discount.
            const expectedTotal =
                (totalProductAmount - totalCancelledAmount - 2000) / 100
            const totalElement = screen.getByLabelText('Total price')
            expect(totalElement).toHaveTextContent(`$${expectedTotal}`)
        })
    })
})
