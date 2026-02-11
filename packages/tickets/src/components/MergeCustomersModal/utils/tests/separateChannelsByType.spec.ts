import { mockTicketCustomerChannel } from '@gorgias/helpdesk-mocks'

import { separateChannelsByType } from '../separateChannelsByType'

describe('separateChannelsByType', () => {
    it('should return empty channels by default', () => {
        const result = separateChannelsByType([])

        expect(result.emailChannels).toEqual([])
        expect(result.integrationsByType).toEqual({})
    })

    it('should separate email and integration channels', () => {
        const emailChannel = mockTicketCustomerChannel({
            id: 1,
            type: 'email',
            address: 'test@example.com',
            preferred: false,
        })
        const phoneChannel = mockTicketCustomerChannel({
            id: 2,
            type: 'phone',
            address: '+1234567890',
            preferred: false,
        })

        const result = separateChannelsByType([emailChannel, phoneChannel])

        expect(result.emailChannels).toEqual([emailChannel])
        expect(result.integrationsByType).toEqual({
            phone: [phoneChannel],
        })
    })

    it('should group multiple channels of the same integration type', () => {
        const phone1 = mockTicketCustomerChannel({
            id: 1,
            type: 'phone',
            address: '+1234567890',
            preferred: false,
        })
        const phone2 = mockTicketCustomerChannel({
            id: 2,
            type: 'phone',
            address: '+0987654321',
            preferred: false,
        })

        const result = separateChannelsByType([phone1, phone2])

        expect(result.emailChannels).toEqual([])
        expect(result.integrationsByType).toEqual({
            phone: [phone1, phone2],
        })
    })
})
