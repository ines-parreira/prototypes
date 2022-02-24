import MockAdapter from 'axios-mock-adapter'

import {AxiosError} from 'axios'
import {authenticatorData as authenticatorDataFixture} from '../../../fixtures/authenticatorData'
import client from '../../api/resources'
import {fetchAuthenticatorData, validateVerificationCode} from '../resources'

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

    describe('validateVerificationCode', () => {
        it('should resolve with a valid verification code', async () => {
            const code = '123456'

            mockedServer
                .onGet(`/api/2fa/verification-code/${code}`)
                .reply(200, {})

            await validateVerificationCode(code)
        })
        it('should resolve with an invalid verification code', async () => {
            const code = '123456'

            mockedServer
                .onGet(`/api/2fa/verification-code/${code}`)
                .reply(400, {
                    error: {msg: 'foo error'},
                })
            try {
                await validateVerificationCode(code)
            } catch (error) {
                const {response} = error as AxiosError<{error: {msg: string}}>
                if (response) {
                    expect(response.data.error.msg).toEqual('foo error')
                }
            }
        })
        it('should reject an error on fail', () => {
            const code = '123456'

            mockedServer
                .onGet(`/api/2fa/verification-code/${code}`)
                .reply(503, {message: 'error'})

            return expect(validateVerificationCode(code)).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })
})
