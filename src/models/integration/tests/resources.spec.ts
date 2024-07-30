import MockAdapter from 'axios-mock-adapter'

import {dummyAppListData, dummyAppData} from 'fixtures/apps'
import {dummyErrorLogList} from 'fixtures/appErrors'
import {integrationsState} from 'fixtures/integrations'
import client from 'models/api/resources'
import {
    disconnectApp,
    fetchApp,
    fetchApps,
    fetchAppErrorLogs,
    fetchIntegrations,
    fetchInstalledApps,
    requestNewIntegration,
} from '../resources'
import {fetchShopifyCollections} from '../resources/shopify'
import {IntegrationRequest, ShopifyCollectionResponse} from '../types'

const mockedServer = new MockAdapter(client)

const appId = dummyAppData.id

describe('integration resource', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('fetchApps', () => {
        it('should return formatted apps', async () => {
            mockedServer
                .onGet('/api/apps/')
                .reply(200, {data: [dummyAppListData]})
            const res = await fetchApps()
            expect(res).toMatchSnapshot()
        })
        it('should reject an error on fail', () => {
            mockedServer.onGet('/api/apps/').reply(503, {message: 'error'})
            return expect(fetchApps()).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('fetchInstalledApps', () => {
        it('should return installed formatted apps', async () => {
            mockedServer.onGet('/api/apps/installed/').reply(200, {
                data: [
                    {
                        ...dummyAppListData,
                        is_installed: true,
                    },
                ],
            })
            const res = await fetchInstalledApps()
            expect(res).toStrictEqual([
                {
                    appId: 'someid',
                    categories: ['Quality Assurance'],
                    description: 'Some tagline here',
                    image: 'https://ok.com/1.png',
                    isConnected: true,
                    title: 'My test app',
                    type: 'app',
                    count: 0,
                },
            ])
        })
        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/apps/installed/')
                .reply(503, {message: 'error'})
            return expect(fetchInstalledApps()).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('fetchApp', () => {
        it('should return a formatted app', async () => {
            mockedServer.onGet(`/api/apps/${appId}`).reply(200, dummyAppData)
            const res = await fetchApp(appId)
            expect(res).toMatchSnapshot()
        })
        it('should reject an error on fail', () => {
            mockedServer
                .onGet(`/api/apps/${appId}`)
                .reply(503, {message: 'error'})
            return expect(fetchApp(appId)).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('disconnectApp', () => {
        it('should return disconnect response', async () => {
            mockedServer
                .onGet(`/api/apps/uninstall/${appId}`)
                .reply(200, {is_uninstalled: true})
            const res = await disconnectApp(appId)
            expect(res).toMatchSnapshot()
        })
        it('should reject an error on fail', () => {
            mockedServer
                .onGet(`/api/apps/uninstall/${appId}`)
                .reply(503, {message: 'error'})
            return expect(disconnectApp(appId)).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('fetchAppErrorLogs', () => {
        it('should return the errors', async () => {
            mockedServer
                .onGet(`/api/async/errors`)
                .reply(200, {data: [dummyErrorLogList]})
            const res = await fetchAppErrorLogs(appId)
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet(`/api/async/errors`)
                .reply(503, {message: 'error'})
            return expect(fetchAppErrorLogs(appId)).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('fetchIntegrations', () => {
        it('should return the integrations', async () => {
            mockedServer
                .onGet('/api/integrations')
                .reply(200, [integrationsState.integrations])
            const res = await fetchIntegrations()
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/integrations')
                .reply(503, {message: 'error'})
            return expect(fetchIntegrations()).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('requestNewIntegration', () => {
        const newIntegrationRequest: IntegrationRequest = {
            description: 'description',
        }

        it('should return null', async () => {
            mockedServer
                .onPost('/integrations/request')
                .reply(201, newIntegrationRequest)
            const res = await requestNewIntegration(newIntegrationRequest)
            expect(res).toStrictEqual(newIntegrationRequest)
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPost('/integrations/request')
                .reply(503, {message: 'error'})
            return expect(
                requestNewIntegration(newIntegrationRequest)
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })

    describe('Shopify resources', () => {
        const collectionResponse = {
            data: [
                {
                    id: 473163399490,
                    title: 'Automated Collection',
                },
            ],
        } as ShopifyCollectionResponse

        it('should return values', async () => {
            mockedServer
                .onGet('/api/integrations/shopify/1/collections/')
                .reply(200, collectionResponse)
            const res = await fetchShopifyCollections(1)
            expect(res).toHaveLength(1)
        })

        it('should return empty list', async () => {
            mockedServer
                .onGet('/api/integrations/shopify/1/collections/')
                .reply(200, {})
            const res = await fetchShopifyCollections(1)
            expect(res).toHaveLength(0)
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/integrations/shopify/1/collections/')
                .reply(503, {message: 'error'})

            return expect(fetchShopifyCollections(1)).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })
})
