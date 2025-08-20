import MockAdapter from 'axios-mock-adapter'

import {
    AiAgentOnboardingState,
    HandoverConfigurationResponse,
} from 'models/aiAgent/types'
import authClient from 'models/api/resources'
import { HelpCenter } from 'models/helpCenter/types'
import { AiAgentChannel } from 'pages/aiAgent/constants'
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
    getAiAgentStoreHandoverConfigurations,
    getOnboardingData,
    getOnboardingDataByShopName,
    getOnboardingNotificationState,
    getStoreConfiguration,
    getStoresConfigurations,
    getWelcomePageAcknowledged,
    optOutAiAgentTrialUpgrade,
    optOutSalesTrialUpgrade,
    startAiAgentTrial,
    startSalesTrial,
    updateOnboardingData,
    upgradeSubscription,
    upsertAccountConfiguration,
    upsertAiAgentStoreHandoverConfiguration,
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
        authServer.restore()
        apiServer.restore()
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

                apiServer.onGet('/onboardings').reply((config) => {
                    if (config.params?.shop_name === shopName) {
                        return [200, mockData]
                    }
                    return [404]
                })

                const res = await getOnboardingDataByShopName(shopName)
                expect(res).toEqual(mockData)
            })

            it('should handle an error correctly', async () => {
                const shopName = 'NonExistentShop'

                apiServer.onGet('/onboardings').reply(400)

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

        describe('getAiAgentStoreHandoverConfigurations', () => {
            const mockData: HandoverConfigurationResponse = {
                handoverConfigurations: [
                    {
                        accountId: 1,
                        storeName: 'gorgiastest',
                        shopType: 'shopify',
                        integrationId: 5008,
                        channel: AiAgentChannel.Chat,
                        onlineInstructions: null,
                        offlineInstructions: 'Offline instructions',
                        shareBusinessHours: false,
                    },
                ],
            }
            it('should resolve with the correct data on success', async () => {
                apiServer
                    .onGet(
                        '/config/accounts/1/stores/1/handover-configurations',
                    )
                    .reply(200, mockData)

                const res = await getAiAgentStoreHandoverConfigurations(
                    '1',
                    '1',
                )

                expect(res).toEqual(mockData)
            })

            test.each([AiAgentChannel.Chat, AiAgentChannel.Email])(
                'should handle channel query param correctly',
                async (channel) => {
                    apiServer
                        .onGet(
                            `/config/accounts/1/stores/1/handover-configurations?channel=${channel}`,
                        )
                        .reply(200, mockData)

                    const res = await getAiAgentStoreHandoverConfigurations(
                        '1',
                        '1',
                        channel,
                    )

                    expect(res).toEqual(mockData)
                },
            )

            it('should handle an error correctly', async () => {
                const accountDomain = '1'
                const storeName = '1'

                apiServer
                    .onGet(
                        `/config/accounts/1/stores/1/handover-configurations`,
                    )
                    .reply(400)

                await expect(
                    getAiAgentStoreHandoverConfigurations(
                        accountDomain,
                        storeName,
                    ),
                ).rejects.toThrow('Request failed with status code 400')
            })
        })

        describe('upsertAiAgentStoreHandoverConfiguration', () => {
            const mockData = {
                handoverConfiguration: {
                    accountId: 1,
                    storeName: 'gorgiastest',
                    shopType: 'shopify',
                    integrationId: 5008,
                    channel: 'chat',
                    onlineInstructions: null,
                    offlineInstructions: 'Offline instructions',
                    shareBusinessHours: false,
                    createdDatetime: '2025-03-06T17:04:32.477Z',
                    updatedDatetime: '2025-03-06T17:04:32.477Z',
                },
            }

            const payload = {
                ...mockData.handoverConfiguration,
                channel: AiAgentChannel.Chat,
                offlineInstructions: 'Updated instructions',
            }
            it('should resolve with the correct data on success', async () => {
                apiServer
                    .onPut(
                        '/config/accounts/1/stores/1/handover-configurations/5008',
                    )
                    .reply(200, mockData)

                const res = await upsertAiAgentStoreHandoverConfiguration(
                    '1',
                    '1',
                    5008,
                    payload,
                )
                expect(res).toEqual(mockData)
            })

            it('should handle an error correctly', async () => {
                apiServer
                    .onPut(
                        '/config/accounts/1/stores/1/handover-configurations/5008',
                    )
                    .reply(400)

                await expect(
                    upsertAiAgentStoreHandoverConfiguration(
                        '1',
                        '1',
                        5008,
                        payload,
                    ),
                ).rejects.toThrow('Request failed with status code 400')
            })
        })

        describe('getStoresConfigurations', () => {
            const accountDomain = 'acme'

            it('should resolve with data on success', async () => {
                const mockData = {
                    storeConfigurations: [
                        getStoreConfigurationFixture({ storeName: 'store1' }),
                        getStoreConfigurationFixture({ storeName: 'store2' }),
                    ],
                }

                apiServer
                    .onGet(
                        `/config/accounts/${accountDomain}/stores/configurations?with_wizard=true&with_floating_chat_input_configuration=true`,
                    )
                    .reply(200, mockData)

                const result = await getStoresConfigurations(accountDomain, {
                    withWizard: true,
                    withFloatingInput: true,
                })

                expect(result).toEqual(mockData)
            })

            it('should return fallback when 404 error occurs', async () => {
                const consoleWarnSpy = jest
                    .spyOn(console, 'warn')
                    .mockImplementation()

                apiServer
                    .onGet(
                        `/config/accounts/${accountDomain}/stores/configurations?with_wizard=true&with_floating_chat_input_configuration=true`,
                    )
                    .reply(404)

                const result = await getStoresConfigurations(accountDomain, {
                    withWizard: true,
                    withFloatingInput: true,
                })

                expect(consoleWarnSpy).toHaveBeenCalledWith(
                    `[getStoresConfigurations] 404 for ${accountDomain} — returning fallback`,
                )
                expect(result).toEqual({ storeConfigurations: [] })

                consoleWarnSpy.mockRestore()
            })

            it('should throw when non-404 error occurs', async () => {
                apiServer
                    .onGet(
                        `/config/accounts/${accountDomain}/stores/configurations?with_wizard=true&with_floating_chat_input_configuration=true`,
                    )
                    .reply(500)

                await expect(
                    getStoresConfigurations(accountDomain, {
                        withWizard: true,
                        withFloatingInput: true,
                    }),
                ).rejects.toThrow('Request failed with status code 500')
            })
        })
    })

    describe('startSalesTrial', () => {
        const gorgiasDomain = 'test-domain'
        const storeType = 'shopify'
        const storeName = 'test-store'

        beforeEach(() => {
            apiServer.restore()
            apiServer = new MockAdapter(apiClient)
        })

        it('should resolve with the correct data on success', async () => {
            const mockResponse = { success: true, message: 'Trial started' }

            apiServer
                .onPost(
                    `/config/accounts/${gorgiasDomain}/sales/${storeType}/${storeName}/start-trial`,
                )
                .reply(200, mockResponse)

            const result = await startSalesTrial(
                gorgiasDomain,
                storeType,
                storeName,
            )

            expect(result).toEqual(mockResponse)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPost(
                    `/config/accounts/${gorgiasDomain}/sales/${storeType}/${storeName}/start-trial`,
                )
                .reply(400)

            await expect(
                startSalesTrial(gorgiasDomain, storeType, storeName),
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('optOutSalesTrialUpgrade', () => {
        const gorgiasDomain = 'test-domain'

        beforeEach(() => {
            apiServer.restore()
            apiServer = new MockAdapter(apiClient)
        })

        it('should resolve with the correct data on success', async () => {
            const mockResponse = {
                success: true,
                message: 'Opted out successfully',
            }

            apiServer
                .onPost(
                    `/config/accounts/${gorgiasDomain}/sales/opt-out-trial-upgrade`,
                )
                .reply(200, mockResponse)

            const result = await optOutSalesTrialUpgrade(gorgiasDomain)

            expect(result).toEqual(mockResponse)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPost(
                    `/config/accounts/${gorgiasDomain}/sales/opt-out-trial-upgrade`,
                )
                .reply(400)

            await expect(
                optOutSalesTrialUpgrade(gorgiasDomain),
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('startAiAgentTrial', () => {
        const gorgiasDomain = 'test-domain'
        const storeType = 'shopify'
        const storeName = 'test-store'

        beforeEach(() => {
            apiServer.restore()
            apiServer = new MockAdapter(apiClient)
        })

        it('should resolve with the correct data on success', async () => {
            const mockResponse = {
                success: true,
                message: 'AI Agent trial started',
            }

            apiServer
                .onPost(
                    `/config/accounts/${gorgiasDomain}/stores/${storeType}/${storeName}/start-trial`,
                )
                .reply(200, mockResponse)

            const result = await startAiAgentTrial(
                gorgiasDomain,
                storeType,
                storeName,
            )

            expect(result).toEqual(mockResponse)
        })

        it('should resolve with the correct data when optedInForUpgrade is true', async () => {
            const mockResponse = {
                success: true,
                message: 'AI Agent trial started with upgrade opt-in',
            }

            apiServer
                .onPost(
                    `/config/accounts/${gorgiasDomain}/stores/${storeType}/${storeName}/start-trial`,
                )
                .reply((config) => {
                    const requestData = JSON.parse(config.data)
                    expect(requestData.optedInForUpgrade).toBe(true)
                    return [200, mockResponse]
                })

            const result = await startAiAgentTrial(
                gorgiasDomain,
                storeType,
                storeName,
                true,
            )

            expect(result).toEqual(mockResponse)
        })

        it('should send optedInForUpgrade as false by default', async () => {
            const mockResponse = {
                success: true,
                message: 'AI Agent trial started',
            }

            apiServer
                .onPost(
                    `/config/accounts/${gorgiasDomain}/stores/${storeType}/${storeName}/start-trial`,
                )
                .reply((config) => {
                    const requestData = JSON.parse(config.data)
                    expect(requestData.optedInForUpgrade).toBe(false)
                    return [200, mockResponse]
                })

            const result = await startAiAgentTrial(
                gorgiasDomain,
                storeType,
                storeName,
            )

            expect(result).toEqual(mockResponse)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPost(
                    `/config/accounts/${gorgiasDomain}/stores/${storeType}/${storeName}/start-trial`,
                )
                .reply(400)

            await expect(
                startAiAgentTrial(gorgiasDomain, storeType, storeName),
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('optOutAiAgentTrialUpgrade', () => {
        const gorgiasDomain = 'test-domain'

        beforeEach(() => {
            apiServer.restore()
            apiServer = new MockAdapter(apiClient)
        })

        it('should resolve with the correct data on success', async () => {
            const mockResponse = {
                success: true,
                message: 'Opted out of AI Agent trial upgrade successfully',
            }

            apiServer
                .onPost(
                    `/config/accounts/${gorgiasDomain}/opt-out-trial-upgrade`,
                )
                .reply(200, mockResponse)

            const result = await optOutAiAgentTrialUpgrade(gorgiasDomain)

            expect(result).toEqual(mockResponse)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPost(
                    `/config/accounts/${gorgiasDomain}/opt-out-trial-upgrade`,
                )
                .reply(400)

            await expect(
                optOutAiAgentTrialUpgrade(gorgiasDomain),
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('upgradeSubscription', () => {
        const gorgiasDomain = 'test-domain'

        beforeEach(() => {
            apiServer.restore()
            apiServer = new MockAdapter(apiClient)
        })

        it('should resolve with the correct data on success', async () => {
            const mockResponse = {
                success: true,
                message: 'Subscription upgraded successfully',
            }

            apiServer
                .onPost(
                    `/config/accounts/${gorgiasDomain}/upgrade-subscription`,
                )
                .reply(200, mockResponse)

            const result = await upgradeSubscription(gorgiasDomain)

            expect(result).toEqual(mockResponse)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPost(
                    `/config/accounts/${gorgiasDomain}/upgrade-subscription`,
                )
                .reply(400)

            await expect(upgradeSubscription(gorgiasDomain)).rejects.toThrow(
                'Request failed with status code 400',
            )
        })
    })
})
