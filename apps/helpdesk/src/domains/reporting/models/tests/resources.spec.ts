import { assumeMock } from '@repo/testing'
import MockAdapter from 'axios-mock-adapter'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    postEnrichedReporting,
    postReporting,
    postReportingV2,
    postReportingV2Query,
    QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS,
    REPORTING_ENDPOINT,
    REPORTING_ENRICHED_ENDPOINT,
    REPORTING_STATS_ENDPOINT,
    REPORTING_STATS_QUERY_ENDPOINT,
} from 'domains/reporting/models/resources'
import { QueryFor, ScopeMeta } from 'domains/reporting/models/scopes/scope'
import {
    EnrichmentFields,
    ReportingQuery,
    ReportingResponse,
} from 'domains/reporting/models/types'
import client from 'models/api/resources'
import { reportError } from 'utils/errors'

jest.mock('utils/errors')
const reportErrorMock = assumeMock(reportError)

// Mock URL constructor to handle relative paths
global.URL = jest.fn().mockImplementation((url: string) => {
    const [pathname, search] = url.split('?')
    const mockUrl: any = {
        pathname,
        search: search ? `?${search}` : '',
        searchParams: new URLSearchParams(search || ''),
        toString: (): string => mockUrl.pathname + mockUrl.search,
    }

    // Override searchParams.set to update the search property
    const originalSet = mockUrl.searchParams.set.bind(mockUrl.searchParams)
    mockUrl.searchParams.set = jest.fn((name: string, value: string): void => {
        originalSet(name, value)
        mockUrl.search = mockUrl.searchParams.toString()
            ? `?${mockUrl.searchParams.toString()}`
            : ''
    })

    return mockUrl
}) as any

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
    const queryResFixture = {
        dimensions: [],
        measures: [],
        filters: [],
    }

    beforeEach(() => {
        mockedAPIClient.reset()
        mockedAPIClient.onPost(REPORTING_ENDPOINT).reply(200, resFixture)
        mockedAPIClient.onPost(REPORTING_STATS_ENDPOINT).reply(200, resFixture)
        mockedAPIClient
            .onPost(REPORTING_STATS_QUERY_ENDPOINT)
            .reply(200, queryResFixture)
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
                extra: {
                    context: {
                        query: JSON.stringify([query]),
                        metricName: METRIC_NAMES.TEST_METRIC,
                    },
                },
            })
        })
    })

    describe('postReportingV2', () => {
        const query: QueryFor<ScopeMeta> = {
            dimensions: [],
            measures: [],
            filters: [],
            metricName: METRIC_NAMES.TEST_METRIC,
        }

        it('should resolve with the data on success', async () => {
            const res = await postReportingV2<[number]>(query)

            expect(res.data.data).toEqual([1])
            expect(res.data.query.metricName).toEqual(METRIC_NAMES.TEST_METRIC)
        })

        it('should reject with an error on success', async () => {
            const statusCode = 503
            mockedAPIClient.onPost(REPORTING_STATS_ENDPOINT).reply(statusCode)

            const request = postReportingV2<[number]>(query)

            await expect(request).rejects.toEqual(
                new Error(`Request failed with status code ${statusCode}`),
            )
        })

        it('should throw and error to trigger retry on result not yet ready status (202)', async () => {
            mockedAPIClient
                .onPost(REPORTING_STATS_ENDPOINT)
                .reply(QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS)

            const request = postReportingV2<[number]>(query)

            await expect(request).rejects.toEqual(
                new Error(
                    `Request failed with status code ${QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS}`,
                ),
            )
        })

        it('should throw and error to trigger retry on result not yet ready status (202) even if it is a string', async () => {
            mockedAPIClient
                .onPost(REPORTING_STATS_ENDPOINT)
                .reply(
                    String(QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS) as any,
                )

            const request = postReportingV2<[number]>(query)

            await expect(request).rejects.toEqual(
                new Error(
                    `Request failed with status code ${QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS}`,
                ),
            )
        })

        it('should report 4xx errors with query details', async () => {
            mockedAPIClient.onPost(REPORTING_STATS_ENDPOINT).reply(400)

            const error = new Error('Request failed with status code 400')
            const request = postReportingV2<[number]>(query)

            const { metricName, ...restOfQuery } = query
            await expect(request).rejects.toEqual(error)
            expect(reportErrorMock).toHaveBeenCalledWith(error, {
                extra: {
                    context: {
                        query: JSON.stringify(restOfQuery),
                        metricName: metricName,
                    },
                },
            })
        })
    })

    describe('postReportingV2Query', () => {
        const query: QueryFor<ScopeMeta> = {
            dimensions: [],
            measures: [],
            filters: [],
            metricName: METRIC_NAMES.TEST_METRIC,
        }

        it('should resolve with the data on success', async () => {
            const res = await postReportingV2Query(query)

            expect(res.data).toEqual(queryResFixture)
        })

        it('should resolve with the data with limit on success', async () => {
            mockedAPIClient
                .onPost(`${REPORTING_STATS_QUERY_ENDPOINT}?limit=100`)
                .reply(200, { ...queryResFixture, limit: 100 })

            const res = await postReportingV2Query(query, 100)

            expect(res.data).toEqual({ ...queryResFixture, limit: 100 })
        })

        it('should reject with an error on success', async () => {
            const statusCode = 503
            mockedAPIClient
                .onPost(REPORTING_STATS_QUERY_ENDPOINT)
                .reply(statusCode)

            const request = postReportingV2Query(query)

            await expect(request).rejects.toEqual(
                new Error(`Request failed with status code ${statusCode}`),
            )
        })

        it('should throw and error to trigger retry on result not yet ready status (202)', async () => {
            mockedAPIClient
                .onPost(REPORTING_STATS_QUERY_ENDPOINT)
                .reply(QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS)

            const request = postReportingV2Query(query)

            await expect(request).rejects.toEqual(
                new Error(
                    `Request failed with status code ${QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS}`,
                ),
            )
        })

        it('should throw and error to trigger retry on result not yet ready status (202) even if it is a string', async () => {
            mockedAPIClient
                .onPost(REPORTING_STATS_QUERY_ENDPOINT)
                .reply(
                    String(QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS) as any,
                )

            const request = postReportingV2Query(query)

            await expect(request).rejects.toEqual(
                new Error(
                    `Request failed with status code ${QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS}`,
                ),
            )
        })

        it('should report 4xx errors with query details', async () => {
            mockedAPIClient.onPost(REPORTING_STATS_QUERY_ENDPOINT).reply(400)

            const error = new Error('Request failed with status code 400')
            const request = postReportingV2Query(query)

            const { metricName, ...restOfQuery } = query
            await expect(request).rejects.toEqual(error)
            expect(reportErrorMock).toHaveBeenCalledWith(error, {
                extra: {
                    context: {
                        query: JSON.stringify(restOfQuery),
                        metricName: metricName,
                    },
                },
            })
        })
    })
})
