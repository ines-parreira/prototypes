import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'

import { getToken } from '../api'

jest.mock('@repo/logging')
jest.mock('@twilio/voice-sdk')

const mockedServer = new MockAdapter(client)

describe('getToken', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    it('should resolve with a JWT on success', async () => {
        mockedServer.onGet('/integrations/phone/token').reply(200, {
            token: 'valid-jwt',
        })
        const token = await getToken()
        expect(token).toEqual('valid-jwt')
    })

    it('should throw an error on fail', () => {
        mockedServer
            .onGet('/integrations/phone/token')
            .reply(503, { message: 'error' })
        return expect(getToken()).rejects.toEqual(
            new Error('Request failed with status code 503'),
        )
    })
})
