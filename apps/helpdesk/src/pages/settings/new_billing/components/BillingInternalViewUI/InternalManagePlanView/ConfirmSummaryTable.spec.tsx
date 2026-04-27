import { payingWithCreditCard } from '@repo/billing/fixtures'
import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    basicMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
} from 'fixtures/plans'
import { ProductType } from 'models/billing/types'

import { ConfirmSummaryTable } from './ConfirmSummaryTable'
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
) {
    const props = {
        billingState: payingWithCreditCard,
        resolvedPlans,
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

    it('renders a dash before the balance resolves and the formatted amount after it resolves', () => {
        const { rerender } = renderComponent({ balanceDue: null })

        expect(screen.getByText('—')).toBeInTheDocument()

        rerender(
            <ConfirmSummaryTable
                billingState={payingWithCreditCard}
                resolvedPlans={resolvedPlans}
                balanceDue={25.5}
            />,
        )

        expect(screen.getByText('$25.50 due today')).toBeInTheDocument()
    })
})
