import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    basicMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
    voicePlan0,
} from 'fixtures/plans'
import type { Plan, PlanId } from 'models/billing/types'
import { ProductType } from 'models/billing/types'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import { ProductRow } from './ProductRow'
import type { ProductRowProps } from './ProductRow'

const helpdeskCatalog: Record<PlanId, Plan> = {
    [basicMonthlyHelpdeskPlan.plan_id]: basicMonthlyHelpdeskPlan,
    [proMonthlyHelpdeskPlan.plan_id]: proMonthlyHelpdeskPlan,
}

const defaultProps: ProductRowProps = {
    productType: ProductType.Helpdesk,
    plan: basicMonthlyHelpdeskPlan,
    catalogPlans: helpdeskCatalog,
    selectedPlanId: basicMonthlyHelpdeskPlan.plan_id,
    onPlanSelect: jest.fn(),
    isProductActive: true,
}

function renderComponent(overrides: Partial<ProductRowProps> = {}) {
    return renderWithStoreAndQueryClientAndRouter(
        <ProductRow {...defaultProps} {...overrides} />,
    )
}

describe('ProductRow', () => {
    it('renders product title, Active badge, and plan details for an active paid plan', () => {
        renderComponent()

        expect(screen.getByText('Helpdesk')).toBeInTheDocument()
        expect(screen.getByText('Active')).toBeInTheDocument()
        expect(screen.getByText('Basic')).toBeInTheDocument()
        expect(screen.getByText(/tickets\/month/)).toBeInTheDocument()
    })

    it('renders Trial badge for a trial plan', () => {
        renderComponent({
            productType: ProductType.Voice,
            plan: voicePlan0,
            catalogPlans: { [voicePlan0.plan_id]: voicePlan0 },
            selectedPlanId: voicePlan0.plan_id,
        })

        expect(screen.getByText('Trial')).toBeInTheDocument()
        expect(screen.queryByText('Active')).not.toBeInTheDocument()
    })

    it('hides status badge and select dropdown when product is inactive', () => {
        renderComponent({
            isProductActive: false,
            plan: null,
            selectedPlanId: undefined,
        })

        expect(screen.queryByText('Active')).not.toBeInTheDocument()
        expect(screen.queryByText('Trial')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Helpdesk plan')).not.toBeInTheDocument()
    })

    it('renders Active badge for an added product with a selected plan', () => {
        renderComponent({
            plan: null,
            isProductActive: true,
            selectedPlanId: proMonthlyHelpdeskPlan.plan_id,
        })

        expect(screen.getByText('Active')).toBeInTheDocument()
        expect(screen.queryByText('Inactive')).not.toBeInTheDocument()
    })

    it('renders action button and fires onAction on click', async () => {
        const user = userEvent.setup()
        const onAction = jest.fn()
        renderComponent({ actionLabel: 'Remove product', onAction })

        await user.click(
            screen.getByRole('button', { name: /remove product/i }),
        )

        expect(onAction).toHaveBeenCalledTimes(1)
    })

    it('does not render action button when actionLabel and onAction are not provided', () => {
        renderComponent({ actionLabel: undefined, onAction: undefined })

        expect(
            screen.queryByRole('button', { name: /remove product/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /add product/i }),
        ).not.toBeInTheDocument()
    })

    it('calls onPlanSelect with correct args when selecting a plan from dropdown', async () => {
        const user = userEvent.setup()
        const onPlanSelect = jest.fn()
        renderComponent({ onPlanSelect })

        await act(() =>
            user.click(screen.getByRole('button', { name: /300/i })),
        )

        await waitFor(() => {
            expect(
                screen.getByText(proMonthlyHelpdeskPlan.plan_id),
            ).toBeInTheDocument()
        })

        await act(() =>
            user.click(screen.getByText(proMonthlyHelpdeskPlan.plan_id)),
        )

        await act(() => user.keyboard('{Escape}'))

        expect(onPlanSelect).toHaveBeenCalledWith(
            ProductType.Helpdesk,
            proMonthlyHelpdeskPlan.plan_id,
        )
    })
})
