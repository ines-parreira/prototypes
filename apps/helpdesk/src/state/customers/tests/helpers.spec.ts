import { fromJS } from 'immutable'

import { TicketChannel } from '../../../business/types/ticket'
import type { CustomerChannel } from '../../../models/customerChannel/types'
import * as helpers from '../helpers'

describe('customers helpers', () => {
    it('getDisplayName', () => {
        const name = 'Cedric'
        const email = 'cedric@gmail.com'
        const id = 1234

        expect(helpers.getDisplayName(undefined as any)).toBe(
            'Unknown customer',
        )
        expect(helpers.getDisplayName('' as any)).toBe('Unknown customer')
        expect(helpers.getDisplayName(name as any)).toBe(name)
        expect(helpers.getDisplayName({ name } as any)).toBe(name)
        expect(helpers.getDisplayName(fromJS({ name }))).toBe(name)
        expect(helpers.getDisplayName({ name, email } as any)).toBe(name)
        expect(helpers.getDisplayName({ email } as any)).toBe(email)
        expect(helpers.getDisplayName({ name: `  ${name}   ` } as any)).toBe(
            name,
        )
        expect(helpers.getDisplayName({ id } as any)).toBe(`Customer #${id}`)
        expect(helpers.getDisplayName({ name, email, id } as any)).toBe(name)
        expect(helpers.getDisplayName({ hello: 'world' } as any)).toBe(
            'Unknown customer',
        )
    })

    describe('mergeChannels()', () => {
        describe('email channels', () => {
            const channel1 = {
                address: 'address1@foo.bar',
                preferred: false,
                type: TicketChannel.Email,
            } as CustomerChannel
            const channel2 = {
                address: 'address2@foo.bar',
                preferred: false,
                type: TicketChannel.Email,
            } as CustomerChannel
            const sameChannel1 = {
                address: 'ADDRESS1@foo.bar',
                preferred: false,
                type: TicketChannel.Email,
            } as CustomerChannel

            it('should return all channels because emails are different', () => {
                expect(helpers.mergeChannels([channel1, channel2])).toEqual([
                    channel1,
                    channel2,
                ])
            })

            it('should return only one of the channels because emails are the same', () => {
                expect(helpers.mergeChannels([sameChannel1, channel1])).toEqual(
                    [sameChannel1],
                )
            })

            it('should return lowercase channel because emails are the same, lowercase channel received first', () => {
                expect(helpers.mergeChannels([channel1, sameChannel1])).toEqual(
                    [channel1],
                )
            })
        })

        describe('whatsapp and phone channels', () => {
            const channel1 = {
                address: 'address1',
                preferred: false,
                type: TicketChannel.WhatsApp,
            } as CustomerChannel
            const channel2 = {
                address: 'address2',
                preferred: false,
                type: TicketChannel.Phone,
            } as CustomerChannel
            const sameAddressDifferentChannel = {
                address: 'address1',
                preferred: false,
                type: TicketChannel.Phone,
            } as CustomerChannel

            it('should return all channels because phone numbers are different', () => {
                expect(helpers.mergeChannels([channel1, channel2])).toEqual([
                    channel1,
                    channel2,
                ])
            })

            it(`should return both channels because phone numbers are the same but channels are different`, () => {
                expect(
                    helpers.mergeChannels([
                        channel1,
                        sameAddressDifferentChannel,
                    ]),
                ).toEqual([channel1, sameAddressDifferentChannel])
            })
        })
    })
})
