import MockAdapter from 'axios-mock-adapter'

import {whatsAppMessageTemplates} from 'fixtures/whatsAppMessageTemplates'
import client from 'models/api/resources'

import {listWhatsAppMessageTemplates} from '../resources'

const mockedServer = new MockAdapter(client)

describe('list whatsapp message template resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('listWhatsAppMessageTemplates', () => {
        it('should resolve with a list of paginated WhatsAppMessageTemplates on success', async () => {
            mockedServer
                .onGet('/integrations/whatsapp/message-templates')
                .reply(200, {data: [whatsAppMessageTemplates]})
            const res = await listWhatsAppMessageTemplates()
            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/integrations/whatsapp/message-templates')
                .reply(404, {message: 'error'})
            return expect(listWhatsAppMessageTemplates()).rejects.toEqual(
                new Error('Request failed with status code 404')
            )
        })
    })
})
