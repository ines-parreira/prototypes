import { reportError } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import MockAdapter from 'axios-mock-adapter'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    isTransientErrorMessage,
    isTransientErrorStatus,
    postEnrichedReporting,
    postReportingV1,
    postReportingV2,
    postReportingV2Query,
    QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS,
    REPORTING_ENDPOINT,
    REPORTING_ENRICHED_ENDPOINT,
    REPORTING_STATS_ENDPOINT,
    REPORTING_STATS_QUERY_ENDPOINT,
} from 'domains/reporting/models/resources'
import type { BuiltQuery } from 'domains/reporting/models/scopes/scope'
import type {
    ReportingParams,
    ReportingQuery,
    ReportingResponse,
} from 'domains/reporting/models/types'
import { EnrichmentFields } from 'domains/reporting/models/types'
import client from 'models/api/resources'

jest.mock('@repo/logging')
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

    describe('postReportingV1', () => {
        const queries: ReportingParams = [
            {
                dimensions: [],
                measures: ['count'],
                filters: [],
                metricName: METRIC_NAMES.TEST_METRIC,
            },
        ]

        it('should resolve with the data on success', async () => {
            const res = await postReportingV1<[number]>(queries)

            expect(res.data.data).toEqual(resFixture.data)
            expect(res.data.query.metricName).toEqual(METRIC_NAMES.TEST_METRIC)
            const lastRequest = mockedAPIClient.history.post[0]
            expect(lastRequest.url).toBe(REPORTING_ENDPOINT)
            const { metricName, ...rest } = queries[0]
            expect(JSON.parse(lastRequest.data)).toEqual({
                metric_name: metricName,
                query: [rest],
            })
        })

        it('should reject with an error on failure', async () => {
            const statusCode = 503
            mockedAPIClient.onPost(REPORTING_ENDPOINT).reply(statusCode)

            const request = postReportingV1<[number]>(queries)

            await expect(request).rejects.toEqual(
                new Error(`Request failed with status code ${statusCode}`),
            )
        })

        it('should throw and error to trigger retry on result not yet ready status (202)', async () => {
            mockedAPIClient
                .onPost(REPORTING_ENDPOINT)
                .reply(QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS)

            const request = postReportingV1<[number]>(queries)

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

            const request = postReportingV1<[number]>(queries)

            await expect(request).rejects.toEqual(
                new Error(
                    `Request failed with status code ${QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS}`,
                ),
            )
        })

        it('should report 4xx errors with query details', async () => {
            mockedAPIClient.onPost(REPORTING_ENDPOINT).reply(400)

            const error = new Error('Request failed with status code 400')
            const request = postReportingV1<[number]>(queries)

            const { metricName } = queries[0]
            await expect(request).rejects.toEqual(error)
            expect(reportErrorMock).toHaveBeenCalledWith(error, {
                extra: {
                    context: {
                        query: JSON.stringify(queries),
                        metricName: metricName,
                    },
                },
            })
        })
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

    describe('postReportingV2', () => {
        const query: BuiltQuery = {
            scope: MetricScope.TicketsClosed,
            dimensions: [],
            measures: [],
            filters: [],
            metricName: METRIC_NAMES.TEST_METRIC,
        }

        it('should resolve with the data on success', async () => {
            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}`,
                )
                .reply(200, resFixture)

            const res = await postReportingV2<[number]>(query)

            expect(res.data.data).toEqual([1])
        })

        it('should resolve with the data with limit on success', async () => {
            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}&limit=100`,
                )
                .reply(200, resFixture)

            const queryWithLimit = { ...query, limit: 100 }
            const res = await postReportingV2<[number]>(queryWithLimit)

            expect(res.data.data).toEqual([1])
        })

        it('should resolve with the data with offset on success', async () => {
            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}&offset=50`,
                )
                .reply(200, resFixture)

            const queryWithOffset = { ...query, offset: 50 }
            const res = await postReportingV2<[number]>(queryWithOffset)

            expect(res.data.data).toEqual([1])
        })

        it('should resolve with the data with total on success', async () => {
            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}&total=true`,
                )
                .reply(200, resFixture)

            const queryWithTotal = { ...query, total: true }
            const res = await postReportingV2<[number]>(queryWithTotal)

            expect(res.data.data).toEqual([1])
        })

        it('should reject with an error on success', async () => {
            const statusCode = 503
            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}`,
                )
                .reply(statusCode)

            const request = postReportingV2<[number]>(query)

            await expect(request).rejects.toEqual(
                new Error(`Request failed with status code ${statusCode}`),
            )
        })

        it('should throw and error to trigger retry on result not yet ready status (202)', async () => {
            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}`,
                )
                .reply(QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS)

            const request = postReportingV2<[number]>(query)

            await expect(request).rejects.toEqual(
                new Error(
                    `Request failed with status code ${QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS}`,
                ),
            )
        })

        it('should throw and error to trigger retry on result not yet ready status (202) even if it is a string', async () => {
            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}`,
                )
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
            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}`,
                )
                .reply(400)

            const error = new Error('Request failed with status code 400')
            const request = postReportingV2<[number]>(query)

            const { metricName, limit: __limit, ...restOfQuery } = query
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
        const query: BuiltQuery = {
            scope: MetricScope.TicketsClosed,
            dimensions: [],
            measures: [],
            filters: [],
            metricName: METRIC_NAMES.TEST_METRIC,
        }

        it('should resolve with the data on success', async () => {
            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_QUERY_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}`,
                )
                .reply(200, queryResFixture)

            const res = await postReportingV2Query(query)

            expect(res.data).toEqual(queryResFixture)
        })

        it('should resolve with the data with limit on success', async () => {
            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_QUERY_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}&limit=100`,
                )
                .reply(200, { ...queryResFixture, limit: 100 })

            const queryWithLimit = { ...query, limit: 100 }
            const res = await postReportingV2Query(queryWithLimit)

            expect(res.data).toEqual({ ...queryResFixture, limit: 100 })
        })

        it('should resolve with the data with offset on success', async () => {
            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_QUERY_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}&offset=50`,
                )
                .reply(200, queryResFixture)

            const queryWithOffset = { ...query, offset: 50 }
            const res = await postReportingV2Query(queryWithOffset)

            expect(res.data).toEqual(queryResFixture)
        })

        it('should resolve with the data with total on success', async () => {
            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_QUERY_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}&total=true`,
                )
                .reply(200, queryResFixture)

            const queryWithTotal = { ...query, total: true }
            const res = await postReportingV2Query(queryWithTotal)

            expect(res.data).toEqual(queryResFixture)
        })

        it('should reject with an error on success', async () => {
            const statusCode = 503

            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_QUERY_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}`,
                )
                .reply(statusCode)

            const request = postReportingV2Query(query)

            await expect(request).rejects.toEqual(
                new Error(`Request failed with status code ${statusCode}`),
            )
        })

        it('should throw and error to trigger retry on result not yet ready status (202)', async () => {
            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_QUERY_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}`,
                )
                .reply(QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS)

            const request = postReportingV2Query(query)

            await expect(request).rejects.toEqual(
                new Error(
                    `Request failed with status code ${QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS}`,
                ),
            )
        })

        it('should throw and error to trigger retry on result not yet ready status (202) even if it is a string', async () => {
            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_QUERY_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}`,
                )
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
            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_QUERY_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}`,
                )
                .reply(400)

            const error = new Error('Request failed with status code 400')
            const request = postReportingV2Query(query)

            const { metricName, limit: __limit, ...restOfQuery } = query
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

        it('should not report errors with undefined status', async () => {
            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_QUERY_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}`,
                )
                .networkError()

            const request = postReportingV2Query(query)

            await expect(request).rejects.toThrow()
            expect(reportErrorMock).not.toHaveBeenCalled()
        })

        it('should handle errors when reporting to sentry fails', async () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation()

            reportErrorMock.mockImplementation(() => {
                throw new Error('Sentry error')
            })

            mockedAPIClient.reset()
            mockedAPIClient
                .onPost(
                    `${REPORTING_STATS_QUERY_ENDPOINT}?metric_name=${METRIC_NAMES.TEST_METRIC}`,
                )
                .reply(400)

            const request = postReportingV2Query(query)

            await expect(request).rejects.toThrow()
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'reportQueryErrorToSentry:',
                expect.any(Error),
            )

            consoleErrorSpy.mockRestore()
        })
    })

    describe('isTransientErrorStatus', () => {
        it('should return false for undefined status', () => {
            expect(isTransientErrorStatus(undefined)).toBe(false)
        })

        it('should return true for 202 status', () => {
            expect(isTransientErrorStatus(202)).toBe(true)
        })

        it('should return true for 429 status', () => {
            expect(isTransientErrorStatus(429)).toBe(true)
        })

        it('should return true for 401 status', () => {
            expect(isTransientErrorStatus(401)).toBe(true)
        })

        it('should return true for 419 status', () => {
            expect(isTransientErrorStatus(419)).toBe(true)
        })

        it.each([
            { status: 500, description: '500 Internal Server Error' },
            { status: 502, description: '502 Bad Gateway' },
            { status: 503, description: '503 Service Unavailable' },
            { status: 504, description: '504 Gateway Timeout' },
            { status: 599, description: '599 (edge of 5xx range)' },
        ])('should return true for $description', ({ status }) => {
            expect(isTransientErrorStatus(status)).toBe(true)
        })

        it.each([
            { status: 200, description: '200 OK' },
            { status: 400, description: '400 Bad Request' },
            { status: 404, description: '404 Not Found' },
            { status: 403, description: '403 Forbidden' },
            { status: 600, description: '600 (outside 5xx range)' },
        ])('should return false for $description', ({ status }) => {
            expect(isTransientErrorStatus(status)).toBe(false)
        })
    })

    describe('isTransientErrorMessage', () => {
        it('should return false for undefined', () => {
            expect(isTransientErrorMessage(undefined)).toBe(false)
        })

        it('should return false for empty string', () => {
            expect(isTransientErrorMessage('')).toBe(false)
        })

        it.each(['Network Error', 'Request aborted', 'timeout exceeded'])(
            'should return true for "%s"',
            (message) => {
                expect(isTransientErrorMessage(message)).toBe(true)
            },
        )

        it.each(['Internal Server Error', 'Failed', 'Try again'])(
            'should return false for unrecognized message "%s"',
            (message) => {
                expect(isTransientErrorMessage(message)).toBe(false)
            },
        )
    })
})
