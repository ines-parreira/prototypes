import { payingWithCreditCard } from '@repo/billing/fixtures'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    basicMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
    voicePlan0,
} from 'fixtures/plans'
import { ProductType } from 'models/billing/types'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import { InternalConfirmModal } from './InternalConfirmModal'
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

const defaultPlans: ResolvedPlan[] = [
    makeResolved({
        productType: ProductType.Helpdesk,
        plan: proMonthlyHelpdeskPlan,
        currentPlan: basicMonthlyHelpdeskPlan,
        status: 'upgraded',
    }),
    makeResolved({
        productType: ProductType.Voice,
        plan: voicePlan0,
        currentPlan: voicePlan0,
    }),
]

function renderComponent(
    overrides: Partial<Parameters<typeof InternalConfirmModal>[0]> = {},
) {
    const props = {
        isOpen: true,
        onClose: jest.fn(),
        resolvedPlans: defaultPlans,
        billingState: payingWithCreditCard,
        onApply: jest.fn(),
        isSubmitting: false,
        ...overrides,
    }
    return {
        ...renderWithStoreAndQueryClientAndRouter(
            <InternalConfirmModal {...props} />,
        ),
        props,
    }
}

describe('InternalConfirmModal', () => {
    it('renders the modal with title and description', () => {
        renderComponent()

        expect(screen.getByText('Confirm changes')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Once you confirm, your changes will take effect immediately.',
            ),
        ).toBeInTheDocument()
    })

    it('renders product rows from resolved plans', () => {
        renderComponent()

        expect(screen.getByText('Helpdesk')).toBeInTheDocument()
        expect(screen.getByText('Upgraded')).toBeInTheDocument()
        expect(screen.getByText('Voice')).toBeInTheDocument()
    })

    it('renders total and balance due rows', () => {
        renderComponent()

        expect(screen.getByText('Total')).toBeInTheDocument()
        expect(screen.getByText('Balance due today')).toBeInTheDocument()
    })

    it('renders both action buttons', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /apply without invoice/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /apply with invoice/i }),
        ).toBeInTheDocument()
    })

    it('calls onApply(true) when "Apply with invoice" is clicked', async () => {
        const user = userEvent.setup()
        const { props } = renderComponent()

        await act(() =>
            user.click(
                screen.getByRole('button', { name: /apply with invoice/i }),
            ),
        )

        expect(props.onApply).toHaveBeenCalledWith(true)
    })

    it('calls onApply(false) when "Apply without invoice" is clicked', async () => {
        const user = userEvent.setup()
        const { props } = renderComponent()

        await act(() =>
            user.click(
                screen.getByRole('button', { name: /apply without invoice/i }),
            ),
        )

        expect(props.onApply).toHaveBeenCalledWith(false)
    })

    it('disables both buttons when isSubmitting is true', () => {
        renderComponent({ isSubmitting: true })

        expect(
            screen.getByRole('button', { name: /apply without invoice/i }),
        ).toBeDisabled()
        expect(
            screen.getByRole('button', { name: /apply with invoice/i }),
        ).toBeDisabled()
    })

    describe('when there is no upgrade (downgrade/removal only)', () => {
        const downgradeOnly: ResolvedPlan[] = [
            makeResolved({
                productType: ProductType.Helpdesk,
                plan: basicMonthlyHelpdeskPlan,
                currentPlan: proMonthlyHelpdeskPlan,
                status: 'downgraded',
            }),
            makeResolved({
                productType: ProductType.Voice,
                plan: voicePlan0,
                currentPlan: voicePlan0,
            }),
        ]

        it('renders a single "Apply" button instead of invoice options', () => {
            renderComponent({ resolvedPlans: downgradeOnly })

            expect(
                screen.getByRole('button', { name: /^Apply$/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', {
                    name: /apply with invoice/i,
                }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', {
                    name: /apply without invoice/i,
                }),
            ).not.toBeInTheDocument()
        })

        it('calls onApply(false) when "Apply" is clicked', async () => {
            const user = userEvent.setup()
            const { props } = renderComponent({ resolvedPlans: downgradeOnly })

            await act(() =>
                user.click(screen.getByRole('button', { name: /^Apply$/i })),
            )

            expect(props.onApply).toHaveBeenCalledWith(false)
        })

        it('shows loading state when isSubmitting is true', () => {
            renderComponent({
                resolvedPlans: downgradeOnly,
                isSubmitting: true,
            })

            const applyButton = screen.getByRole('button', {
                name: /Apply/i,
            })
            expect(applyButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    it('renders "Prices exclusive of sales tax" text', () => {
        renderComponent()

        expect(
            screen.getByText('Prices exclusive of sales tax'),
        ).toBeInTheDocument()
    })
})
