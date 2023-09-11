import MockAdapter from 'axios-mock-adapter'
import client from 'models/api/resources'

import {ticketVoiceCall} from 'fixtures/voiceCalls'
import {listTicketVoiceCalls} from '../resources'

const mockedServer = new MockAdapter(client)

describe('list whatsapp message template resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('listTicketVoiceCalls', () => {
        it('should resolve with a list of TicketVoiceCalls on success', async () => {
            mockedServer
                .onGet('/api/phone/voice-calls/', {params: {ticket_id: 123}})
                .reply(200, {data: [ticketVoiceCall]})
            const res = await listTicketVoiceCalls({ticket_id: 123})
            expect(res).toEqual({data: [ticketVoiceCall]})
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/phone/voice-calls/')
                .reply(404, {message: 'error'})
            return expect(listTicketVoiceCalls()).rejects.toEqual(
                new Error('Request failed with status code 404')
            )
        })
    })
})
