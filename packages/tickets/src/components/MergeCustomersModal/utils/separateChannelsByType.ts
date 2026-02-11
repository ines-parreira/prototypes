import type { TicketCustomerChannel } from '@gorgias/helpdesk-queries'

export function separateChannelsByType(channels: TicketCustomerChannel[]) {
    const emailChannels: TicketCustomerChannel[] = []
    const integrationsByType: Record<string, TicketCustomerChannel[]> = {}

    for (const channel of channels) {
        const type = channel.type
        if (type === 'email') {
            emailChannels.push(channel)
        } else if (type) {
            if (!integrationsByType[type]) {
                integrationsByType[type] = []
            }
            integrationsByType[type].push(channel)
        }
    }

    return { emailChannels, integrationsByType }
}
