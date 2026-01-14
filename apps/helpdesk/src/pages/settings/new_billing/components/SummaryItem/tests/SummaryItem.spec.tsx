import { render, screen } from '@testing-library/react'

import { basicMonthlyHelpdeskPlan } from 'fixtures/plans'
import { Cadence, ProductType } from 'models/billing/types'

import type { SummaryItemProps } from '../SummaryItem'
import SummaryItem from '../SummaryItem'

describe('SummaryItem', () => {
    const props: SummaryItemProps = {
        productType: ProductType.Helpdesk,
        selectedPlans: {
            helpdesk: {
                isSelected: true,
                plan: basicMonthlyHelpdeskPlan,
            },
            automation: {
                isSelected: false,
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
        },
        cadence: Cadence.Month,
        currentPlan: basicMonthlyHelpdeskPlan,
        availablePlans: [
            basicMonthlyHelpdeskPlan,
            {
                ...basicMonthlyHelpdeskPlan,
                plan_id: 'different_plan_id',
                amount: 90000,
            },
        ],
    }

    it('returns null when selectedPlan.isSelected is false', () => {
        const { container } = render(
            <SummaryItem
                {...props}
                selectedPlans={{
                    helpdesk: { isSelected: false },
                    automation: { isSelected: false },
                    voice: { isSelected: false },
                    sms: { isSelected: false },
                    convert: { isSelected: false },
                }}
                currentPlan={undefined}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('displays correct details when selectedPlan.isSelected is true', () => {
        render(<SummaryItem {...props} />)

        expect(screen.getByText('Helpdesk')).toBeInTheDocument()
        expect(
            screen.getByText(`Basic - 300 tickets/${Cadence.Month}`),
        ).toBeInTheDocument()
    })

    it('does not display old plan when plan.plan_id matches selected plan', () => {
        render(
            <SummaryItem {...props} currentPlan={basicMonthlyHelpdeskPlan} />,
        )

        expect(screen.queryByLabelText('Old price')).not.toBeInTheDocument()
    })

    it('displays old plan when currentPlan.plan_id does not match selected plan', () => {
        render(
            <SummaryItem
                {...props}
                currentPlan={{
                    ...basicMonthlyHelpdeskPlan,
                    plan_id: 'different_plan_id',
                }}
            />,
        )

        // Replace '50' with the expected old price you want to display
        expect(screen.getByLabelText('Old price')).toBeInTheDocument()
    })
})
