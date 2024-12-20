import MockAdapter from 'axios-mock-adapter'

import authClient from '../../../../models/api/resources'
import {getAccountConfigurationWithHttpIntegrationFixture} from '../../../../pages/automate/aiAgent/fixtures/accountConfiguration.fixture'
import {getStoreConfigurationFixture} from '../../../../pages/automate/aiAgent/fixtures/storeConfiguration.fixtures'
import {getSingleHelpCenterResponseFixture} from '../../../../pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {HelpCenter} from '../../../helpCenter/types'
import {
    apiClient,
    createWelcomePageAcknowledged,
    getWelcomePageAcknowledged,
    createAccountConfiguration,
    createStoreConfiguration,
    createStoreSnippetHelpCenter,
    getAccountConfiguration,
    getStoreConfiguration,
    upsertAccountConfiguration,
    upsertStoreConfiguration,
} from '../cloud-function-configuration'

describe('Cloud Function Configuration', () => {
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
                .onGet(`/accounts/${accountDomain}`)
                .reply(200, accountConfiguration)

            const res = await getAccountConfiguration(accountDomain)
            expect(res.data).toEqual(accountConfiguration)
        })

        it('should handle an error correctly', async () => {
            apiServer.onGet(`/accounts/${accountDomain}`).reply(400)

            await expect(
                getAccountConfiguration(accountDomain)
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

        it('should resolve with the correct data on success', async () => {
            apiServer.onPost(`/accounts`).reply(201, accountConfiguration)

            const res = await createAccountConfiguration(
                createAccountConfigurationPayload
            )
            expect(res.data).toEqual(accountConfiguration)
        })

        it('should handle an error correctly', async () => {
            apiServer.onPost(`/accounts`).reply(400)

            await expect(
                createAccountConfiguration(createAccountConfigurationPayload)
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('upsertAccountConfiguration', () => {
        const accountConfiguration =
            getAccountConfigurationWithHttpIntegrationFixture()

        const accountDomain = accountConfiguration.gorgiasDomain

        it('should resolve with the correct data on success', async () => {
            apiServer
                .onPut(`/accounts/${accountDomain}`)
                .reply(200, accountConfiguration)

            const res = await upsertAccountConfiguration(accountConfiguration)
            expect(res.data).toEqual(accountConfiguration)
        })

        it('should handle an error correctly', async () => {
            apiServer.onPut(`/accounts/${accountDomain}`).reply(400)

            await expect(
                upsertAccountConfiguration(accountConfiguration)
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('getStoreConfiguration', () => {
        const accountDomain = 'myAccountDomain'
        const storeConfiguration = getStoreConfigurationFixture()
        const {storeName} = storeConfiguration

        it('should resolve with the correct data on success', async () => {
            apiServer
                .onGet(
                    `/accounts/${accountDomain}/stores/${storeName}?with_wizard=false`
                )
                .reply(200, storeConfiguration)

            const res = await getStoreConfiguration({accountDomain, storeName})
            expect(res.data).toEqual(storeConfiguration)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onGet(
                    `/accounts/${accountDomain}/stores/${storeName}?with_wizard=false`
                )
                .reply(400)

            await expect(
                getStoreConfiguration({accountDomain, storeName})
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('createStoreConfiguration', () => {
        const accountDomain = 'myAccountDomain'
        const storeConfiguration = getStoreConfigurationFixture()

        it('should resolve with the correct data on success', async () => {
            apiServer
                .onPost(`/accounts/${accountDomain}/stores`)
                .reply(201, storeConfiguration)

            const res = await createStoreConfiguration(
                accountDomain,
                storeConfiguration
            )
            expect(res.data).toEqual(storeConfiguration)
        })

        it('should handle an error correctly', async () => {
            apiServer.onPost(`/accounts/${accountDomain}/stores`).reply(400)

            await expect(
                createStoreConfiguration(accountDomain, storeConfiguration)
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('upsertStoreConfiguration', () => {
        const accountDomain = 'myAccountDomain'
        const storeConfiguration = getStoreConfigurationFixture()
        const {storeName} = storeConfiguration

        it('should resolve with the correct data on success', async () => {
            apiServer
                .onPut(`/accounts/${accountDomain}/stores/${storeName}`)
                .reply(200, storeConfiguration)

            const res = await upsertStoreConfiguration(
                accountDomain,
                storeConfiguration
            )
            expect(res.data).toEqual(storeConfiguration)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPut(`/accounts/${accountDomain}/stores/${storeName}`)
                .reply(400)

            await expect(
                upsertStoreConfiguration(accountDomain, storeConfiguration)
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
                    `/accounts/${accountDomain}/stores/${storeName}/initialize-snippet`
                )
                .reply(200, helpCenter)

            const res = await createStoreSnippetHelpCenter(
                accountDomain,
                storeName
            )
            expect(res.data).toEqual(helpCenter)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPost(
                    `/accounts/${accountDomain}/stores/${storeName}/initialize-snippet`
                )
                .reply(400)

            await expect(
                createStoreSnippetHelpCenter(accountDomain, storeName)
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('getWelcomePageAcknowledged', () => {
        it('should resolve with the correct data on success', async () => {
            const data = {acknowledged: false}

            apiServer
                .onGet(`/stores/${storeName}/welcome-page-acknowledged`)
                .reply(200, data)

            const res = await getWelcomePageAcknowledged(
                accountDomain,
                storeName
            )
            expect(res.data).toEqual(data)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onGet(`/stores/${storeName}/welcome-page-acknowledged`)
                .reply(400)

            await expect(
                getWelcomePageAcknowledged(accountDomain, storeName)
            ).rejects.toThrow('Request failed with status code 400')
        })
    })

    describe('createWelcomePageAcknowledged', () => {
        it('should resolve with the correct data on success', async () => {
            const data = {acknowledged: true}

            apiServer
                .onPost(`/stores/${storeName}/welcome-page-acknowledged`)
                .reply(200, data)

            const res = await createWelcomePageAcknowledged(
                accountDomain,
                storeName
            )
            expect(res.data).toEqual(data)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPost(`/stores/${storeName}/welcome-page-acknowledged`)
                .reply(500)

            await expect(
                createWelcomePageAcknowledged(accountDomain, storeName)
            ).rejects.toThrow('Request failed with status code 500')
        })
    })
})
