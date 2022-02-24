import MockAdapter from 'axios-mock-adapter'

import {authenticatorData as authenticatorDataFixture} from '../../../fixtures/authenticatorData'
import client from '../../api/resources'
import {fetchAuthenticatorData} from '../resources'

const mockedServer = new MockAdapter(client)

describe('twoFactorAuthentication resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('fetchAuthenticatorData', () => {
        it('should resolve with AuthenticatorData on success', async () => {
            mockedServer
                .onGet('/api/2fa/authenticator')
                .reply(200, authenticatorDataFixture)
            const res = await fetchAuthenticatorData()
            expect(res).toStrictEqual(authenticatorDataFixture)
        })
        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/2fa/authenticator')
                .reply(503, {message: 'error'})
            return expect(fetchAuthenticatorData()).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })
})
