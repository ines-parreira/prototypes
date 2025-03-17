import { TicketMessageSourceType } from 'business/types/ticket'

import { getReconnectUrlByChannel } from '../utils'

describe('getReconnectUrl', () => {
    it('should return the reconnect URL based on integration type', () => {
        expect(getReconnectUrlByChannel(TicketMessageSourceType.Email)).toBe(
            '/app/settings/channels/email',
        )
        expect(
            getReconnectUrlByChannel(TicketMessageSourceType.EmailForward),
        ).toBe('/app/settings/channels/email')
        expect(getReconnectUrlByChannel(TicketMessageSourceType.Phone)).toBe(
            '/app/settings/channels/phone',
        )
        expect(getReconnectUrlByChannel(TicketMessageSourceType.Sms)).toBe(
            '/app/settings/channels/sms',
        )
        expect(
            getReconnectUrlByChannel(TicketMessageSourceType.WhatsAppMessage),
        ).toBe('/app/settings/integrations/whatsapp/integrations')
        expect(getReconnectUrlByChannel('invalid-channel')).toBe(
            '/app/settings/integrations/mine',
        )
    })
})
