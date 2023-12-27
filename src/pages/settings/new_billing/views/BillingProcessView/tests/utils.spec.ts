import {
    basicMonthlyAutomationPrice,
    basicMonthlyHelpdeskPrice,
} from 'fixtures/productPrices'
import {PlanInterval} from 'models/billing/types'
import {setHelpdeskNotification, setAutomationNotification} from '../utils'

describe('setHelpdeskNotification', () => {
    const onClick = jest.fn()

    it('renders upgrade message when new product amount is greater', () => {
        const oldProduct = basicMonthlyHelpdeskPrice // amount is 6000
        const newProduct = {
            ...basicMonthlyHelpdeskPrice,
            amount: 10000,
            name: 'New Helpdesk Plan',
        }
        const periodEnd = '2023-06-30'

        const notification = setHelpdeskNotification({
            oldProduct,
            newProduct,
            periodEnd,
            onClick,
            isFreeTrial: false,
        })

        expect(notification?.message).toContain(
            'Success! Helpdesk was upgraded to <strong>New Helpdesk Plan</strong>'
        )
        expect(notification?.buttons?.[0].name).toBe('Helpdesk Settings')
    })

    it('renders downgrade message when new product amount is smaller', () => {
        const oldProduct = basicMonthlyHelpdeskPrice // amount is 6000
        const newProduct = {
            ...basicMonthlyHelpdeskPrice,
            amount: 300,
            name: 'New Helpdesk Plan',
        }
        const periodEnd = '2023-06-30'

        const notification = setHelpdeskNotification({
            oldProduct,
            newProduct,
            periodEnd,
            onClick,
            isFreeTrial: false,
        })

        expect(notification?.message).toContain(
            'Your subscription will change to <strong>New Helpdesk Plan</strong> on <strong>2023-06-30</strong>.'
        )
        expect(notification?.buttons?.length).toBe(0)
    })
})

describe('setAutomationNotification', () => {
    const onClick = jest.fn()

    it('renders new Automation subscription message', () => {
        const oldProduct = undefined
        const newProduct = basicMonthlyAutomationPrice

        const periodEnd = '2023-06-30'
        const interval = PlanInterval.Month

        const notification = setAutomationNotification({
            oldProduct,
            newProduct,
            periodEnd,
            interval,
            onClick,
            isFreeTrial: false,
        })

        expect(notification?.message).toContain(
            'Woohoo! You now have access to <strong>Automation!</strong>'
        )
        expect(notification?.buttons?.[0].name).toBe('Set Up Automation')
    })

    it('renders upgrade message when new product amount is greater', () => {
        const oldProduct = basicMonthlyAutomationPrice // amount is 3000
        const newProduct = {
            ...basicMonthlyAutomationPrice,
            amount: 20000,
            num_quota_tickets: 350,
            name: 'New Automation Plan',
        }
        const periodEnd = '2023-06-30'
        const interval = PlanInterval.Month

        const notification = setAutomationNotification({
            oldProduct,
            newProduct,
            interval,
            periodEnd,
            onClick,
            isFreeTrial: false,
        })

        expect(notification?.message).toContain(
            `Success! You now have <strong>${newProduct.num_quota_tickets} automated interactions per month</strong>`
        )
        expect(notification?.buttons?.[0].name).toBe('Automation Settings')
    })

    it('renders downgrade message when new product amount is less', () => {
        const oldProduct = basicMonthlyAutomationPrice // amount is 3000
        const newProduct = {
            ...basicMonthlyAutomationPrice,
            amount: 1000,
            num_quota_tickets: 350,
            name: 'New Automation Plan',
        }
        const periodEnd = '2023-06-30'
        const interval = PlanInterval.Month

        const notification = setAutomationNotification({
            oldProduct,
            newProduct,
            periodEnd,
            interval,
            onClick,
            isFreeTrial: false,
        })

        expect(notification?.message).toContain(
            `Your Automation subscription will change to <strong>${newProduct.num_quota_tickets} automated interactions/month</strong> on <strong>${periodEnd}</strong>.`
        )
        expect(notification?.buttons?.length).toBe(0)
    })
})
