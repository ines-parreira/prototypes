import {TicketMessageSourceType} from 'business/types/ticket'

import normalizeAddress from '../normalizeAddress'

describe('normalizeAddress', () => {
    it('should normalize email addresses', () => {
        expect(normalizeAddress('test@gorgias.com')).toEqual('test@gorgias.com')
        expect(
            normalizeAddress('test@gorgias.com', TicketMessageSourceType.Email)
        ).toEqual('test@gorgias.com')
        expect(normalizeAddress('TEST@gorgias.com')).toEqual('test@gorgias.com')
        expect(normalizeAddress('TEST+123@gorgias.com')).toEqual(
            'test+123@gorgias.com'
        )
    })

    it('should normalize phone numbers', () => {
        expect(
            normalizeAddress('+1 213 373 4253', TicketMessageSourceType.Phone)
        ).toEqual('+12133734253')
        expect(
            normalizeAddress('+12133734253', TicketMessageSourceType.Phone)
        ).toEqual('+12133734253')
    })

    it('does not normalize phone number if sourceType is not specified', () => {
        expect(normalizeAddress('+1 213 373 4253')).toEqual('+1 213 373 4253')
    })
})
