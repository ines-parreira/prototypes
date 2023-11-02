import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'

export default function isPhoneBasedSource(
    sourceType: TicketMessageSourceType | TicketChannel
): boolean {
    return [
        TicketMessageSourceType.Phone,
        TicketMessageSourceType.Sms,
        TicketMessageSourceType.WhatsAppMessage,
        TicketChannel.Aircall,
        TicketChannel.Phone,
        TicketChannel.Sms,
        TicketChannel.WhatsApp,
    ].includes(sourceType)
}
