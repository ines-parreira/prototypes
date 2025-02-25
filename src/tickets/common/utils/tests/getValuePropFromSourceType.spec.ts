import { TicketMessageSourceType } from 'business/types/ticket'

import getValuePropFromSourceType from '../getValuePropFromSourceType'

describe('getValuePropFromSourceType()', () => {
    it('returns "address" for TicketMessageSourceTypes', () => {
        expect(
            getValuePropFromSourceType(TicketMessageSourceType.Email),
        ).toEqual('address')
        expect(
            getValuePropFromSourceType(TicketMessageSourceType.Phone),
        ).toEqual('address')
    })

    it('returns null for TicketMessageSourceTypes.Api', () => {
        expect(getValuePropFromSourceType(TicketMessageSourceType.Api)).toEqual(
            null,
        )
    })

    it('returns address for all channel like inputs', () => {
        expect(getValuePropFromSourceType('tiktok-shop')).toEqual('address')
        expect(getValuePropFromSourceType('google-business-messages')).toEqual(
            'address',
        )
        expect(getValuePropFromSourceType('some-other-channel')).toEqual(
            'address',
        )
    })
})
