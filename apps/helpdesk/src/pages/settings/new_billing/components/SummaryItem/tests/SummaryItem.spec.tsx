import { render, screen } from '@testing-library/react'

import { basicMonthlyHelpdeskPlan } from 'fixtures/plans'
import { Cadence, ProductType } from 'models/billing/types'

import type { SummaryItemProps } from '../SummaryItem'
import { SummaryItem } from '../SummaryItem'

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

    it('displays $0 price and applies strikethrough when scheduledToCancelAt is set', () => {
        const { container } = render(
            <SummaryItem
                {...props}
                scheduledToCancelAt="2024-12-31T00:00:00Z"
            />,
        )

        expect(screen.getByText(/\$0/)).toBeInTheDocument()

        // Verify strikethrough class is applied to the price div
        const priceDiv = container.querySelector('.price')
        expect(priceDiv).toHaveClass('strikeThrough')
    })

    it('displays regular price when scheduledToCancelAt is null', () => {
        render(<SummaryItem {...props} scheduledToCancelAt={null} />)

        expect(screen.getByText(/\$60/)).toBeInTheDocument()
        expect(screen.queryByText(/\$0/)).not.toBeInTheDocument()
    })

    it('displays regular price when scheduledToCancelAt is undefined', () => {
        render(<SummaryItem {...props} />)

        expect(screen.getByText(/\$60/)).toBeInTheDocument()
        expect(screen.queryByText(/\$0/)).not.toBeInTheDocument()
    })

    it('displays Added tag when there is no current plan', () => {
        render(<SummaryItem {...props} currentPlan={undefined} />)

        expect(screen.getByText('Added')).toBeInTheDocument()
    })

    it('displays Upgraded tag when selected plan amount is higher than current plan', () => {
        render(
            <SummaryItem
                {...props}
                selectedPlans={{
                    ...props.selectedPlans,
                    helpdesk: {
                        isSelected: true,
                        plan: {
                            ...basicMonthlyHelpdeskPlan,
                            plan_id: 'different_plan_id',
                            amount: 90000,
                        },
                    },
                }}
            />,
        )

        expect(screen.getByText('Upgraded')).toBeInTheDocument()
    })

    it('displays Downgraded tag when selected plan amount is lower than current plan', () => {
        render(
            <SummaryItem
                {...props}
                currentPlan={{
                    ...basicMonthlyHelpdeskPlan,
                    plan_id: 'different_plan_id',
                    amount: 90000,
                }}
            />,
        )

        expect(screen.getByText('Downgraded')).toBeInTheDocument()
    })

    it('does not display a modification tag when plan is unchanged', () => {
        render(<SummaryItem {...props} />)

        expect(screen.queryByText('Added')).not.toBeInTheDocument()
        expect(screen.queryByText('Upgraded')).not.toBeInTheDocument()
        expect(screen.queryByText('Downgraded')).not.toBeInTheDocument()
    })

    it('does not display a modification tag when product is not selected', () => {
        render(
            <SummaryItem
                {...props}
                selectedPlans={{
                    ...props.selectedPlans,
                    helpdesk: {
                        isSelected: false,
                        plan: basicMonthlyHelpdeskPlan,
                    },
                }}
            />,
        )

        expect(screen.queryByText('Added')).not.toBeInTheDocument()
        expect(screen.queryByText('Upgraded')).not.toBeInTheDocument()
        expect(screen.queryByText('Downgraded')).not.toBeInTheDocument()
    })

    it('does not display a modification tag when selected plan is not in available plans', () => {
        render(
            <SummaryItem
                {...props}
                selectedPlans={{
                    ...props.selectedPlans,
                    helpdesk: {
                        isSelected: true,
                        plan: {
                            ...basicMonthlyHelpdeskPlan,
                            plan_id: 'unknown_plan_id',
                        },
                    },
                }}
            />,
        )

        expect(screen.queryByText('Added')).not.toBeInTheDocument()
        expect(screen.queryByText('Upgraded')).not.toBeInTheDocument()
        expect(screen.queryByText('Downgraded')).not.toBeInTheDocument()
    })

    it('does not display a modification tag when current plan is not in available plans', () => {
        render(
            <SummaryItem
                {...props}
                currentPlan={{
                    ...basicMonthlyHelpdeskPlan,
                    plan_id: 'unknown_current_plan_id',
                }}
                selectedPlans={{
                    ...props.selectedPlans,
                    helpdesk: {
                        isSelected: true,
                        plan: {
                            ...basicMonthlyHelpdeskPlan,
                            plan_id: 'different_plan_id',
                        },
                    },
                }}
            />,
        )

        expect(screen.queryByText('Added')).not.toBeInTheDocument()
        expect(screen.queryByText('Upgraded')).not.toBeInTheDocument()
        expect(screen.queryByText('Downgraded')).not.toBeInTheDocument()
    })
})
