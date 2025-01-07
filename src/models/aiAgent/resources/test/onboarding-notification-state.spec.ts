import MockAdapter from 'axios-mock-adapter'

import {AiAgentOnboardingState} from 'models/aiAgent/types'

import {getOnboardingNotificationStateFixture} from 'pages/aiAgent/fixtures/onboardingNotificationState.fixture'

import authClient from '../../../../models/api/resources'
import {apiClient} from '../cloud-function-configuration'
import {
    createOnboardingNotificationState,
    getOnboardingNotificationState,
    upsertOnboardingNotificationState,
} from '../onboarding-notification-state'

describe('OnboardingNotificationState', () => {
    const accountDomain = 'test-account'
    const storeName = 'test-store'

    const mockedOnboardingNotificationState =
        getOnboardingNotificationStateFixture({shopName: storeName})

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

    describe('getOnboardingNotificationState', () => {
        it('should resolve with the correct data on success', async () => {
            const data = mockedOnboardingNotificationState

            apiServer
                .onGet(
                    `/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`
                )
                .reply(200, data)

            const res = await getOnboardingNotificationState(
                accountDomain,
                storeName
            )
            expect(res.data).toEqual(data)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onGet(
                    `/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`
                )
                .reply(400)

            await expect(
                getOnboardingNotificationState(accountDomain, storeName)
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('createOnboardingNotificationState', () => {
        it('should resolve with the correct data on success', async () => {
            const data = {
                ...mockedOnboardingNotificationState,
                onboardingState: AiAgentOnboardingState.VisitedAiAgent,
            }

            apiServer
                .onPost(
                    `/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`
                )
                .reply(201, data)

            const res = await createOnboardingNotificationState(
                accountDomain,
                storeName,
                {
                    shopName: storeName,
                    onboardingState: AiAgentOnboardingState.VisitedAiAgent,
                }
            )
            expect(res.data).toEqual(data)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPost(
                    `/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`
                )
                .reply(400)

            await expect(
                createOnboardingNotificationState(accountDomain, storeName, {
                    shopName: storeName,
                })
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('upsertOnboardingNotificationState', () => {
        it('should resolve with the correct data on success', async () => {
            const data = {
                ...mockedOnboardingNotificationState,
                onboardingState: AiAgentOnboardingState.VisitedAiAgent,
            }

            apiServer
                .onPut(
                    `/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`
                )
                .reply(200, data)

            const res = await upsertOnboardingNotificationState(
                accountDomain,
                storeName,
                {
                    ...mockedOnboardingNotificationState,
                    onboardingState: AiAgentOnboardingState.VisitedAiAgent,
                }
            )
            expect(res.data).toEqual(data)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPut(
                    `/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`
                )
                .reply(400)

            await expect(
                upsertOnboardingNotificationState(accountDomain, storeName, {
                    ...mockedOnboardingNotificationState,
                })
            ).rejects.toThrow('Request failed with status code 400')
        })
    })
})
