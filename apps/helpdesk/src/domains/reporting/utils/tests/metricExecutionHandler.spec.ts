import { assumeMock } from '@repo/testing'
import type { AxiosResponse } from 'axios'
import { AxiosError } from 'axios'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    postReportingV1,
    postReportingV2,
    postReportingV2Query,
    QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS,
} from 'domains/reporting/models/resources'
import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import { compareAndReportQueries } from 'domains/reporting/models/scopes/utils'
import type {
    ReportingParams,
    ReportingResponse,
} from 'domains/reporting/models/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import type { ExecuteMetricConfig } from 'domains/reporting/utils/metricExecutionHandler'
import { metricExecutionHandler } from 'domains/reporting/utils/metricExecutionHandler'
import { reportError } from 'utils/errors'

jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    getLDClient: jest.fn(),
}))

const getNewStatsFeatureFlagMigrationMock = assumeMock(
    getNewStatsFeatureFlagMigration,
)

jest.mock('utils/errors')
const reportErrorMock = assumeMock(reportError)

jest.mock('domains/reporting/models/resources', () => ({
    ...jest.requireActual('domains/reporting/models/resources'),
    postReportingV1: jest.fn(),
    postReportingV2: jest.fn(),
    postReportingV2Query: jest.fn(),
}))

jest.mock('domains/reporting/models/scopes/utils', () => ({
    compareAndReportQueries: jest.fn(),
}))

const postReportingV1Mock = assumeMock(postReportingV1)
const postReportingV2Mock = assumeMock(postReportingV2)
const postReportingV2QueryMock = assumeMock(postReportingV2Query)
const compareAndReportQueriesMock = assumeMock(compareAndReportQueries)

type TestData = number[]

interface OldMetricResponse extends ReportingResponse<TestData> {
    annotation: {
        title: string
        shortTitle: string
        type: string
    }
    data: TestData
    query: any
}

// Mock payloads for testing
const mockOldPayload: ReportingParams = {
    measures: ['count'],
    filters: {},
    dimensions: [],
} as any

const mockNewPayload: BuiltQuery<ScopeMeta> = {
    measures: ['count'],
    filters: {},
    dimensions: [],
} as any

const createMockAxiosResponse = <T>(data: T): AxiosResponse<T> => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
})

const createMockOldResponse = (value = 42): AxiosResponse<OldMetricResponse> =>
    createMockAxiosResponse({
        annotation: {
            title: 'Test Metric',
            shortTitle: 'Test',
            type: 'metric',
        },
        data: [value],
        query: {
            metricName: 'test-metric',
            measures: ['count'],
        },
    })

const createMockNextQueryResponse = () =>
    createMockAxiosResponse({
        data: {
            metricName: 'test-metric',
            measures: ['count'],
        },
    })

describe('metricExecutionHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('off mode', () => {
        beforeEach(() => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('off')
        })

        it('should call only the old API and return its response', async () => {
            postReportingV1Mock.mockResolvedValue(createMockOldResponse(123))

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
            }

            const result = await metricExecutionHandler(config)

            expect(postReportingV1Mock).toHaveBeenCalledTimes(1)
            expect(postReportingV1Mock).toHaveBeenCalledWith(mockOldPayload)
            expect((result.data as any).data[0]).toBe(123)
            if ('annotation' in result.data) {
                expect(result.data.annotation.title).toBe('Test Metric')
            }
        })

        it('should propagate errors from old API', async () => {
            postReportingV1Mock.mockRejectedValue(new Error('Old API failed'))

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
            }

            await expect(metricExecutionHandler(config)).rejects.toThrow(
                'Old API failed',
            )
        })
    })

    describe('shadow mode', () => {
        beforeEach(() => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('shadow')
        })

        it('should call both APIs and return old response', async () => {
            postReportingV1Mock.mockResolvedValue(createMockOldResponse(100))
            postReportingV2QueryMock.mockResolvedValue(
                createMockNextQueryResponse() as any,
            )

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
                newPayload: mockNewPayload,
            }

            const result = await metricExecutionHandler(config)

            expect(postReportingV1Mock).toHaveBeenCalledTimes(1)
            expect(postReportingV1Mock).toHaveBeenCalledWith(mockOldPayload)
            expect(postReportingV2QueryMock).toHaveBeenCalledTimes(1)
            expect(postReportingV2QueryMock).toHaveBeenCalledWith(
                mockNewPayload,
            )
            expect(compareAndReportQueriesMock).toHaveBeenCalledWith(
                'test-metric',
                (result.data as any).query,
                createMockNextQueryResponse().data,
            )
            expect((result.data as any).data[0]).toBe(100)
            if ('annotation' in result.data) {
                expect(result.data.annotation.title).toBe('Test Metric')
            }
        })

        it('should propagate old API errors', async () => {
            postReportingV1Mock.mockRejectedValue(new Error('Old API failed'))
            postReportingV2QueryMock.mockResolvedValue(
                createMockNextQueryResponse() as any,
            )

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
                newPayload: mockNewPayload,
            }

            await expect(metricExecutionHandler(config)).rejects.toThrow(
                'Old API failed',
            )
        })

        it('should return old result when new API fails and log error', async () => {
            postReportingV1Mock.mockResolvedValue(createMockOldResponse())
            postReportingV2QueryMock.mockRejectedValue(
                new Error('New API failed'),
            )

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
                newPayload: mockNewPayload,
            }

            const result = await metricExecutionHandler(config)

            expect((result.data as any).data[0]).toBe(42)
            expect(reportErrorMock).toHaveBeenCalledWith(
                new Error(
                    'Next function failed in shadow mode for test-metric: New API failed',
                ),
                {
                    extra: {
                        metricName: 'test-metric',
                        reason: '{}',
                        payload: JSON.stringify(mockNewPayload),
                    },
                    tags: { team: 'crm-reporting' },
                },
                ['next_failed_shadow', 'test-metric', 'New API failed'],
            )
        })

        it('should fallback to off mode when new payload is missing', async () => {
            postReportingV1Mock.mockResolvedValue(createMockOldResponse())

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
            }

            const result = await metricExecutionHandler(config)

            expect(reportErrorMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message:
                        'Missing required functions for metric test-metric in shadow mode: newPayload',
                }),
                expect.objectContaining({
                    extra: { metricName: 'test-metric' },
                }),
            )
            expect(postReportingV1Mock).toHaveBeenCalledTimes(1)
            expect((result.data as any).data[0]).toBe(42)
        })
    })

    describe('live mode', () => {
        beforeEach(() => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('live')
        })

        it('should call both APIs and return new response', async () => {
            postReportingV1Mock.mockResolvedValue(createMockOldResponse(100))
            postReportingV2Mock.mockResolvedValue(createMockOldResponse(200))
            postReportingV2QueryMock.mockResolvedValue(
                createMockNextQueryResponse() as any,
            )

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
                newPayload: mockNewPayload,
            }

            const result = await metricExecutionHandler(config)

            expect(postReportingV1Mock).toHaveBeenCalledTimes(1)
            expect(postReportingV2Mock).toHaveBeenCalledTimes(1)
            expect(postReportingV2QueryMock).toHaveBeenCalledTimes(1)
            expect((result.data as any).data[0]).toBe(200)
        })

        it('should propagate 202 errors without reporting to Sentry', async () => {
            postReportingV1Mock.mockResolvedValue(createMockOldResponse())
            const axiosError = new AxiosError('Query accepted but not ready')
            axiosError.response = {
                status: QUERY_ACCEPTED_BUT_RESPONSE_NOT_READY_STATUS,
                data: {},
                statusText: 'Accepted',
                headers: {},
                config: {} as any,
            }
            postReportingV2Mock.mockRejectedValue(axiosError)
            postReportingV2QueryMock.mockResolvedValue(
                createMockNextQueryResponse() as any,
            )

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
                newPayload: mockNewPayload,
            }

            await expect(metricExecutionHandler(config)).rejects.toThrow(
                axiosError,
            )
            expect(reportErrorMock).not.toHaveBeenCalled()
        })

        it('should propagate 429 errors without reporting to Sentry', async () => {
            postReportingV1Mock.mockResolvedValue(createMockOldResponse())
            const axiosError = new AxiosError('Too many requests')
            axiosError.response = {
                status: 429,
                data: { error: { msg: 'Rate limit exceeded' } },
                statusText: 'Too Many Requests',
                headers: {},
                config: {} as any,
            }
            postReportingV2Mock.mockRejectedValue(axiosError)
            postReportingV2QueryMock.mockResolvedValue(
                createMockNextQueryResponse() as any,
            )

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
                newPayload: mockNewPayload,
            }

            await expect(metricExecutionHandler(config)).rejects.toThrow(
                axiosError,
            )
            expect(reportErrorMock).not.toHaveBeenCalled()
        })

        it.each([
            { statusCode: 500, statusText: 'Internal Server Error' },
            { statusCode: 502, statusText: 'Bad Gateway' },
            { statusCode: 503, statusText: 'Service Unavailable' },
            { statusCode: 504, statusText: 'Gateway Timeout' },
        ])(
            'should propagate $statusCode errors without reporting to Sentry',
            async ({ statusCode, statusText }) => {
                postReportingV1Mock.mockResolvedValue(createMockOldResponse())
                const axiosError = new AxiosError('Server error')
                axiosError.response = {
                    status: statusCode,
                    data: {},
                    statusText,
                    headers: {},
                    config: {} as any,
                }
                postReportingV2Mock.mockRejectedValue(axiosError)
                postReportingV2QueryMock.mockResolvedValue(
                    createMockNextQueryResponse() as any,
                )

                const config: ExecuteMetricConfig = {
                    metricName: 'test-metric',
                    oldPayload: mockOldPayload,
                    newPayload: mockNewPayload,
                }

                await expect(metricExecutionHandler(config)).rejects.toThrow(
                    axiosError,
                )
                expect(reportErrorMock).not.toHaveBeenCalled()
            },
        )

        it('should propagate Network Error without reporting to Sentry', async () => {
            postReportingV1Mock.mockResolvedValue(createMockOldResponse())
            const axiosError = new AxiosError('Network Error')
            postReportingV2Mock.mockRejectedValue(axiosError)
            postReportingV2QueryMock.mockResolvedValue(
                createMockNextQueryResponse() as any,
            )

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
                newPayload: mockNewPayload,
            }

            await expect(metricExecutionHandler(config)).rejects.toThrow(
                axiosError,
            )
            expect(reportErrorMock).not.toHaveBeenCalled()
        })

        it('should propagate 401 errors without reporting to Sentry', async () => {
            postReportingV1Mock.mockResolvedValue(createMockOldResponse())
            const axiosError = new AxiosError('Unauthorized')
            axiosError.response = {
                status: 401,
                data: { error: { msg: 'Authentication required' } },
                statusText: 'Unauthorized',
                headers: {},
                config: {} as any,
            }
            postReportingV2Mock.mockRejectedValue(axiosError)
            postReportingV2QueryMock.mockResolvedValue(
                createMockNextQueryResponse() as any,
            )

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
                newPayload: mockNewPayload,
            }

            await expect(metricExecutionHandler(config)).rejects.toThrow(
                axiosError,
            )
            expect(reportErrorMock).not.toHaveBeenCalled()
        })

        it('should propagate 419 errors without reporting to Sentry', async () => {
            postReportingV1Mock.mockResolvedValue(createMockOldResponse())
            const axiosError = new AxiosError('Authentication Timeout')
            axiosError.response = {
                status: 419,
                data: { error: { msg: 'Session expired' } },
                statusText: 'Authentication Timeout',
                headers: {},
                config: {} as any,
            }
            postReportingV2Mock.mockRejectedValue(axiosError)
            postReportingV2QueryMock.mockResolvedValue(
                createMockNextQueryResponse() as any,
            )

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
                newPayload: mockNewPayload,
            }

            await expect(metricExecutionHandler(config)).rejects.toThrow(
                axiosError,
            )
            expect(reportErrorMock).not.toHaveBeenCalled()
        })

        it('should still report 4xx errors (except 429) to Sentry', async () => {
            postReportingV1Mock.mockResolvedValue(createMockOldResponse())
            const axiosError = new AxiosError('Bad request')
            axiosError.response = {
                status: 400,
                data: { error: { msg: 'Invalid query parameters' } },
                statusText: 'Bad Request',
                headers: {},
                config: {} as any,
            }
            postReportingV2Mock.mockRejectedValue(axiosError)
            postReportingV2QueryMock.mockResolvedValue(
                createMockNextQueryResponse() as any,
            )

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
                newPayload: mockNewPayload,
            }

            await expect(metricExecutionHandler(config)).rejects.toThrow(
                axiosError,
            )
            expect(reportErrorMock).toHaveBeenCalledWith(
                expect.any(Error),
                expect.objectContaining({
                    extra: expect.objectContaining({
                        metricName: 'test-metric',
                    }),
                    tags: { team: 'crm-reporting' },
                }),
                expect.any(Array),
            )
        })

        it('should report and propagate errors from v2 API', async () => {
            postReportingV1Mock.mockResolvedValue(createMockOldResponse())
            const axiosError = new AxiosError('Forbidden')
            axiosError.response = {
                status: 403,
                data: {},
                statusText: 'Forbidden',
                headers: {},
                config: {} as any,
            }
            postReportingV2Mock.mockRejectedValue(axiosError)
            postReportingV2QueryMock.mockResolvedValue(
                createMockNextQueryResponse() as any,
            )

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
                newPayload: mockNewPayload,
            }

            await expect(metricExecutionHandler(config)).rejects.toThrow(
                axiosError,
            )
            expect(reportErrorMock).toHaveBeenCalledWith(
                expect.any(Error),
                expect.objectContaining({
                    extra: expect.objectContaining({
                        metricName: 'test-metric',
                    }),
                    tags: { team: 'crm-reporting' },
                }),
                expect.any(Array),
            )
            // Verify the error message
            const errorArg = reportErrorMock.mock.calls[0][0] as Error
            expect(errorArg.message).toBe(
                'Next function failed in live mode for test-metric: Forbidden',
            )
        })
    })

    describe('complete mode', () => {
        beforeEach(() => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('complete')
        })

        it('should call new API and return its response', async () => {
            postReportingV2Mock.mockResolvedValue(
                createMockOldResponse(300) as any,
            )

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
                newPayload: mockNewPayload,
            }

            const result = await metricExecutionHandler(config)

            expect(postReportingV2Mock).toHaveBeenCalledTimes(1)
            expect(postReportingV2Mock).toHaveBeenCalledWith(mockNewPayload)
            expect((result.data as any).data[0]).toBe(300)
        })

        it('should propagate new API errors', async () => {
            postReportingV2Mock.mockRejectedValue(new Error('New API failed'))

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
                newPayload: mockNewPayload,
            }

            await expect(metricExecutionHandler(config)).rejects.toThrow(
                'New API failed',
            )
        })

        it('should fallback to off mode when new payload is missing', async () => {
            postReportingV1Mock.mockResolvedValue(createMockOldResponse())

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
            }

            const result = await metricExecutionHandler(config)

            expect(reportErrorMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message:
                        'Missing required functions for metric test-metric in complete mode: newPayload',
                }),
                expect.objectContaining({
                    extra: { metricName: 'test-metric' },
                }),
            )
            expect(postReportingV1Mock).toHaveBeenCalledTimes(1)
            expect((result.data as any).data[0]).toBe(42)
        })
    })

    describe('configuration validation with fallback', () => {
        it('should fallback to off mode when shadow mode config is invalid', async () => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('shadow')

            postReportingV1Mock.mockResolvedValue(createMockOldResponse(500))

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
            }

            const result = await metricExecutionHandler(config)

            expect(reportErrorMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message:
                        'Missing required functions for metric test-metric in shadow mode: newPayload',
                }),
                expect.objectContaining({
                    extra: { metricName: 'test-metric' },
                }),
            )
            expect(postReportingV1Mock).toHaveBeenCalledTimes(1)
            expect((result.data as any).data[0]).toBe(500)
        })

        it('should fallback to off mode when complete mode config is invalid', async () => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('complete')
            postReportingV1Mock.mockResolvedValue(createMockOldResponse(600))

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
            }

            const result = await metricExecutionHandler(config)

            expect(reportErrorMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message:
                        'Missing required functions for metric test-metric in complete mode: newPayload',
                }),
                expect.objectContaining({
                    extra: { metricName: 'test-metric' },
                }),
            )
            expect(postReportingV1Mock).toHaveBeenCalledTimes(1)
            expect((result.data as any).data[0]).toBe(600)
        })

        it('should fallback to complete mode when live mode config is invalid', async () => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('live')
            postReportingV2Mock.mockResolvedValue(createMockOldResponse(300))

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                newPayload: mockNewPayload,
            }

            const result = await metricExecutionHandler(config)

            expect(postReportingV2Mock).toHaveBeenCalledTimes(1)
            expect((result.data as any).data[0]).toBe(300)
        })
    })

    describe('cursor pagination validation', () => {
        it('should log error when cursor pagination is returned for non-whitelisted metric in live mode', async () => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('live')

            const responseWithCursor = createMockOldResponse(300)
            ;(responseWithCursor.data as any).meta = {
                next_cursor: 'cursor_abc123',
            }

            postReportingV2Mock.mockResolvedValue(responseWithCursor as any)
            postReportingV2QueryMock.mockResolvedValue(
                createMockNextQueryResponse() as any,
            )

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
                newPayload: { ...mockNewPayload, metricName: 'test-metric' },
            }

            await metricExecutionHandler(config)

            expect(reportErrorMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message:
                        'Backend returned unexpected cursor pagination for metric test-metric',
                }),
                expect.objectContaining({
                    tags: { team: SentryTeam.CRM_REPORTING },
                    extra: expect.objectContaining({
                        metricName: 'test-metric',
                        cursor: 'cursor_abc123',
                        stage: 'live',
                    }),
                }),
                ['pagination', 'test-metric'],
            )
        })

        it('should log error when cursor pagination is returned for non-whitelisted metric in complete mode', async () => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('complete')

            const responseWithCursor = createMockOldResponse(300)
            ;(responseWithCursor.data as any).meta = {
                next_cursor: 'cursor_xyz789',
            }

            postReportingV2Mock.mockResolvedValue(responseWithCursor as any)

            const config: ExecuteMetricConfig = {
                metricName: METRIC_NAMES.VOICE_CALL_COUNT,
                newPayload: {
                    ...mockNewPayload,
                    metricName: METRIC_NAMES.VOICE_CALL_COUNT,
                },
            }

            await metricExecutionHandler(config)

            expect(reportErrorMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message:
                        'Backend returned unexpected cursor pagination for metric voice-call-count',
                }),
                expect.objectContaining({
                    tags: { team: SentryTeam.CRM_REPORTING },
                    extra: expect.objectContaining({
                        metricName: METRIC_NAMES.VOICE_CALL_COUNT,
                        cursor: 'cursor_xyz789',
                        stage: 'complete',
                    }),
                }),
                ['pagination', 'voice-call-count'],
            )
        })

        it('should NOT log error when cursor pagination is returned for whitelisted metric', async () => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('live')

            const responseWithCursor = createMockOldResponse(300)
            ;(responseWithCursor.data as any).meta = {
                next_cursor: 'cursor_abc123',
            }

            postReportingV2Mock.mockResolvedValue(responseWithCursor as any)
            postReportingV2QueryMock.mockResolvedValue(
                createMockNextQueryResponse() as any,
            )

            const config: ExecuteMetricConfig = {
                metricName: METRIC_NAMES.VOICE_CALL_LIST,
                oldPayload: mockOldPayload,
                newPayload: {
                    ...mockNewPayload,
                    metricName: METRIC_NAMES.VOICE_CALL_LIST,
                },
            }

            await metricExecutionHandler(config)

            // reportErrorMock should only be called if there are other errors, not for cursor validation
            // Filter to check only cursor-related errors
            const cursorRelatedCalls = reportErrorMock.mock.calls.filter(
                (call) =>
                    call[0] &&
                    typeof call[0] === 'object' &&
                    'message' in call[0] &&
                    typeof call[0].message === 'string' &&
                    call[0].message.includes('cursor pagination'),
            )
            expect(cursorRelatedCalls).toHaveLength(0)
        })

        it('should NOT log error when cursor is null', async () => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('complete')

            const responseWithNullCursor = createMockOldResponse(300)
            ;(responseWithNullCursor.data as any).meta = { next_cursor: null }

            postReportingV2Mock.mockResolvedValue(responseWithNullCursor as any)

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                newPayload: { ...mockNewPayload, metricName: 'test-metric' },
            }

            await metricExecutionHandler(config)

            const cursorRelatedCalls = reportErrorMock.mock.calls.filter(
                (call) =>
                    call[0] &&
                    typeof call[0] === 'object' &&
                    'message' in call[0] &&
                    typeof call[0].message === 'string' &&
                    call[0].message.includes('cursor pagination'),
            )
            expect(cursorRelatedCalls).toHaveLength(0)
        })

        it('should NOT validate cursor in shadow mode because data is not loaded', async () => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('shadow')
            postReportingV1Mock.mockResolvedValue(createMockOldResponse(100))
            postReportingV2QueryMock.mockResolvedValue(
                createMockNextQueryResponse() as any,
            )

            const config: ExecuteMetricConfig = {
                metricName: 'test-metric',
                oldPayload: mockOldPayload,
                newPayload: { ...mockNewPayload, metricName: 'test-metric' },
            }

            await metricExecutionHandler(config)

            // Should not call reportError for cursor validation in shadow mode
            const cursorRelatedCalls = reportErrorMock.mock.calls.filter(
                (call) =>
                    call[0] &&
                    typeof call[0] === 'object' &&
                    'message' in call[0] &&
                    typeof call[0].message === 'string' &&
                    call[0].message.includes('cursor pagination'),
            )
            expect(cursorRelatedCalls).toHaveLength(0)
        })
    })
})
