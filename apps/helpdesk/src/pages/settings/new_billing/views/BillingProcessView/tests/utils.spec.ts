import type { SelectedPlans } from '@repo/billing'

import {
    automationProduct,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    customHelpdeskPlan,
} from 'fixtures/plans'
import type { AutomatePlan } from 'models/billing/types'
import { Cadence, ProductType } from 'models/billing/types'

import {
    buildEnterpriseMessage,
    setAutomationNotification,
    setHelpdeskNotification,
} from '../utils'

describe('setHelpdeskNotification', () => {
    const onClick = jest.fn()

    it('renders upgrade message when new product amount is greater', () => {
        const oldPlan = basicMonthlyHelpdeskPlan // amount is 6000
        const newPlan = {
            ...basicMonthlyHelpdeskPlan,
            amount: 10000,
            name: 'New Helpdesk Plan',
        }
        const periodEnd = '2023-06-30'

        const notification = setHelpdeskNotification({
            oldPlan: oldPlan,
            newPlan: newPlan,
            periodEnd,
            onClick,
            isFreeTrial: false,
        })

        expect(notification?.message).toContain(
            'Success! Helpdesk was upgraded to <strong>New Helpdesk Plan</strong>',
        )
        expect(notification?.buttons?.[0].name).toBe('Helpdesk Settings')
    })

    it('renders downgrade message when new product amount is smaller', () => {
        const oldPlan = basicMonthlyHelpdeskPlan // amount is 6000
        const newPlan = {
            ...basicMonthlyHelpdeskPlan,
            amount: 300,
            name: 'New Helpdesk Plan',
        }
        const periodEnd = '2023-06-30'

        const notification = setHelpdeskNotification({
            oldPlan: oldPlan,
            newPlan: newPlan,
            periodEnd,
            onClick,
            isFreeTrial: false,
        })

        expect(notification?.message).toContain(
            'Your subscription will change to <strong>New Helpdesk Plan</strong> on <strong>2023-06-30</strong>.',
        )
        expect(notification?.buttons?.length).toBe(0)
    })
})

describe('setAutomationNotification', () => {
    const onClick = jest.fn()

    it('renders new AI Agent subscription message', () => {
        const oldPlan = undefined
        const newPlan = basicMonthlyAutomationPlan

        const periodEnd = '2023-06-30'
        const cadence = Cadence.Month

        const notification = setAutomationNotification({
            oldPlan: oldPlan,
            newPlan: newPlan,
            periodEnd,
            cadence: cadence,
            onClick,
            isFreeTrial: false,
        })

        expect(notification?.message).toContain(
            'Woohoo! You now have access to <strong>AI Agent!</strong>',
        )
        expect(notification?.buttons?.[0].name).toBe('Set Up AI Agent')
    })

    it.each(Object.values(Cadence))(
        'renders upgrade message when new product amount is greater [cadence: %s]',
        (cadence: Cadence) => {
            const oldPlan = automationProduct.prices.find(
                (plan: AutomatePlan) => plan.cadence === cadence,
            )
            expect(oldPlan).toBeDefined()
            if (oldPlan === undefined) {
                return
            }
            const newPlan = {
                ...oldPlan,
                amount: oldPlan.amount + 1,
                num_quota_tickets: 350,
                name: 'New AI Agent Plan',
            }
            const periodEnd = '2023-06-30'

            const notification = setAutomationNotification({
                oldPlan: oldPlan,
                newPlan: newPlan,
                cadence: cadence,
                periodEnd,
                onClick,
                isFreeTrial: false,
            })

            expect(notification?.message).toContain(
                `Success! You now have <strong>${newPlan.num_quota_tickets} automated interactions per ${newPlan.cadence}</strong>`,
            )
            expect(notification?.buttons?.[0].name).toBe('AI Agent Settings')
        },
    )

    it.each(Object.values(Cadence))(
        'renders downgrade message when new product amount is less [cadence: %s]',
        (cadence: Cadence) => {
            const oldPlan = automationProduct.prices.find(
                (plan: AutomatePlan) => plan.cadence === cadence,
            )
            expect(oldPlan).toBeDefined()
            if (oldPlan === undefined) {
                return
            }

            const newPlan = {
                ...oldPlan,
                amount: oldPlan.amount - 1,
                num_quota_tickets: 350,
                name: 'New AI Agent Plan',
            }
            const periodEnd = '2023-06-30'

            const notification = setAutomationNotification({
                oldPlan: oldPlan,
                newPlan: newPlan,
                periodEnd,
                cadence: cadence,
                onClick,
                isFreeTrial: false,
            })

            expect(notification?.message).toContain(
                `Your AI Agent subscription will change to <strong>${newPlan.num_quota_tickets} automated interactions/${newPlan.cadence}</strong> on <strong>${periodEnd}</strong>.`,
            )
            expect(notification?.buttons?.length).toBe(0)
        },
    )
})

describe('buildEnterpriseMessage', () => {
    const unselectedPlan = { isSelected: false } as const

    it('should include only selected products with their ticket counts', () => {
        const selectedPlans: SelectedPlans = {
            [ProductType.Helpdesk]: {
                plan: basicMonthlyHelpdeskPlan,
                isSelected: true,
            },
            [ProductType.Automation]: {
                plan: basicMonthlyAutomationPlan,
                isSelected: true,
            },
            [ProductType.Voice]: unselectedPlan,
            [ProductType.SMS]: unselectedPlan,
            [ProductType.Convert]: unselectedPlan,
        }

        const message = buildEnterpriseMessage(selectedPlans, Cadence.Month)

        expect(message).toContain('Helpdesk - 300 tickets/month')
        expect(message).toContain(
            'Automation - 30 automated interactions/month',
        )
        expect(message).not.toContain('Voice')
        expect(message).not.toContain('SMS')
        expect(message).not.toContain('Convert')
    })

    it('should append enterprise suffix for custom plans', () => {
        const selectedPlans: SelectedPlans = {
            [ProductType.Helpdesk]: {
                plan: customHelpdeskPlan,
                isSelected: true,
            },
            [ProductType.Automation]: unselectedPlan,
            [ProductType.Voice]: unselectedPlan,
            [ProductType.SMS]: unselectedPlan,
            [ProductType.Convert]: unselectedPlan,
        }

        const message = buildEnterpriseMessage(selectedPlans, Cadence.Month)

        expect(message).toContain(
            'Helpdesk - 10,000+ tickets/month (Enterprise)',
        )
    })
})
