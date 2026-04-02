import { screen } from '@testing-library/react'

import {
    basicMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
    voicePlan0,
} from 'fixtures/plans'
import { ProductType } from 'models/billing/types'
import { payingWithCreditCard } from 'pages/settings/new_billing/fixtures'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import { InternalSummary } from './InternalSummary'
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

function renderComponent(
    resolvedPlans: ResolvedPlan[],
    hasChanges = false,
    billingState = payingWithCreditCard,
) {
    return renderWithStoreAndQueryClientAndRouter(
        <InternalSummary
            billingState={billingState}
            resolvedPlans={resolvedPlans}
            hasChanges={hasChanges}
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
                currentPlan: voicePlan0,
                status: 'removed',
            }),
        ]
        renderComponent(plans, true)

        expect(screen.getByText('Removed')).toBeInTheDocument()
        expect(screen.getByText('Voice')).toBeInTheDocument()
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

    it('renders credit card info and Change Payment Method link', () => {
        const plans: ResolvedPlan[] = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                currentPlan: basicMonthlyHelpdeskPlan,
            }),
        ]
        renderComponent(plans)

        expect(screen.getByText(/Visa/)).toBeInTheDocument()
        expect(screen.getByText('4321')).toBeInTheDocument()
        expect(screen.getByText('Change Payment Method')).toBeInTheDocument()
    })
})
