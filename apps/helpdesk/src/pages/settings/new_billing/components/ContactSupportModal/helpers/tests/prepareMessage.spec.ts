import { TicketPurpose } from 'state/billing/types'

import { prepareMessage } from '../prepareMessage'

describe('prepareMessage', () => {
    describe('ENTERPRISE ticket purpose', () => {
        it('should format message for enterprise subscription with trial', () => {
            const message = 'I need help with my enterprise subscription'
            const ticketPurpose = TicketPurpose.ENTERPRISE
            const helpdeskPlanName = 'Enterprise Plan'
            const isInTrial = true

            const result = prepareMessage(
                message,
                ticketPurpose,
                helpdeskPlanName,
                isInTrial,
            )

            expect(result).toBe(
                'Billing request: Enterprise subscription\n' +
                    'Merchant Helpdesk plan: Enterprise Plan\n' +
                    'Free trial: true\n' +
                    'Request:\n' +
                    'I need help with my enterprise subscription',
            )
        })

        it('should format message for enterprise subscription without trial', () => {
            const message = 'I need help with my enterprise subscription'
            const ticketPurpose = TicketPurpose.ENTERPRISE
            const helpdeskPlanName = 'Enterprise Plan'
            const isInTrial = false

            const result = prepareMessage(
                message,
                ticketPurpose,
                helpdeskPlanName,
                isInTrial,
            )

            expect(result).toBe(
                'Billing request: Enterprise subscription\n' +
                    'Merchant Helpdesk plan: Enterprise Plan\n' +
                    'Free trial: false\n' +
                    'Request:\n' +
                    'I need help with my enterprise subscription',
            )
        })

        it('should handle empty helpdesk plan name', () => {
            const message = 'I need help with my enterprise subscription'
            const ticketPurpose = TicketPurpose.ENTERPRISE
            const helpdeskPlanName = ''
            const isInTrial = true

            const result = prepareMessage(
                message,
                ticketPurpose,
                helpdeskPlanName,
                isInTrial,
            )

            expect(result).toBe(
                'Billing request: Enterprise subscription\n' +
                    'Merchant Helpdesk plan: \n' +
                    'Free trial: true\n' +
                    'Request:\n' +
                    'I need help with my enterprise subscription',
            )
        })
    })

    describe('ERROR ticket purpose', () => {
        it('should format message for billing error', () => {
            const message = 'I am getting a billing error'
            const ticketPurpose = TicketPurpose.ERROR
            const helpdeskPlanName = 'Basic Plan'
            const isInTrial = false

            const result = prepareMessage(
                message,
                ticketPurpose,
                helpdeskPlanName,
                isInTrial,
            )

            expect(result).toBe(
                'Billing request: Billing error\n' +
                    'Request:\n' +
                    'I am getting a billing error',
            )
        })

        it('should format message for billing error with empty message', () => {
            const message = ''
            const ticketPurpose = TicketPurpose.ERROR
            const helpdeskPlanName = 'Basic Plan'
            const isInTrial = false

            const result = prepareMessage(
                message,
                ticketPurpose,
                helpdeskPlanName,
                isInTrial,
            )

            expect(result).toBe(
                'Billing request: Billing error\n' + 'Request:\n' + '',
            )
        })
    })

    describe('BILLING_FREQUENCY_DOWNGRADE ticket purpose', () => {
        it('should format message for monthly to yearly subscription change', () => {
            const message = 'I want to change my billing frequency'
            const ticketPurpose = TicketPurpose.BILLING_FREQUENCY_DOWNGRADE
            const helpdeskPlanName = 'Basic Plan'
            const isInTrial = false

            const result = prepareMessage(
                message,
                ticketPurpose,
                helpdeskPlanName,
                isInTrial,
            )

            expect(result).toBe(
                'Billing request: Subscription downgrade billing frequency\n' +
                    'Request:\n' +
                    'I want to change my billing frequency',
            )
        })
    })

    describe('CONTACT_US ticket purpose', () => {
        it('should format message for general contact us request', () => {
            const message = 'I have a general billing question'
            const ticketPurpose = TicketPurpose.CONTACT_US
            const helpdeskPlanName = 'Basic Plan'
            const isInTrial = false

            const result = prepareMessage(
                message,
                ticketPurpose,
                helpdeskPlanName,
                isInTrial,
            )

            expect(result).toBe(
                'Billing request: General request from Billing page\n' +
                    'Request:\n' +
                    'I have a general billing question',
            )
        })
    })

    describe('default case', () => {
        it('should raise an error for undefined ticket purpose', () => {
            const message = 'I have a question'
            const ticketPurpose = undefined as any
            const helpdeskPlanName = 'Basic Plan'
            const isInTrial = false

            expect(() =>
                prepareMessage(
                    message,
                    ticketPurpose,
                    helpdeskPlanName,
                    isInTrial,
                ),
            ).toThrow('Unhandled ticket purpose: undefined')
        })
    })

    describe('edge cases', () => {
        it('should handle multiline messages', () => {
            const message = 'Line 1\nLine 2\nLine 3'
            const ticketPurpose = TicketPurpose.CONTACT_US
            const helpdeskPlanName = 'Basic Plan'
            const isInTrial = false

            const result = prepareMessage(
                message,
                ticketPurpose,
                helpdeskPlanName,
                isInTrial,
            )

            expect(result).toBe(
                'Billing request: General request from Billing page\n' +
                    'Request:\n' +
                    'Line 1\nLine 2\nLine 3',
            )
        })

        it('should handle special characters in message', () => {
            const message = 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
            const ticketPurpose = TicketPurpose.CONTACT_US
            const helpdeskPlanName = 'Basic Plan'
            const isInTrial = false

            const result = prepareMessage(
                message,
                ticketPurpose,
                helpdeskPlanName,
                isInTrial,
            )

            expect(result).toBe(
                'Billing request: General request from Billing page\n' +
                    'Request:\n' +
                    'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
            )
        })

        it('should handle very long helpdesk plan names', () => {
            const message = 'Test message'
            const ticketPurpose = TicketPurpose.ENTERPRISE
            const helpdeskPlanName =
                'Very Long Enterprise Plan Name That Exceeds Normal Length'
            const isInTrial = true

            const result = prepareMessage(
                message,
                ticketPurpose,
                helpdeskPlanName,
                isInTrial,
            )

            expect(result).toBe(
                'Billing request: Enterprise subscription\n' +
                    'Merchant Helpdesk plan: Very Long Enterprise Plan Name That Exceeds Normal Length\n' +
                    'Free trial: true\n' +
                    'Request:\n' +
                    'Test message',
            )
        })
    })
})
