import { Cadence } from 'models/billing/types'
import { getCadenceName } from 'models/billing/utils'
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
        case TicketPurpose.MONTHLY_TO_YEARLY:
            return (
                `Billing request: Subscription change from ${getCadenceName(Cadence.Month)} to ${getCadenceName(Cadence.Year)} with Voice/SMS\n` +
                `Request:\n` +
                message
            )
        case TicketPurpose.YEARLY_TO_MONTHLY:
            return (
                `Billing request: Subscription change from ${getCadenceName(Cadence.Year)} to ${getCadenceName(Cadence.Month)} with Voice/SMS\n` +
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
