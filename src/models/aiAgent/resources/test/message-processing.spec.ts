import MockAdapter from 'axios-mock-adapter'

import {CreatePlaygroundBody} from 'models/aiAgentPlayground/types'

import {customToneOfVoicePreviewFixture} from 'pages/aiAgent/fixtures/customToneOfVoicePreview.fixture'

import authClient from '../../../../models/api/resources'
import {
    apiClient,
    createBaseUrl,
    createContextAndGenerateCustomToneOfVoicePreview,
    createContextAndSubmitPlaygroundTicket,
} from '../message-processing'

describe('message-processing', () => {
    let authServer: MockAdapter
    let apiServer: MockAdapter

    beforeAll(() => {
        authServer = new MockAdapter(authClient)
        authServer.onPost(`/gorgias-apps/auth`).reply(200, {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Gfx6VO9tcxwk6xqx9yYzSfebfeakZp5JYIgP_edcw_A',
        })

        apiServer = new MockAdapter(apiClient)
    })

    afterAll(() => {
        authServer.reset()
        apiServer.reset()
    })
    describe('createBaseUrl', () => {
        it('creates the production url', () => {
            expect(createBaseUrl(true)).toBe('https://aiagent.gorgias.help')
        })

        it('creates the staging url', () => {
            expect(createBaseUrl(false, true)).toBe(
                'https://aiagent.gorgias.rehab'
            )
        })

        it('creates the development url', () => {
            expect(createBaseUrl(false, false)).toBe('http://localhost:9400')
        })
    })

    describe('createContextAndSubmitPlaygroundTicket', () => {
        it('should call submitAiAgentTicket with the correct body', async () => {
            apiServer.onPost('/api/interaction/start').reply(200)

            const body: CreatePlaygroundBody = {
                body_text: 'test',
                subject: '',
                domain: 'test-gorgias',
                customer_email: 'fake@mail.com',
                http_integration_id: 1,
                from_agent: false,
                messages: [],
                created_datetime: '123',
                channel: 'email',
                customer: {
                    email: 'fake@Mail.com',
                    name: 'Fake',
                    id: '0',
                    integrations: '{}',
                    firstname: 'Fake',
                    lastname: 'Fake',
                },
                account_id: 0,
                _playground_options: {
                    shopName: 'test-shop',
                },
            }

            await expect(
                createContextAndSubmitPlaygroundTicket(body)
            ).resolves.toEqual(expect.objectContaining({status: 200}))
        })
    })

    describe('createContextAndGenerateCustomToneOfVoicePreview', () => {
        it('should call generateCustomToneOfVoicePreview with the correct body', async () => {
            apiServer
                .onPost('/api/interaction/generate-custom-tov-preview')
                .reply(200)

            await expect(
                createContextAndGenerateCustomToneOfVoicePreview(
                    customToneOfVoicePreviewFixture
                )
            ).resolves.toEqual(expect.objectContaining({status: 200}))
        })
    })
})
