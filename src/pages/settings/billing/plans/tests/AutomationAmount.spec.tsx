import React, {ComponentProps} from 'react'
import {render, fireEvent} from '@testing-library/react'

import {starterPlan} from 'fixtures/subscriptionPlan'

import {PlanInterval} from '../../../../../models/billing/types'
import AutomationAmount from '../AutomationAmount'

describe('<AutomationAmount />', () => {
    const minProps: ComponentProps<typeof AutomationAmount> = {
        addOnAmount: 'Amount',
        plan: {
            id: 'planId',
        },
        isAutomationChecked: false,
        onAutomationChange: jest.fn(),
    }

    it('should render a string as amount', () => {
        const {container} = render(<AutomationAmount {...minProps} />)
        expect(container).toMatchSnapshot()
    })

    it('should render formatted numbers as amount', () => {
        const {container} = render(
            <AutomationAmount
                {...minProps}
                addOnAmount={45612}
                fullAddOnAmount={91224}
                plan={{
                    id: 'planId',
                    interval: PlanInterval.Month,
                    amount: 40000,
                    currency: 'usd',
                }}
            />
        )
        expect(container).toMatchSnapshot()
    })

    it('should render formatted amount number without discount', () => {
        const {container} = render(
            <AutomationAmount
                {...minProps}
                addOnAmount={45612}
                plan={{
                    id: 'planId',
                    interval: PlanInterval.Month,
                    amount: 40000,
                    currency: 'usd',
                }}
            />
        )
        expect(container).toMatchSnapshot()
    })

    it('should render with abbreviated plan interval', () => {
        const {container} = render(
            <AutomationAmount
                {...minProps}
                addOnAmount={45612}
                fullAddOnAmount={91224}
                plan={{
                    id: 'planId',
                    interval: PlanInterval.Month,
                    amount: 40000,
                    currency: 'usd',
                }}
                isIntervalAbbreviated
            />
        )
        expect(container).toMatchSnapshot()
    })

    it('should trigger callback for updating input value', () => {
        const {getByLabelText} = render(
            <AutomationAmount
                {...minProps}
                addOnAmount={45612}
                fullAddOnAmount={91224}
            />
        )

        fireEvent.click(getByLabelText(/Automation/))

        expect(minProps.onAutomationChange).toHaveBeenCalled()
    })

    it('should render not editable variant', () => {
        const {container} = render(
            <AutomationAmount
                {...minProps}
                addOnAmount={2000}
                fullAddOnAmount={4000}
                plan={{
                    id: 'planId',
                    interval: PlanInterval.Month,
                    amount: 40000,
                    currency: 'usd',
                }}
                editable={false}
            />
        )
        expect(container).toMatchSnapshot()
    })

    it("should render no addon when plan doesn't include one", () => {
        const {container} = render(
            <AutomationAmount
                {...minProps}
                addOnAmount={undefined}
                plan={starterPlan}
            />
        )

        expect(container).toMatchSnapshot()
    })
})
