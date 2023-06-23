import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'

import {
    REPORTING_ENDPOINT,
    postReporting,
    QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS,
} from '../resources'
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
            const statusCode = 503

            mockedServer.onPost(REPORTING_ENDPOINT).reply(statusCode)

            return expect(postReporting<[number]>([query])).rejects.toEqual(
                new Error(`Request failed with status code ${statusCode}`)
            )
        })

        it('should throw and error to trigger retry on result not yet ready status (202)', () => {
            mockedServer
                .onPost(REPORTING_ENDPOINT)
                .reply(QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS)

            return expect(postReporting<[number]>([query])).rejects.toEqual(
                new Error(
                    `Request failed with status code ${QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS}`
                )
            )
        })

        it('should throw and error to trigger retry on result not yet ready status (202) even if it is a string', () => {
            mockedServer
                .onPost(REPORTING_ENDPOINT)
                .reply(
                    String(QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS) as any
                )

            return expect(postReporting<[number]>([query])).rejects.toEqual(
                new Error(
                    `Request failed with status code ${QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS}`
                )
            )
        })
    })
})
