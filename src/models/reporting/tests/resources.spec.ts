import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'

import {REPORTING_ENDPOINT, postReporting} from '../resources'
import {ReportingResponse, ReportingQuery} from '../types'

const mockedServer = new MockAdapter(client)

describe('Reporting resources', () => {
    const query: ReportingQuery = {
        dimensions: [],
        measures: [],
        filters: [],
    }
    const resFixture: ReportingResponse<[number]> = {
        query,
        data: [1],
        annotation: {
            title: 'test',
            shortTitle: 'test',
            type: 'number',
        },
    }

    beforeEach(() => {
        mockedServer.reset()
        mockedServer.onPost(REPORTING_ENDPOINT).reply(200, resFixture)
    })

    describe('postReporting', () => {
        it('should resolve with the data on success', async () => {
            const res = await postReporting<[number]>([query])

            expect(res.data.data).toEqual([1])
        })

        it('should reject with an error on success', async () => {
            mockedServer.onPost(REPORTING_ENDPOINT).reply(503)

            return expect(postReporting<[number]>([query])).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })
})
