import { assumeMock } from '@repo/testing'
import { AxiosResponse } from 'axios'

import { resolveMetricFlag } from 'core/flags/utils/newApiMetricFlags'
import {
    ReportingResponse,
    ReportingV2Response,
} from 'domains/reporting/models/types'
import {
    executeMetric,
    ExecuteMetricConfig,
} from 'domains/reporting/utils/executeMetric'
import { getMigrationMode } from 'domains/reporting/utils/utils'
import { reportError } from 'utils/errors'

jest.mock('core/flags/utils/newApiMetricFlags')

jest.mock('domains/reporting/utils/utils', () => ({
    getMigrationMode: jest.fn(),
}))

const resolveMetricFlagMock = assumeMock(resolveMetricFlag)
const getMigrationModeMock = assumeMock(getMigrationMode)

jest.mock('utils/errors')
const reportErrorMock = assumeMock(reportError)

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

interface NextMetricResponse extends ReportingV2Response<TestData> {
    data: TestData
}

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

const createMockNextResponse = (
    result = 42,
): AxiosResponse<NextMetricResponse> =>
    createMockAxiosResponse({
        data: [result],
    })

const createMockNextQueryResponse = () => ({
    data: {
        metricName: 'test-metric',
        measures: ['count'],
    },
})

const mockNormalize = jest
    .fn()
    .mockImplementation((nextResponse: NextMetricResponse) => ({
        annotation: {
            title: 'Test Metric',
            shortTitle: 'Test',
            type: 'metric',
        },
        data: nextResponse.data,
        query: {
            metricName: 'test-metric',
            measures: ['count'],
        },
    }))

const mockValidate = jest
    .fn()
    .mockImplementation(
        (oldResponse: OldMetricResponse, nextResponse: NextMetricResponse) => {
            if (oldResponse.data[0] !== nextResponse.data[0]) {
                throw new Error(
                    `Mismatch detected: old=${oldResponse.data[0]}, next=${nextResponse.data[0]}`,
                )
            }
        },
    )

const mockValidateQuery = jest.fn().mockImplementation(() => true)

describe('executeMetric', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('off mode', () => {
        beforeEach(() => {
            resolveMetricFlagMock.mockReturnValue('test-flag' as any)
            getMigrationModeMock.mockResolvedValue('off')
        })

        it('should call only the old function and return its response', async () => {
            const mockOld = jest
                .fn()
                .mockResolvedValue(createMockOldResponse(123))
            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                oldApi: mockOld,
            }

            const result = await executeMetric(config)

            expect(mockOld).toHaveBeenCalledTimes(1)
            expect(result.data.data[0]).toBe(123)
            if ('annotation' in result.data) {
                expect(result.data.annotation.title).toBe('Test Metric')
            }
        })

        it('should propagate errors from old function', async () => {
            const mockOld = jest
                .fn()
                .mockRejectedValue(new Error('Old API failed'))
            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                oldApi: mockOld,
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Old API failed',
            )
        })

        it('should throw error when old function is missing', async () => {
            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Missing required functions for metric test-metric in off mode: old',
            )
        })
    })

    describe('complete mode', () => {
        beforeEach(() => {
            resolveMetricFlagMock.mockReturnValue('test-flag' as any)
            getMigrationModeMock.mockResolvedValue('complete')
        })

        it('should call next function, normalize response, and return normalized result', async () => {
            const mockNext = jest
                .fn()
                .mockResolvedValue(createMockNextResponse(456))
            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                newApi: mockNext,
                normalize: mockNormalize,
            }

            const result = await executeMetric(config)

            expect(mockNext).toHaveBeenCalledTimes(1)
            expect(mockNormalize).toHaveBeenCalledTimes(1)
            expect(result.data.data[0]).toBe(456)
            if ('annotation' in result.data) {
                expect(result.data.annotation.title).toBe('Test Metric') // Normalized format
            }
        })

        it('should propagate errors from next function', async () => {
            const mockNext = jest
                .fn()
                .mockRejectedValue(new Error('Next API failed'))
            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                newApi: mockNext,
                normalize: mockNormalize,
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Next API failed',
            )
        })

        it('should propagate errors from normalize function', async () => {
            const mockNext = jest
                .fn()
                .mockResolvedValue(createMockNextResponse())
            const mockNormalizeError = jest.fn().mockImplementation(() => {
                throw new Error('Normalization failed')
            })
            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                newApi: mockNext,
                normalize: mockNormalizeError,
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Normalization failed',
            )
        })

        it('should throw error when next function is missing', async () => {
            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                normalize: mockNormalize,
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Missing required functions for metric test-metric in complete mode: newApi',
            )
        })

        it('should throw error when normalize function is missing', async () => {
            const mockNext = jest
                .fn()
                .mockResolvedValue(createMockNextResponse())
            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                newApi: mockNext,
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Missing required functions for metric test-metric in complete mode: normalize',
            )
        })
    })

    describe('shadow mode', () => {
        beforeEach(() => {
            resolveMetricFlagMock.mockReturnValue('test-flag' as any)
            getMigrationModeMock.mockResolvedValue('shadow')
        })

        it('should call both functions and return old response', async () => {
            const mockOld = jest
                .fn()
                .mockResolvedValue(createMockOldResponse(100))
            const mockNext = jest
                .fn()
                .mockResolvedValue(createMockNextQueryResponse())
            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                oldApi: mockOld,
                newQueryApi: mockNext,
                validateQuery: mockValidateQuery,
            }

            const result = await executeMetric(config)

            expect(mockOld).toHaveBeenCalledTimes(1)
            expect(mockNext).toHaveBeenCalledTimes(1)
            expect(mockValidateQuery).toHaveBeenCalledWith(
                (result.data as any).query,
                createMockNextQueryResponse().data,
            )
            expect(result.data.data[0]).toBe(100)
            if ('annotation' in result.data) {
                expect(result.data.annotation.title).toBe('Test Metric')
            }
        })

        it('should propagate old function errors', async () => {
            const mockOld = jest
                .fn()
                .mockRejectedValue(new Error('Old API failed'))
            const mockNext = jest
                .fn()
                .mockResolvedValue(createMockNextQueryResponse())
            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                oldApi: mockOld,
                newQueryApi: mockNext,
                validateQuery: mockValidateQuery,
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Old API failed',
            )
        })

        it('should return old result when next function fails and log error', async () => {
            const mockOld = jest.fn().mockResolvedValue(createMockOldResponse())
            const mockNext = jest
                .fn()
                .mockRejectedValue(new Error('Next API failed'))
            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                oldApi: mockOld,
                newQueryApi: mockNext,
                validateQuery: mockValidateQuery,
            }

            const result = await executeMetric(config)

            expect(result.data.data[0]).toBe(42)
            expect(reportErrorMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message:
                        'Next function failed in shadow mode for test-metric: Next API failed',
                }),
            )
        })

        it('should throw error when required functions are missing', async () => {
            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                oldApi: jest.fn(),
                newQueryApi: jest.fn(),
                // Missing validate function
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Missing required functions for metric test-metric in shadow mode: validate',
            )
        })
    })

    describe('live mode', () => {
        beforeEach(() => {
            resolveMetricFlagMock.mockReturnValue('test-flag' as any)
            getMigrationModeMock.mockResolvedValue('live')
        })

        it('should call both functions and return normalized next response', async () => {
            const mockOld = jest
                .fn()
                .mockResolvedValue(createMockOldResponse(300))
            const mockNext = jest
                .fn()
                .mockResolvedValue(createMockNextResponse(300))
            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                oldApi: mockOld,
                newApi: mockNext,
                normalize: mockNormalize,
                validate: mockValidate,
            }

            const result = await executeMetric(config)

            expect(mockOld).toHaveBeenCalledTimes(1)
            expect(mockNext).toHaveBeenCalledTimes(1)
            expect(mockNormalize).toHaveBeenCalledTimes(1)
            expect(mockValidate).toHaveBeenCalledWith(
                createMockOldResponse(300).data,
                createMockNextResponse(300).data,
            )
            expect(result.data.data[0]).toBe(300) // From normalized next response
            if ('annotation' in result.data) {
                expect(result.data.annotation.title).toBe('Test Metric') // Normalized format
            }
        })

        it('should propagate next function errors', async () => {
            const mockOld = jest.fn().mockResolvedValue(createMockOldResponse())
            const mockNext = jest
                .fn()
                .mockRejectedValue(new Error('Next API failed'))
            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                oldApi: mockOld,
                newApi: mockNext,
                normalize: mockNormalize,
                validate: mockValidate,
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Next API failed',
            )
        })

        it('should return normalized next result when old function fails and log error', async () => {
            const mockOld = jest
                .fn()
                .mockRejectedValue(new Error('Old API failed'))
            const mockNext = jest
                .fn()
                .mockResolvedValue(createMockNextResponse(400))
            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                oldApi: mockOld,
                newApi: mockNext,
                normalize: mockNormalize,
                validate: mockValidate,
            }

            const result = await executeMetric(config)

            expect(result.data.data[0]).toBe(400)
            expect(reportErrorMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message:
                        'Old function failed in live mode for test-metric: Old API failed',
                }),
            )
        })

        it('should throw error when required functions are missing', async () => {
            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                oldApi: jest.fn(),
                newApi: jest.fn(),
                normalize: mockNormalize,
                // Missing validate function
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Missing required functions for metric test-metric in live mode: validate',
            )
        })
    })

    describe('feature flag integration', () => {
        it('should resolve metric flag and get migration mode', async () => {
            resolveMetricFlagMock.mockReturnValue('resolved-flag' as any)
            getMigrationModeMock.mockResolvedValue('off')

            const mockOld = jest.fn().mockResolvedValue(createMockOldResponse())
            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                oldApi: mockOld,
            }

            await executeMetric(config)

            expect(resolveMetricFlagMock).toHaveBeenCalledWith('test-metric')
            expect(getMigrationModeMock).toHaveBeenCalledWith('resolved-flag')
        })

        it('should handle flag resolution errors', async () => {
            resolveMetricFlagMock.mockImplementation(() => {
                throw new Error('Flag resolution failed')
            })

            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                oldApi: jest.fn(),
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Flag resolution failed',
            )
        })

        it('should handle unknown migration mode', async () => {
            resolveMetricFlagMock.mockReturnValue('test-flag' as any)
            getMigrationModeMock.mockResolvedValue('unknown' as any)

            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                oldApi: jest.fn(),
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Unknown migration mode: unknown',
            )
        })

        it('should throw error for gibberish migration mode', async () => {
            resolveMetricFlagMock.mockReturnValue('test-flag' as any)
            getMigrationModeMock.mockResolvedValue('gibberish' as any)

            const config: ExecuteMetricConfig<TestData> = {
                metricName: 'test-metric',
                oldApi: jest.fn(),
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Unknown migration mode: gibberish',
            )
        })
    })
})
