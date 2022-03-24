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
        it.each([true, false])(
            'should resolve with AuthenticatorData on success',
            async (renewed) => {
                mockedServer
                    .onGet('/api/2fa/authenticator')
                    .reply(200, authenticatorDataFixture)

                const res = await fetchAuthenticatorData(renewed)

                expect(res).toStrictEqual(authenticatorDataFixture)
            }
        )

        it.each([true, false])(
            'should reject an error on fail',
            async (renewed) => {
                mockedServer
                    .onGet('/api/2fa/authenticator')
                    .reply(503, {message: 'error'})

                await expect(fetchAuthenticatorData(renewed)).rejects.toThrow(
                    new Error('Request failed with status code 503')
                )
            }
        )
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

    describe('deleteTwoFASecret', () => {
        it.each([undefined, 1])(
            'should resolve with 204 code and empty body on success',
            async (userId) => {
                mockedServer.onDelete('/api/2fa/secret').reply(204, {})

                await expect(deleteTwoFASecret(userId)).resolves.not.toThrow()
            }
        )

        it.each([undefined, 1])(
            'should reject an error on fail',
            async (userId) => {
                mockedServer
                    .onDelete('/api/2fa/secret')
                    .reply(503, {message: 'error'})

                await expect(deleteTwoFASecret(userId)).rejects.toThrow(
                    'Request failed with status code 503'
                )
            }
        )
    })

    describe('createRecoveryCodes', () => {
        it.each([true, false])(
            'should resolve with a list of RecoveryCode on success',
            async (renewed) => {
                mockedServer
                    .onPost('/api/2fa/recovery-codes')
                    .reply(200, recoveryCodesFixture)

                const res = await createRecoveryCodes(renewed)

                expect(res).toStrictEqual(recoveryCodesFixture)
            }
        )

        it.each([true, false])(
            'should reject an error on fail',
            async (renewed) => {
                mockedServer
                    .onPost('/api/2fa/recovery-codes')
                    .reply(503, {message: 'error'})

                await expect(createRecoveryCodes(renewed)).rejects.toThrow(
                    new Error('Request failed with status code 503')
                )
            }
        )
    })
})
