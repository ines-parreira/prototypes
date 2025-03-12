import MockAdapter from 'axios-mock-adapter'

import { AiAgentOnboardingState } from 'models/aiAgent/types'
import authClient from 'models/api/resources'
import { HelpCenter } from 'models/helpCenter/types'
import { getAccountConfigurationWithHttpIntegrationFixture } from 'pages/aiAgent/fixtures/accountConfiguration.fixture'
import { getOnboardingNotificationStateFixture } from 'pages/aiAgent/fixtures/onboardingNotificationState.fixture'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'

import {
    apiClient,
    createAccountConfiguration,
    createOnboardingData,
    createOnboardingNotificationState,
    createStoreConfiguration,
    createStoreSnippetHelpCenter,
    createWelcomePageAcknowledged,
    getAccountConfiguration,
    getOnboardingData,
    getOnboardingDataByShopName,
    getOnboardingNotificationState,
    getStoreConfiguration,
    getWelcomePageAcknowledged,
    updateOnboardingData,
    upsertAccountConfiguration,
    upsertOnboardingNotificationState,
    upsertStoreConfiguration,
    upsertStoresConfiguration,
} from '../configuration'

describe('Configuration', () => {
    const accountDomain = 'acme'
    const storeName = 'myStore'

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

    describe('getAccountConfiguration', () => {
        it('should resolve with the correct data on success', async () => {
            const accountConfiguration =
                getAccountConfigurationWithHttpIntegrationFixture()

            apiServer
                .onGet(`/config/accounts/${accountDomain}/configuration`)
                .reply(200, accountConfiguration)

            const res = await getAccountConfiguration(accountDomain)
            expect(res.data).toEqual(accountConfiguration)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onGet(`/config/accounts/${accountDomain}/configuration`)
                .reply(400)

            await expect(
                getAccountConfiguration(accountDomain),
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('createAccountConfiguration', () => {
        const accountConfiguration =
            getAccountConfigurationWithHttpIntegrationFixture()

        const createAccountConfigurationPayload = {
            ...accountConfiguration,
            storeNames: [],
            helpdeskOAuth: null,
        }

        const accountDomain = accountConfiguration.gorgiasDomain

        it('should resolve with the correct data on success', async () => {
            apiServer
                .onPost(`/config/accounts/${accountDomain}/configuration`)
                .reply(201, accountConfiguration)

            const res = await createAccountConfiguration(
                createAccountConfigurationPayload,
            )
            expect(res.data).toEqual(accountConfiguration)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPost(`/config/accounts/${accountDomain}/configuration`)
                .reply(400)

            await expect(
                createAccountConfiguration(createAccountConfigurationPayload),
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('upsertAccountConfiguration', () => {
        const accountConfiguration =
            getAccountConfigurationWithHttpIntegrationFixture()

        const accountDomain = accountConfiguration.gorgiasDomain

        it('should resolve with the correct data on success', async () => {
            apiServer
                .onPut(`/config/accounts/${accountDomain}/configuration`)
                .reply(200, accountConfiguration)

            const res = await upsertAccountConfiguration(accountConfiguration)
            expect(res.data).toEqual(accountConfiguration)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPut(`/config/accounts/${accountDomain}/configuration`)
                .reply(400)

            await expect(
                upsertAccountConfiguration(accountConfiguration),
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('getStoreConfiguration', () => {
        const accountDomain = 'myAccountDomain'
        const storeConfiguration = getStoreConfigurationFixture()
        const { storeName } = storeConfiguration

        it('should resolve with the correct data on success', async () => {
            apiServer
                .onGet(
                    `/config/accounts/${accountDomain}/stores/${storeName}/configuration?with_wizard=false`,
                )
                .reply(200, storeConfiguration)

            const res = await getStoreConfiguration({
                accountDomain,
                storeName,
            })
            expect(res.data).toEqual(storeConfiguration)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onGet(
                    `/config/accounts/${accountDomain}/stores/${storeName}/configuration?with_wizard=false`,
                )
                .reply(400)

            await expect(
                getStoreConfiguration({ accountDomain, storeName }),
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('createStoreConfiguration', () => {
        const accountDomain = 'myAccountDomain'
        const storeConfiguration = getStoreConfigurationFixture()
        const { storeName } = storeConfiguration

        it('should resolve with the correct data on success', async () => {
            apiServer
                .onPost(
                    `/config/accounts/${accountDomain}/stores/${storeName}/configuration`,
                )
                .reply(201, storeConfiguration)

            const res = await createStoreConfiguration(
                accountDomain,
                storeConfiguration,
            )
            expect(res.data).toEqual(storeConfiguration)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPost(
                    `/config/accounts/${accountDomain}/stores/${storeName}/configuration`,
                )
                .reply(400)

            await expect(
                createStoreConfiguration(accountDomain, storeConfiguration),
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('upsertStoreConfiguration', () => {
        const accountDomain = 'myAccountDomain'
        const storeConfiguration = getStoreConfigurationFixture()
        const { storeName } = storeConfiguration

        it('should resolve with the correct data on success', async () => {
            apiServer
                .onPut(
                    `/config/accounts/${accountDomain}/stores/${storeName}/configuration`,
                )
                .reply(200, storeConfiguration)

            const res = await upsertStoreConfiguration(
                accountDomain,
                storeConfiguration,
            )
            expect(res.data).toEqual(storeConfiguration)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPut(
                    `/config/accounts/${accountDomain}/stores/${storeName}/configuration`,
                )
                .reply(400)

            await expect(
                upsertStoreConfiguration(accountDomain, storeConfiguration),
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('upsertStoresConfiguration', () => {
        const accountDomain = 'myAccountDomain'
        const storeConfiguration1 = getStoreConfigurationFixture({
            storeName: 'store1',
        })
        const storeConfiguration2 = getStoreConfigurationFixture({
            storeName: 'store2',
        })
        const { storeName: storeName1 } = storeConfiguration1
        const { storeName: storeName2 } = storeConfiguration2

        it('should resolve with the correct data on success', async () => {
            apiServer
                .onPut(
                    `/config/accounts/${accountDomain}/stores/${storeName1}/configuration`,
                )
                .reply(200, storeConfiguration1)
            apiServer
                .onPut(
                    `/config/accounts/${accountDomain}/stores/${storeName2}/configuration`,
                )
                .reply(200, storeConfiguration2)

            const res = await upsertStoresConfiguration(accountDomain, [
                storeConfiguration1,
                storeConfiguration2,
            ])
            expect(res.map((it) => it.data)).toEqual([
                storeConfiguration1,
                storeConfiguration2,
            ])
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPut(
                    `/config/accounts/${accountDomain}/stores/${storeName1}/configuration`,
                )
                .reply(400, storeConfiguration1)
            apiServer
                .onPut(
                    `/config/accounts/${accountDomain}/stores/${storeName2}/configuration`,
                )
                .reply(200, storeConfiguration2)

            await expect(
                upsertStoresConfiguration(accountDomain, [
                    storeConfiguration1,
                    storeConfiguration2,
                ]),
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('createStoreSnippetHelpCenter', () => {
        const accountDomain = 'myAccountDomain'
        const storeName = 'myStore'
        const helpCenter: HelpCenter = getSingleHelpCenterResponseFixture

        it('should resolve with the correct data on success', async () => {
            apiServer
                .onPost(
                    `/config/accounts/${accountDomain}/stores/${storeName}/snippet`,
                )
                .reply(200, helpCenter)

            const res = await createStoreSnippetHelpCenter(
                accountDomain,
                storeName,
            )
            expect(res.data).toEqual(helpCenter)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPost(
                    `/config/accounts/${accountDomain}/stores/${storeName}/snippet`,
                )
                .reply(400)

            await expect(
                createStoreSnippetHelpCenter(accountDomain, storeName),
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('getWelcomePageAcknowledged', () => {
        it('should resolve with the correct data on success', async () => {
            const data = { acknowledged: false }

            apiServer
                .onGet(
                    `/config/accounts/${accountDomain}/stores/${storeName}/welcome-page`,
                )
                .reply(200, data)

            const res = await getWelcomePageAcknowledged(
                accountDomain,
                storeName,
            )
            expect(res.data).toEqual(data)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onGet(
                    `/config/accounts/${accountDomain}/stores/${storeName}/welcome-page`,
                )
                .reply(400)

            await expect(
                getWelcomePageAcknowledged(accountDomain, storeName),
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('createWelcomePageAcknowledged', () => {
        it('should resolve with the correct data on success', async () => {
            const data = { acknowledged: true }

            apiServer
                .onPost(
                    `/config/accounts/${accountDomain}/stores/${storeName}/welcome-page`,
                )
                .reply(200, data)

            const res = await createWelcomePageAcknowledged(
                accountDomain,
                storeName,
            )
            expect(res.data).toEqual(data)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPost(
                    `/config/accounts/${accountDomain}/stores/${storeName}/welcome-page`,
                )
                .reply(500)

            await expect(
                createWelcomePageAcknowledged(accountDomain, storeName),
            ).rejects.toThrow('Request failed with status code 500')
        })
    })

    describe('getOnboardingNotificationState', () => {
        const mockedOnboardingNotificationState =
            getOnboardingNotificationStateFixture({ shopName: storeName })

        it('should resolve with the correct data on success', async () => {
            const data = mockedOnboardingNotificationState

            apiServer
                .onGet(
                    `/config/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`,
                )
                .reply(200, data)

            const res = await getOnboardingNotificationState(
                accountDomain,
                storeName,
            )
            expect(res.data).toEqual(data)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onGet(
                    `/config/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`,
                )
                .reply(400)

            await expect(
                getOnboardingNotificationState(accountDomain, storeName),
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('createOnboardingNotificationState', () => {
        const mockedOnboardingNotificationState =
            getOnboardingNotificationStateFixture({ shopName: storeName })

        it('should resolve with the correct data on success', async () => {
            const data = {
                ...mockedOnboardingNotificationState,
                onboardingState: AiAgentOnboardingState.VisitedAiAgent,
            }

            apiServer
                .onPost(
                    `/config/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`,
                )
                .reply(201, data)

            const res = await createOnboardingNotificationState(
                accountDomain,
                storeName,
                {
                    shopName: storeName,
                    onboardingState: AiAgentOnboardingState.VisitedAiAgent,
                },
            )
            expect(res.data).toEqual(data)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPost(
                    `/config/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`,
                )
                .reply(400)

            await expect(
                createOnboardingNotificationState(accountDomain, storeName, {
                    shopName: storeName,
                }),
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('upsertOnboardingNotificationState', () => {
        const mockedOnboardingNotificationState =
            getOnboardingNotificationStateFixture({ shopName: storeName })

        it('should resolve with the correct data on success', async () => {
            const data = {
                ...mockedOnboardingNotificationState,
                onboardingState: AiAgentOnboardingState.VisitedAiAgent,
            }

            apiServer
                .onPut(
                    `/config/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`,
                )
                .reply(200, data)

            const res = await upsertOnboardingNotificationState(
                accountDomain,
                storeName,
                {
                    ...mockedOnboardingNotificationState,
                    onboardingState: AiAgentOnboardingState.VisitedAiAgent,
                },
            )
            expect(res.data).toEqual(data)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPut(
                    `/config/accounts/${accountDomain}/stores/${storeName}/onboarding-notification`,
                )
                .reply(400)

            await expect(
                upsertOnboardingNotificationState(accountDomain, storeName, {
                    ...mockedOnboardingNotificationState,
                }),
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('Onboarding Data API', () => {
        let apiServer: MockAdapter

        beforeAll(() => {
            apiServer = new MockAdapter(apiClient)
        })

        afterEach(() => {
            apiServer.reset()
        })

        afterAll(() => {
            apiServer.reset()
        })

        describe('getOnboardingData', () => {
            it('should resolve with the correct data on success', async () => {
                const mockData = [{ id: 1, name: 'Test Onboarding' }]

                apiServer.onGet('/onboardings').reply(200, mockData)

                const res = await getOnboardingData()
                expect(res).toEqual(mockData)
            })

            it('should handle an error correctly', async () => {
                apiServer.onGet('/onboardings').reply(400)

                await expect(getOnboardingData()).rejects.toThrow(
                    'Request failed with status code 400',
                )
            })
        })

        describe('getOnboardingDataByShopName', () => {
            it('should resolve with the correct data on success', async () => {
                const mockData = [{ id: 1, name: 'Test Onboarding' }]
                const shopName = 'TestShop'

                // 🔹 FIX: Ensure mock request includes correct params
                apiServer
                    .onGet('/onboardings', { params: { shop_name: shopName } }) // Incorrect approach
                    .reply(200, mockData)

                const res = await getOnboardingDataByShopName(shopName)
                expect(res).toEqual(mockData)
            })

            it('should handle an error correctly', async () => {
                const shopName = 'NonExistentShop'

                apiServer
                    .onGet('/onboardings', { params: { shop_name: shopName } })
                    .reply(400)

                await expect(
                    getOnboardingDataByShopName(shopName),
                ).rejects.toThrow('Request failed with status code 400')
            })
        })

        describe('createOnboardingData', () => {
            it('should resolve with the correct data on success', async () => {
                const mockData = { id: 1, name: 'New Onboarding' }

                apiServer.onPost('/onboardings').reply(201, mockData)

                const res = await createOnboardingData({
                    shopName: 'New Onboarding',
                })
                expect(res).toEqual(mockData)
            })

            it('should handle an error correctly', async () => {
                apiServer.onPost('/onboardings').reply(400)

                await expect(
                    createOnboardingData({ shopName: 'New Onboarding' }),
                ).rejects.toThrow('Request failed with status code 400')
            })
        })

        describe('updateOnboardingData', () => {
            it('should resolve with the correct data on success', async () => {
                const mockData = { id: 1, name: 'Updated Onboarding' }

                apiServer.onPut('/onboardings/1').reply(200, mockData)

                const res = await updateOnboardingData(1, {
                    shopName: 'Updated Onboarding',
                })
                expect(res).toEqual(mockData)
            })

            it('should handle an error correctly', async () => {
                apiServer.onPut('/onboardings/1').reply(400)

                await expect(
                    updateOnboardingData(1, { shopName: 'Updated Onboarding' }),
                ).rejects.toThrow('Request failed with status code 400')
            })
        })
    })
})
