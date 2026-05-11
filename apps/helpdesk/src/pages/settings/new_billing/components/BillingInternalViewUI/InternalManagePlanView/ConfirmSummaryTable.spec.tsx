import { payingWithCreditCard } from '@repo/billing/fixtures'
import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    DiscountApplicability,
    DiscountObjectType,
    InvoiceCadence,
} from '@gorgias/helpdesk-types'
import type { DiscountType, DiscountVO } from '@gorgias/helpdesk-types'

import {
    basicMonthlyHelpdeskPlan,
    basicYearlyInvoicedMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
} from 'fixtures/plans'
import { ProductType } from 'models/billing/types'

import { ConfirmSummaryTable } from './ConfirmSummaryTable'
import { derivePriceSummary } from './useInternalPlanEditor'
import type { ResolvedPlan } from './useInternalPlanEditor'

function makeResolved(
    overrides: Partial<ResolvedPlan> & { productType: ProductType },
): ResolvedPlan {
    return {
        plan: null,
        currentPlan: null,
        status: 'unchanged',
        action: null,
        ...overrides,
    }
}

const resolvedPlans: ResolvedPlan[] = [
    makeResolved({
        productType: ProductType.Helpdesk,
        plan: proMonthlyHelpdeskPlan,
        currentPlan: basicMonthlyHelpdeskPlan,
        status: 'upgraded',
    }),
]

function renderComponent(
    overrides: Partial<Parameters<typeof ConfirmSummaryTable>[0]> = {},
    discounts?: DiscountVO[],
) {
    const props = {
        billingState: payingWithCreditCard,
        resolvedPlans,
        priceSummary: derivePriceSummary(resolvedPlans, discounts),
        invoiceCadence: InvoiceCadence.Month,
        ...overrides,
    }

    return render(<ConfirmSummaryTable {...props} />)
}

describe('ConfirmSummaryTable balance due', () => {
    it('keeps the balance due label visible while the estimate is loading', () => {
        renderComponent({ isEstimateLoading: true })

        expect(screen.getByText('Balance due today')).toBeInTheDocument()
        expect(screen.queryByText(/^\$.* due today$/)).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /retry/i }),
        ).not.toBeInTheDocument()
    })

    it('renders the estimate error with a retry action', async () => {
        const onRetryEstimate = jest.fn()
        const user = userEvent.setup()

        renderComponent({
            estimateErrorMessage: 'Failed to load estimate.',
            onRetryEstimate,
        })

        expect(screen.getByText('Balance due today')).toBeInTheDocument()
        expect(screen.getByText('Failed to load estimate.')).toBeInTheDocument()

        await act(() =>
            user.click(screen.getByRole('button', { name: /retry/i })),
        )

        expect(onRetryEstimate).toHaveBeenCalledTimes(1)
    })

    it('hides the balance due row when showBalanceDue is false', () => {
        renderComponent({ isEstimateLoading: true, showBalanceDue: false })

        expect(screen.queryByText('Balance due today')).not.toBeInTheDocument()
    })

    it('renders a dash before the balance resolves and the formatted amount after it resolves', () => {
        const { rerender } = renderComponent({ balanceDue: null })

        expect(screen.getByText('—')).toBeInTheDocument()

        rerender(
            <ConfirmSummaryTable
                billingState={payingWithCreditCard}
                resolvedPlans={resolvedPlans}
                priceSummary={derivePriceSummary(resolvedPlans, undefined)}
                invoiceCadence={InvoiceCadence.Month}
                balanceDue={25.5}
            />,
        )

        expect(screen.getByText('$25.50 due today')).toBeInTheDocument()
    })
})

describe('ConfirmSummaryTable discounts', () => {
    it('renders discount row and discounted total when subscription discounts are present', () => {
        const discounts: DiscountVO[] = [
            {
                coupon_name: 'Test 50% off',
                discount_applicability: DiscountApplicability[1],
                discount_object_type: DiscountObjectType[1],
                discount_type: 2 as unknown as DiscountType,
                percent_off: 50,
                products: [],
            } as DiscountVO,
        ]

        renderComponent({}, discounts)

        expect(screen.getByText('Discount')).toBeInTheDocument()
        const discountAmount = screen.getByText('-$180/month')
        expect(discountAmount).toBeInTheDocument()
        expect(discountAmount.closest('s')).toBeNull()

        const totalRow = screen.getByText('Total').closest('div')!
        expect(totalRow.querySelector('s')).toHaveTextContent('$360')
        expect(totalRow).toHaveTextContent('$180/month')
    })
})

describe('ConfirmSummaryTable with yearly-invoiced-monthly plan (cadence != invoice_cadence)', () => {
    const yearlyInvoicedBillingState = {
        ...payingWithCreditCard,
        current_plans: {
            ...payingWithCreditCard.current_plans,
            helpdesk: basicYearlyInvoicedMonthlyHelpdeskPlan,
        },
    }

    const yearlyInvoicedResolvedPlans: ResolvedPlan[] = [
        makeResolved({
            productType: ProductType.Helpdesk,
            plan: basicYearlyInvoicedMonthlyHelpdeskPlan,
            currentPlan: basicYearlyInvoicedMonthlyHelpdeskPlan,
        }),
    ]

    it('renders total with invoice cadence (month), not contract cadence (year)', () => {
        render(
            <ConfirmSummaryTable
                billingState={yearlyInvoicedBillingState}
                resolvedPlans={yearlyInvoicedResolvedPlans}
                priceSummary={derivePriceSummary(
                    yearlyInvoicedResolvedPlans,
                    undefined,
                )}
                invoiceCadence={InvoiceCadence.Month}
            />,
        )

        const totalRow = screen.getByText('Total').closest('div')!
        expect(totalRow).toHaveTextContent('$50/month')
        expect(totalRow).not.toHaveTextContent('/year')
    })

    it('renders product row price with invoice cadence (month)', () => {
        render(
            <ConfirmSummaryTable
                billingState={yearlyInvoicedBillingState}
                resolvedPlans={yearlyInvoicedResolvedPlans}
                priceSummary={derivePriceSummary(
                    yearlyInvoicedResolvedPlans,
                    undefined,
                )}
                invoiceCadence={InvoiceCadence.Month}
            />,
        )

        expect(screen.getAllByText('$50/month')).toHaveLength(2)
    })
})
