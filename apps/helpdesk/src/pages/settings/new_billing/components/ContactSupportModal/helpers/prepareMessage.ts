import { TicketPurpose } from 'state/billing/types'

export function prepareMessage(
    message: string,
    ticketPurpose: TicketPurpose,
    helpdeskPlanName: string,
    isInTrial: boolean,
): string {
    switch (ticketPurpose) {
        case TicketPurpose.ENTERPRISE:
            return (
                `Billing request: Enterprise subscription\n` +
                `Merchant Helpdesk plan: ${helpdeskPlanName}\n` +
                `Free trial: ${isInTrial ? 'true' : 'false'}\n` +
                `Request:\n` +
                message
            )
        case TicketPurpose.ERROR:
            return `Billing request: Billing error\n` + `Request:\n` + message
        case TicketPurpose.BILLING_FREQUENCY_DOWNGRADE:
            return (
                `Billing request: Subscription downgrade billing frequency\n` +
                `Request:\n` +
                message
            )
        case TicketPurpose.CONTACT_US:
            return (
                `Billing request: General request from Billing page\n` +
                `Request:\n` +
                message
            )
        default:
            const __: never = ticketPurpose
            throw new Error(`Unhandled ticket purpose: ${ticketPurpose}`)
    }
}
