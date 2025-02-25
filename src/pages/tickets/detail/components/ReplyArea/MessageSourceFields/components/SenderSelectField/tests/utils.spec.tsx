import { TicketMessageSourceType } from 'business/types/ticket'

import { getReconnectUrl } from '../utils'

describe('getReconnectUrl', () => {
    it('should return the reconnect URL based on integration type', () => {
        expect(getReconnectUrl(TicketMessageSourceType.Email)).toBe(
            '/app/settings/channels/email',
        )
        expect(getReconnectUrl(TicketMessageSourceType.EmailForward)).toBe(
            '/app/settings/channels/email',
        )
        expect(getReconnectUrl(TicketMessageSourceType.Phone)).toBe(
            '/app/settings/channels/phone',
        )
        expect(getReconnectUrl(TicketMessageSourceType.Sms)).toBe(
            '/app/settings/channels/sms',
        )
        expect(getReconnectUrl(TicketMessageSourceType.WhatsAppMessage)).toBe(
            '/app/settings/integrations/whatsapp/integrations',
        )
        expect(getReconnectUrl('invalid-channel')).toBe(
            '/app/settings/integrations/mine',
        )
    })
})
