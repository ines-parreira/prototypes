import {
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    smsPlan1,
    voicePlan1,
} from 'fixtures/plans'
import { ProductType } from 'models/billing/types'

import { buildAutomateProductsToSubmit } from '../buildAutomateProductsToSubmit'

describe('buildAutomateProductsToSubmit', () => {
    it('uses the selected automation plan and keeps existing plans for the other products', () => {
        const result = buildAutomateProductsToSubmit(
            basicMonthlyAutomationPlan,
            {
                [ProductType.Helpdesk]: basicMonthlyHelpdeskPlan,
                [ProductType.Voice]: voicePlan1,
                [ProductType.SMS]: smsPlan1,
            },
        )

        expect(result).toEqual({
            [ProductType.Helpdesk]: basicMonthlyHelpdeskPlan.plan_id,
            [ProductType.Automation]: basicMonthlyAutomationPlan.plan_id,
            [ProductType.Voice]: voicePlan1.plan_id,
            [ProductType.SMS]: smsPlan1.plan_id,
        })
    })

    it('omits products without a current plan', () => {
        const result = buildAutomateProductsToSubmit(
            basicMonthlyAutomationPlan,
            { [ProductType.Helpdesk]: basicMonthlyHelpdeskPlan },
        )

        expect(result).toEqual({
            [ProductType.Helpdesk]: basicMonthlyHelpdeskPlan.plan_id,
            [ProductType.Automation]: basicMonthlyAutomationPlan.plan_id,
        })
    })

    it('omits the automation entry when no automation plan is selected', () => {
        const result = buildAutomateProductsToSubmit(undefined, {
            [ProductType.Helpdesk]: basicMonthlyHelpdeskPlan,
        })

        expect(result).toEqual({
            [ProductType.Helpdesk]: basicMonthlyHelpdeskPlan.plan_id,
        })
    })

    it('ignores the automation plan from currentPlansByProduct in favor of the selected one', () => {
        const otherAutomatePlan = {
            ...basicMonthlyAutomationPlan,
            plan_id: 'other-automation-plan',
        }

        const result = buildAutomateProductsToSubmit(otherAutomatePlan, {
            [ProductType.Helpdesk]: basicMonthlyHelpdeskPlan,
            [ProductType.Automation]: basicMonthlyAutomationPlan,
        })

        expect(result[ProductType.Automation]).toBe('other-automation-plan')
    })

    it('returns an empty object when nothing is provided', () => {
        expect(buildAutomateProductsToSubmit(undefined, undefined)).toEqual({})
    })
})
