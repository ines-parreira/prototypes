import MockAdapter from 'axios-mock-adapter'

import {CreatePlaygroundBody} from 'models/aiAgentPlayground/types'

import authClient from '../../../../models/api/resources'
import {
    apiClient,
    createBaseUrl,
    createContextAndSubmitPlaygroundTicket,
} from '../message-processing'

describe('message-processing', () => {
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
        let apiServer: MockAdapter
        let authServer: MockAdapter

        beforeAll(() => {
            authServer = new MockAdapter(authClient)
            authServer.onPost(`/gorgias-apps/auth`).reply(200, {
                token: 'token',
            })

            apiServer = new MockAdapter(apiClient)
        })

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
})
