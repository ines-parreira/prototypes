import MockAdapter from 'axios-mock-adapter'

import {AxiosError} from 'axios'
import {authenticatorData as authenticatorDataFixture} from '../../../fixtures/authenticatorData'
import {recoveryCodes as recoveryCodesFixture} from '../../../fixtures/recoveryCodes'
import client from '../../api/resources'
import {
    createRecoveryCodes,
    deleteTwoFASecret,
    fetchAuthenticatorData,
    saveTwoFASecret,
    validateVerificationCode,
} from '../resources'

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

        it('should reject an error on fail', async () => {
            mockedServer
                .onGet('/api/2fa/authenticator')
                .reply(503, {message: 'error'})

            await expect(fetchAuthenticatorData()).rejects.toThrow(
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

            await expect(validateVerificationCode(code)).resolves.not.toThrow()
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

        it('should reject an error on fail', async () => {
            const code = '123456'

            mockedServer
                .onGet(`/api/2fa/verification-code/${code}`)
                .reply(503, {message: 'error'})

            await expect(validateVerificationCode(code)).rejects.toThrow(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('saveTwoFASecret', () => {
        it('should resolve with 201 code and empty body on success', async () => {
            mockedServer.onPost('/api/2fa/secret').reply(201, {})

            await expect(saveTwoFASecret()).resolves.not.toThrow()
        })

        it('should reject an error on fail', async () => {
            mockedServer
                .onPost('/api/2fa/secret')
                .reply(503, {message: 'error'})

            await expect(saveTwoFASecret()).rejects.toThrow(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('createRecoveryCodes', () => {
        it('should resolve with a list of RecoveryCode on success', async () => {
            mockedServer
                .onPost('/api/2fa/recovery-codes')
                .reply(200, recoveryCodesFixture)

            const res = await createRecoveryCodes()

            expect(res).toStrictEqual(recoveryCodesFixture)
        })

        it('should reject an error on fail', async () => {
            mockedServer
                .onPost('/api/2fa/recovery-codes')
                .reply(503, {message: 'error'})

            await expect(createRecoveryCodes()).rejects.toThrow(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('deleteTwoFASecret', () => {
        it('should resolve with 204 code and empty body on success', async () => {
            mockedServer.onDelete('/api/2fa/secret').reply(204, {})

            await expect(deleteTwoFASecret()).resolves.not.toThrow()
        })

        it('should reject an error on fail', async () => {
            mockedServer
                .onDelete('/api/2fa/secret')
                .reply(503, {message: 'error'})

            await expect(deleteTwoFASecret()).rejects.toThrow(
                'Request failed with status code 503'
            )
        })
    })
})
