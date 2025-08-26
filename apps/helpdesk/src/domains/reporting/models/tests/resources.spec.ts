import { assumeMock } from '@repo/testing'
import MockAdapter from 'axios-mock-adapter'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    postEnrichedReporting,
    postReporting,
    QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS,
    REPORTING_ENDPOINT,
    REPORTING_ENRICHED_ENDPOINT,
} from 'domains/reporting/models/resources'
import {
    EnrichmentFields,
    ReportingQuery,
    ReportingResponse,
} from 'domains/reporting/models/types'
import client from 'models/api/resources'
import { reportError } from 'utils/errors'

jest.mock('utils/errors')
const reportErrorMock = assumeMock(reportError)

const mockedAPIClient = new MockAdapter(client)

describe('Reporting resources', () => {
    const query: ReportingQuery = {
        dimensions: [],
        measures: [],
        filters: [],
        metricName: METRIC_NAMES.TEST_METRIC,
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
        mockedAPIClient.reset()
        mockedAPIClient.onPost(REPORTING_ENDPOINT).reply(200, resFixture)
        mockedAPIClient
            .onPost(REPORTING_ENRICHED_ENDPOINT)
            .reply(200, resFixture)
    })

    describe('postEnrichedReporting', () => {
        it('should resolve with the data on success', async () => {
            const res = await postEnrichedReporting<
                ReportingResponse<[number]>
            >(query, [EnrichmentFields.TicketId])

            expect(res.data.data).toEqual(resFixture.data)
            expect(res.data.query.metricName).toEqual(METRIC_NAMES.TEST_METRIC)
            const lastRequest = mockedAPIClient.history.post[0]
            expect(lastRequest.url).toBe(REPORTING_ENRICHED_ENDPOINT)
            const { metricName, ...rest } = query
            expect(JSON.parse(lastRequest.data)).toEqual({
                metric_name: metricName,
                query: rest,
                enrichment_fields: [EnrichmentFields.TicketId],
            })
        })
    })

    describe('postReporting', () => {
        it('should resolve with the data on success', async () => {
            const res = await postReporting<[number]>([query])

            expect(res.data.data).toEqual([1])
            expect(res.data.query.metricName).toEqual(METRIC_NAMES.TEST_METRIC)
        })

        it('should reject with an error on success', async () => {
            const statusCode = 503
            mockedAPIClient.onPost(REPORTING_ENDPOINT).reply(statusCode)

            const request = postReporting<[number]>([query])

            await expect(request).rejects.toEqual(
                new Error(`Request failed with status code ${statusCode}`),
            )
        })

        it('should throw and error to trigger retry on result not yet ready status (202)', async () => {
            mockedAPIClient
                .onPost(REPORTING_ENDPOINT)
                .reply(QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS)

            const request = postReporting<[number]>([query])

            await expect(request).rejects.toEqual(
                new Error(
                    `Request failed with status code ${QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS}`,
                ),
            )
        })

        it('should throw and error to trigger retry on result not yet ready status (202) even if it is a string', async () => {
            mockedAPIClient
                .onPost(REPORTING_ENDPOINT)
                .reply(
                    String(QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS) as any,
                )

            const request = postReporting<[number]>([query])

            await expect(request).rejects.toEqual(
                new Error(
                    `Request failed with status code ${QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS}`,
                ),
            )
        })

        it('should report 4xx errors with query details', async () => {
            mockedAPIClient.onPost(REPORTING_ENDPOINT).reply(400)

            const error = new Error('Request failed with status code 400')
            const request = postReporting<[number]>([query])

            await expect(request).rejects.toEqual(error)
            expect(reportErrorMock).toHaveBeenCalledWith(error, {
                extra: { context: { query: JSON.stringify([query]) } },
            })
        })
    })
})
