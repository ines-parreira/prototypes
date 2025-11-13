import { assumeMock } from '@repo/testing'
import { AxiosResponse } from 'axios'

import {
    postReportingV1,
    postReportingV2,
    postReportingV2Query,
} from 'domains/reporting/models/resources'
import { BuiltQuery, ScopeMeta } from 'domains/reporting/models/scopes/scope'
import { compareAndReportQueries } from 'domains/reporting/models/scopes/utils'
import {
    ReportingParams,
    ReportingResponse,
} from 'domains/reporting/models/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import {
    ExecuteMetricConfig,
    metricExecutionHandler,
} from 'domains/reporting/utils/metricExecutionHandler'
import { reportError } from 'utils/errors'

jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')

jest.mock('utils/launchDarkly', () => ({
    getLDClient: jest.fn(),
}))

const getNewStatsFeatureFlagMigrationMock = assumeMock(
    getNewStatsFeatureFlagMigration,
)

jest.mock('utils/errors')
const reportErrorMock = assumeMock(reportError)

jest.mock('domains/reporting/models/resources', () => ({
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
                    extra: { metricName: 'test-metric', reason: '{}' },
                    tags: { team: 'crm-reporting' },
                },
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

        it('should fallback to off mode when live mode config is invalid', async () => {
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
    })
})
