import { assumeMock } from '@repo/testing'
import { AxiosResponse } from 'axios'

import { resolveMetricFlag } from 'core/flags/utils/newApiMetricFlags'
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

// Test data types
interface OldMetricResponse {
    value: number
    timestamp: string
    metadata: {
        source: 'old-api'
        version: '1.0'
    }
}

interface NextMetricResponse {
    result: number
    createdAt: string
    info: {
        source: 'new-api'
        version: '2.0'
        additionalData: string
    }
}

// Helper functions
const createMockAxiosResponse = <T>(data: T): AxiosResponse<T> => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
})

const createMockOldResponse = (value = 42): AxiosResponse<OldMetricResponse> =>
    createMockAxiosResponse({
        value,
        timestamp: '2023-01-01T00:00:00Z',
        metadata: {
            source: 'old-api',
            version: '1.0',
        },
    })

const createMockNextResponse = (
    result = 42,
): AxiosResponse<NextMetricResponse> =>
    createMockAxiosResponse({
        result,
        createdAt: '2023-01-01T00:00:00Z',
        info: {
            source: 'new-api',
            version: '2.0',
            additionalData: 'extra-info',
        },
    })

const mockNormalize = jest
    .fn()
    .mockImplementation((nextResponse: NextMetricResponse) => ({
        value: nextResponse.result,
        timestamp: nextResponse.createdAt,
        metadata: {
            source: 'old-api',
            version: '1.0',
        },
    }))

const mockValidate = jest
    .fn()
    .mockImplementation(
        (oldResponse: OldMetricResponse, nextResponse: NextMetricResponse) => {
            if (oldResponse.value !== nextResponse.result) {
                throw new Error(
                    `Mismatch detected: old=${oldResponse.value}, next=${nextResponse.result}`,
                )
            }
        },
    )

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
            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                old: mockOld,
            }

            const result = await executeMetric(config)

            expect(mockOld).toHaveBeenCalledTimes(1)
            expect(result.data.value).toBe(123)
            expect(result.data.metadata.source).toBe('old-api')
        })

        it('should propagate errors from old function', async () => {
            const mockOld = jest
                .fn()
                .mockRejectedValue(new Error('Old API failed'))
            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                old: mockOld,
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Old API failed',
            )
        })

        it('should throw error when old function is missing', async () => {
            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
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
            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                next: mockNext,
                normalize: mockNormalize,
            }

            const result = await executeMetric(config)

            expect(mockNext).toHaveBeenCalledTimes(1)
            expect(mockNormalize).toHaveBeenCalledTimes(1)
            expect(result.data.value).toBe(456)
            expect(result.data.metadata.source).toBe('old-api') // Normalized format
        })

        it('should propagate errors from next function', async () => {
            const mockNext = jest
                .fn()
                .mockRejectedValue(new Error('Next API failed'))
            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                next: mockNext,
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
            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                next: mockNext,
                normalize: mockNormalizeError,
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Normalization failed',
            )
        })

        it('should throw error when next function is missing', async () => {
            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                normalize: mockNormalize,
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Missing required functions for metric test-metric in complete mode: next',
            )
        })

        it('should throw error when normalize function is missing', async () => {
            const mockNext = jest
                .fn()
                .mockResolvedValue(createMockNextResponse())
            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                next: mockNext,
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
                .mockResolvedValue(createMockNextResponse(100))
            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                old: mockOld,
                next: mockNext,
                normalize: mockNormalize,
                validate: mockValidate,
            }

            const result = await executeMetric(config)

            expect(mockOld).toHaveBeenCalledTimes(1)
            expect(mockNext).toHaveBeenCalledTimes(1)
            expect(mockValidate).toHaveBeenCalledWith(
                result.data,
                createMockNextResponse(100).data,
            )
            expect(result.data.value).toBe(100)
            expect(result.data.metadata.source).toBe('old-api')
        })

        it('should propagate old function errors', async () => {
            const mockOld = jest
                .fn()
                .mockRejectedValue(new Error('Old API failed'))
            const mockNext = jest
                .fn()
                .mockResolvedValue(createMockNextResponse())
            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                old: mockOld,
                next: mockNext,
                normalize: mockNormalize,
                validate: mockValidate,
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
            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                old: mockOld,
                next: mockNext,
                normalize: mockNormalize,
                validate: mockValidate,
            }

            const result = await executeMetric(config)

            expect(result.data.value).toBe(42)
            expect(reportErrorMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message:
                        'Next function failed in shadow mode for test-metric: Next API failed',
                }),
            )
        })

        it('should throw error when required functions are missing', async () => {
            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                old: jest.fn(),
                next: jest.fn(),
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
            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                old: mockOld,
                next: mockNext,
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
            expect(result.data.value).toBe(300) // From normalized next response
            expect(result.data.metadata.source).toBe('old-api') // Normalized format
        })

        it('should propagate next function errors', async () => {
            const mockOld = jest.fn().mockResolvedValue(createMockOldResponse())
            const mockNext = jest
                .fn()
                .mockRejectedValue(new Error('Next API failed'))
            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                old: mockOld,
                next: mockNext,
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
            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                old: mockOld,
                next: mockNext,
                normalize: mockNormalize,
                validate: mockValidate,
            }

            const result = await executeMetric(config)

            expect(result.data.value).toBe(400)
            expect(reportErrorMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message:
                        'Old function failed in live mode for test-metric: Old API failed',
                }),
            )
        })

        it('should throw error when required functions are missing', async () => {
            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                old: jest.fn(),
                next: jest.fn(),
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
            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                old: mockOld,
            }

            await executeMetric(config)

            expect(resolveMetricFlagMock).toHaveBeenCalledWith('test-metric')
            expect(getMigrationModeMock).toHaveBeenCalledWith('resolved-flag')
        })

        it('should handle flag resolution errors', async () => {
            resolveMetricFlagMock.mockImplementation(() => {
                throw new Error('Flag resolution failed')
            })

            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                old: jest.fn(),
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Flag resolution failed',
            )
        })

        it('should handle unknown migration mode', async () => {
            resolveMetricFlagMock.mockReturnValue('test-flag' as any)
            getMigrationModeMock.mockResolvedValue('unknown' as any)

            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                old: jest.fn(),
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Unknown migration mode: unknown',
            )
        })

        it('should throw error for gibberish migration mode', async () => {
            resolveMetricFlagMock.mockReturnValue('test-flag' as any)
            getMigrationModeMock.mockResolvedValue('gibberish' as any)

            const config: ExecuteMetricConfig<
                OldMetricResponse,
                NextMetricResponse
            > = {
                name: 'test-metric',
                old: jest.fn(),
            }

            await expect(executeMetric(config)).rejects.toThrow(
                'Unknown migration mode: gibberish',
            )
        })
    })
})
