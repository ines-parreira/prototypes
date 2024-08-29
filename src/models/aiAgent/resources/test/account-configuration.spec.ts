import MockAdapter from 'axios-mock-adapter'
import {
    apiClient,
    createWelcomePageAcknowledged,
    getWelcomePageAcknowledged,
} from '../account-configuration'
import authClient from '../../../../models/api/resources'

describe('Account Configuration', () => {
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

    describe('getWelcomePageAcknowledged', () => {
        it('should resolve with the correct data on success', async () => {
            const data = {acknowledged: false}

            apiServer
                .onGet(`/stores/${storeName}/welcome-page-acknowledged`)
                .reply(200, data)

            const res = await getWelcomePageAcknowledged(storeName)
            expect(res.data).toEqual(data)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onGet(`/stores/${storeName}/welcome-page-acknowledged`)
                .reply(400)

            await expect(getWelcomePageAcknowledged(storeName)).rejects.toThrow(
                'Request failed with status code 400'
            )
        })
    })

    describe('createWelcomePageAcknowledged', () => {
        it('should resolve with the correct data on success', async () => {
            const data = {acknowledged: true}

            apiServer
                .onPost(`/stores/${storeName}/welcome-page-acknowledged`)
                .reply(200, data)

            const res = await createWelcomePageAcknowledged(storeName)
            expect(res.data).toEqual(data)
        })

        it('should handle an error correctly', async () => {
            apiServer
                .onPost(`/stores/${storeName}/welcome-page-acknowledged`)
                .reply(500)

            await expect(
                createWelcomePageAcknowledged(storeName)
            ).rejects.toThrow('Request failed with status code 500')
        })
    })
})
