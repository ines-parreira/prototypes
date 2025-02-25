import {
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
} from 'fixtures/productPrices'
import { Cadence } from 'models/billing/types'

import { setAutomationNotification, setHelpdeskNotification } from '../utils'

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

    it('renders new Automate subscription message', () => {
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
            'Woohoo! You now have access to <strong>Automate!</strong>',
        )
        expect(notification?.buttons?.[0].name).toBe('Set Up Automate')
    })

    it('renders upgrade message when new product amount is greater', () => {
        const oldPlan = basicMonthlyAutomationPlan // amount is 3000
        const newPlan = {
            ...basicMonthlyAutomationPlan,
            amount: 20000,
            num_quota_tickets: 350,
            name: 'New Automate Plan',
        }
        const periodEnd = '2023-06-30'
        const cadence = Cadence.Month

        const notification = setAutomationNotification({
            oldPlan: oldPlan,
            newPlan: newPlan,
            cadence: cadence,
            periodEnd,
            onClick,
            isFreeTrial: false,
        })

        expect(notification?.message).toContain(
            `Success! You now have <strong>${newPlan.num_quota_tickets} automated interactions per month</strong>`,
        )
        expect(notification?.buttons?.[0].name).toBe('Automate Settings')
    })

    it('renders downgrade message when new product amount is less', () => {
        const oldPlan = basicMonthlyAutomationPlan // amount is 3000
        const newPlan = {
            ...basicMonthlyAutomationPlan,
            amount: 1000,
            num_quota_tickets: 350,
            name: 'New Automate Plan',
        }
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
            `Your Automate subscription will change to <strong>${newPlan.num_quota_tickets} automated interactions/month</strong> on <strong>${periodEnd}</strong>.`,
        )
        expect(notification?.buttons?.length).toBe(0)
    })
})
