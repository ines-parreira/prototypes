import MockAdapter from 'axios-mock-adapter'

import {dummyAppListData, dummyAppData} from 'fixtures/apps'
import client from 'models/api/resources'
import {fetchApp, fetchApps} from '../resources'

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
})
