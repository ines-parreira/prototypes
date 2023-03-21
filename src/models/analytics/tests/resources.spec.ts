import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'

import {ANALYTICS_ENDPOINT, getAnalytics} from '../resources'
import {GetAnalyticsResponse} from '../types'

const mockedServer = new MockAdapter(client)

describe('analytics resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('getAnalytics', () => {
        it('should resolve with the data on success', async () => {
            const resFixture: GetAnalyticsResponse<[number]> = {
                query: 'foo',
                data: [1],
                annotation: {
                    title: 'test',
                    shortTitle: 'test',
                    type: 'number',
                },
            }
            mockedServer.onGet(ANALYTICS_ENDPOINT).reply(200, resFixture)

            const res = await getAnalytics<[number]>({
                dimensions: [],
                measures: [],
                filters: [],
                timeDimensions: [],
            })

            expect(res.data.data).toEqual([1])
        })

        it('should reject with an error on success', async () => {
            mockedServer.onGet(ANALYTICS_ENDPOINT).reply(503)

            return expect(
                getAnalytics<[number]>({
                    dimensions: [],
                    measures: [],
                    filters: [],
                    timeDimensions: [],
                })
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })
})
