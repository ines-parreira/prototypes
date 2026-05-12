import type { BillingState } from '@repo/billing'
import { payingWithCreditCard } from '@repo/billing/fixtures'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

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
    voicePlan0,
    voicePlan3,
    voicePlan4,
} from 'fixtures/plans'
import { ProductType, SubscriptionStatus } from 'models/billing/types'

import { InternalSummary } from './InternalSummary'
import { derivePriceSummary } from './useInternalPlanEditor'
import type { ResolvedPlan } from './useInternalPlanEditor'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(
        http.get('*/billing/state', () =>
            HttpResponse.json(payingWithCreditCard),
        ),
    )
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

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

function renderComponent(
    resolvedPlans: ResolvedPlan[],
    hasChanges = false,
    billingState: BillingState = payingWithCreditCard,
    discounts?: DiscountVO[],
    invoiceCadence: InvoiceCadence = InvoiceCadence.Month,
) {
    return render(
        <InternalSummary
            billingState={billingState}
            resolvedPlans={resolvedPlans}
            priceSummary={derivePriceSummary(resolvedPlans, discounts)}
            hasChanges={hasChanges}
            invoiceCadence={invoiceCadence}
            onPreviewChanges={jest.fn()}
        />,
    )
}

describe('InternalSummary', () => {
    it('renders product names, prices, and total for unchanged plans', () => {
        const plans: ResolvedPlan[] = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
            }),
        ]
        renderComponent(plans)

        expect(screen.getByText('Helpdesk')).toBeInTheDocument()
        expect(screen.getAllByText('$60/month')).toHaveLength(2)
        expect(screen.queryByText('Upgraded')).not.toBeInTheDocument()
        expect(screen.queryByText('Downgraded')).not.toBeInTheDocument()
    })

    it('renders Upgraded tag and strikethrough old price when plan is upgraded', () => {
        const plans: ResolvedPlan[] = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: proMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
                status: 'upgraded',
            }),
        ]
        renderComponent(plans, true)

        expect(screen.getByText('Upgraded')).toBeInTheDocument()
        expect(screen.getByText('$60/month')).toBeInTheDocument()
    })

    it('renders Changed tag and strikethrough old price when plan changes at same amount', () => {
        const plans: ResolvedPlan[] = [
            makeResolved({
                productType: ProductType.Voice,
                plan: voicePlan4,
                currentPlan: voicePlan3,
                status: 'changed',
            }),
        ]
        renderComponent(plans, true)

        expect(screen.getByText('Changed')).toBeInTheDocument()
        expect(screen.getByText('$30/quarter')).toBeInTheDocument()
        expect(screen.getByText('$30/year')).toBeInTheDocument()
    })

    it('excludes trial plans from total calculation', () => {
        const plans: ResolvedPlan[] = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
            }),
            makeResolved({
                productType: ProductType.Voice,
                plan: voicePlan0,
                currentPlan: voicePlan0,
            }),
        ]
        renderComponent(plans)

        expect(screen.getAllByText('$60/month')).toHaveLength(2)
        expect(screen.getByText('Trial')).toBeInTheDocument()
    })

    it('disables Preview changes button when hasChanges is false and enables when true', () => {
        const plans: ResolvedPlan[] = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
            }),
        ]
        const { unmount } = renderComponent(plans, false)

        expect(
            screen.getByRole('button', { name: /preview changes/i }),
        ).toBeDisabled()

        unmount()

        renderComponent(plans, true)

        expect(
            screen.getByRole('button', { name: /preview changes/i }),
        ).toBeEnabled()
    })

    it('enables Preview changes button when subscription is canceled even without changes', () => {
        const canceledState = {
            ...payingWithCreditCard,
            subscription: {
                ...payingWithCreditCard.subscription,
                status: SubscriptionStatus.CANCELED,
            },
        }
        const plans: ResolvedPlan[] = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
            }),
        ]
        renderComponent(plans, false, canceledState)

        expect(
            screen.getByRole('button', { name: /preview changes/i }),
        ).toBeEnabled()
    })

    it('renders removed product with Removed tag and strikethrough price', () => {
        const plans: ResolvedPlan[] = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
            }),
            makeResolved({
                productType: ProductType.Voice,
                plan: null,
                currentPlan: voicePlan3,
                status: 'removed',
            }),
        ]
        renderComponent(plans, true)

        expect(screen.getByText('Removed')).toBeInTheDocument()
        expect(screen.getByText('Voice')).toBeInTheDocument()
        expect(screen.getByText('$30/quarter').closest('s')).not.toBeNull()
        expect(screen.queryByText('$30/year')).not.toBeInTheDocument()
    })

    it('renders strikethrough on the total row when total price changes', () => {
        const plans: ResolvedPlan[] = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: proMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
                status: 'upgraded',
            }),
        ]
        renderComponent(plans, true)

        const totalRow = screen.getByText('Total').closest('div')!
        expect(totalRow.querySelector('s')).toHaveTextContent('$60')
        expect(totalRow).toHaveTextContent('$360/month')
    })

    it('renders discount row and discounted total when subscription discounts are present', () => {
        const plans: ResolvedPlan[] = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: proMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
                status: 'upgraded',
            }),
        ]
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

        renderComponent(plans, true, payingWithCreditCard, discounts)

        expect(screen.getByText('Discount')).toBeInTheDocument()
        const discountAmount = screen.getByText('-$180/month')
        expect(discountAmount).toBeInTheDocument()
        expect(discountAmount.closest('s')).toBeNull()

        const totalRow = screen.getByText('Total').closest('div')!
        expect(totalRow.querySelector('s')).toHaveTextContent('$360')
        expect(totalRow).toHaveTextContent('$180/month')
    })

    it('hides payment section when subscription is trialing', () => {
        const trialingState = {
            ...payingWithCreditCard,
            subscription: {
                ...payingWithCreditCard.subscription,
                is_trialing: true,
            },
        }
        const plans: ResolvedPlan[] = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
            }),
        ]
        renderComponent(plans, false, trialingState)

        expect(
            screen.queryByText('Change Payment Method'),
        ).not.toBeInTheDocument()
    })

    it('hides payment section when subscription is canceled', () => {
        const canceledState = {
            ...payingWithCreditCard,
            subscription: {
                ...payingWithCreditCard.subscription,
                status: SubscriptionStatus.CANCELED,
            },
        }
        const plans: ResolvedPlan[] = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
            }),
        ]
        renderComponent(plans, false, canceledState)

        expect(
            screen.queryByText('Change Payment Method'),
        ).not.toBeInTheDocument()
    })

    it('renders credit card info and Change Payment Method link', async () => {
        const plans: ResolvedPlan[] = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
            }),
        ]
        renderComponent(plans)

        expect(await screen.findByText(/Visa/)).toBeInTheDocument()
        expect(screen.getByText('4321')).toBeInTheDocument()
        expect(screen.getByText('Change Payment Method')).toBeInTheDocument()
    })

    it('reflects the passed invoiceCadence in the total row', () => {
        const plans: ResolvedPlan[] = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
            }),
        ]
        renderComponent(
            plans,
            false,
            payingWithCreditCard,
            undefined,
            InvoiceCadence.Quarter,
        )

        const totalRow = screen.getByText('Total').closest('div')!
        expect(totalRow).toHaveTextContent('/quarter')
        expect(totalRow).not.toHaveTextContent('/month')
    })

    describe('with a yearly-invoiced-monthly plan (cadence != invoice_cadence)', () => {
        const yearlyInvoicedBillingState = {
            ...payingWithCreditCard,
            current_plans: {
                ...payingWithCreditCard.current_plans,
                helpdesk: basicYearlyInvoicedMonthlyHelpdeskPlan,
            },
        }

        it('renders invoice cadence (month) in the total row, not contract cadence (year)', () => {
            const plans: ResolvedPlan[] = [
                makeResolved({
                    productType: ProductType.Helpdesk,
                    plan: basicYearlyInvoicedMonthlyHelpdeskPlan,
                    currentPlan: basicYearlyInvoicedMonthlyHelpdeskPlan,
                }),
            ]
            renderComponent(
                plans,
                false,
                yearlyInvoicedBillingState,
                undefined,
                InvoiceCadence.Month,
            )

            const totalRow = screen.getByText('Total').closest('div')!
            expect(totalRow).toHaveTextContent('$50/month')
            expect(totalRow).not.toHaveTextContent('/year')
        })

        it('renders invoice cadence (month) in the product row price', () => {
            const plans: ResolvedPlan[] = [
                makeResolved({
                    productType: ProductType.Helpdesk,
                    plan: basicYearlyInvoicedMonthlyHelpdeskPlan,
                    currentPlan: basicYearlyInvoicedMonthlyHelpdeskPlan,
                }),
            ]
            renderComponent(
                plans,
                false,
                yearlyInvoicedBillingState,
                undefined,
                InvoiceCadence.Month,
            )

            expect(screen.getAllByText('$50/month')).toHaveLength(2)
        })
    })
})
