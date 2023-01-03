import MockAdapter from 'axios-mock-adapter'

import {getGorgiasChatProtectedApiClient} from '../../../rest_api/gorgias_chat_protected_api/client'
import {Client} from '../../../rest_api/gorgias_chat_protected_api/client.generated'
import {
    getTranslations,
    getApplicationTexts,
    updateApplicationTexts,
} from '../actions/gorgias-chat.actions'
import client from '../../../models/api/resources'
import {
    Texts,
    Translations,
} from '../../../rest_api/gorgias_chat_protected_api/types'

describe('gorgias-chat.actions', () => {
    let chatClient: Client
    let authServer: MockAdapter

    beforeAll(async () => {
        chatClient = await getGorgiasChatProtectedApiClient()
        authServer = new MockAdapter(client)
        authServer.onPost(`/gorgias-apps/auth`).reply(200, {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Gfx6VO9tcxwk6xqx9yYzSfebfeakZp5JYIgP_edcw_A',
        })
    })
    afterAll(() => {
        authServer.reset()
    })

    describe('"getTranslations"', () => {
        describe('when it works', () => {
            const okApiResponse: Translations = {
                texts: {text: 'value '},
                sspTexts: {text: 'value '},
            }
            const lang = 'Es-es'
            let mockServer: MockAdapter

            beforeAll(() => {
                mockServer = new MockAdapter(chatClient)

                mockServer.onGet('/translations').reply((config) => {
                    const params: Record<string, string> = config.params
                    if (params.lang === lang) {
                        return [200, okApiResponse]
                    }
                    return [404]
                })
            })
            afterAll(() => {
                mockServer.reset()
            })

            it('it should return correct data', async () => {
                const response = await getTranslations(lang)
                expect(JSON.stringify(response)).toBe(
                    JSON.stringify(okApiResponse)
                )
            })
        })

        describe('when it fails', () => {
            let mockServer: MockAdapter
            const lang = 'Es-es'

            beforeAll(() => {
                mockServer = new MockAdapter(chatClient)

                mockServer.onGet('/translations').reply((config) => {
                    const params: Record<string, string> = config.params
                    if (params.lang === lang) {
                        return [500, {error: 'Error'}]
                    }
                    return [404]
                })
            })
            afterAll(() => {
                mockServer.reset()
            })

            it('it should throw error', async () => {
                await expect(getTranslations(lang)).rejects.toThrow()
            })
        })
    })

    describe('"getApplicationTexts"', () => {
        describe('when it works', () => {
            const okApiResponse: Texts = {
                texts: {text: 'value '},
                sspTexts: {text: 'value '},
            }
            const applicationId = '1'
            let mockServer: MockAdapter

            beforeAll(() => {
                mockServer = new MockAdapter(chatClient)

                mockServer
                    .onGet(`/applications/${applicationId}/texts`)
                    .reply(200, okApiResponse)
            })
            afterAll(() => {
                mockServer.reset()
            })

            it('it should return correct data', async () => {
                const response = await getApplicationTexts(applicationId)
                expect(JSON.stringify(response)).toBe(
                    JSON.stringify(okApiResponse)
                )
            })
        })

        describe('when it fails', () => {
            const applicationId = '1'
            let mockServer: MockAdapter

            beforeAll(() => {
                mockServer = new MockAdapter(chatClient)

                mockServer
                    .onGet(`/applications/${applicationId}/texts`)
                    .reply(500, {error: 'Error'})
            })
            afterAll(() => {
                mockServer.reset()
            })

            it('it should throw error', async () => {
                await expect(
                    getApplicationTexts(applicationId)
                ).rejects.toThrow()
            })
        })
    })

    describe('"updateApplicationTexts"', () => {
        describe('when it works', () => {
            const applicationId = '1'
            const data: Texts = {
                texts: {texKey: 'TextValue'},
                sspTexts: {key: 'value'},
            }
            let mockServer: MockAdapter

            beforeAll(() => {
                mockServer = new MockAdapter(chatClient)

                mockServer
                    .onPut(`/applications/${applicationId}/texts`)
                    .reply((config) => {
                        const params = config.data

                        if (
                            JSON.stringify(JSON.parse(params)) ===
                            JSON.stringify(data)
                        ) {
                            return [200]
                        }

                        return [404]
                    })
            })
            afterAll(() => {
                mockServer.reset()
            })

            it('it should not throw an error', async () => {
                await updateApplicationTexts(applicationId, data)
            })
        })

        describe('when it fails', () => {
            const applicationId = '1'
            const data: Texts = {
                texts: {texKey: 'TextValue'},
                sspTexts: {key: 'value'},
            }
            let mockServer: MockAdapter

            beforeAll(() => {
                mockServer = new MockAdapter(chatClient)

                mockServer
                    .onPut(`/applications/${applicationId}/texts`)
                    .reply((config) => {
                        const params = config.data

                        if (
                            JSON.stringify(JSON.parse(params)) ===
                            JSON.stringify(data)
                        ) {
                            return [500, {error: 'Error'}]
                        }

                        return [404]
                    })
            })
            afterAll(() => {
                mockServer.reset()
            })

            it('it should throw error', async () => {
                await expect(
                    updateApplicationTexts(applicationId, data)
                ).rejects.toThrow()
            })
        })
    })
})
