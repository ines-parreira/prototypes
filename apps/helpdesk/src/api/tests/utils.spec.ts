import type { AxiosError, AxiosResponse } from 'axios'
import { AxiosHeaders } from 'axios'

import {
    doNotRetry40XErrorsHandler,
    reportingRetryDelayHandler,
    reportingRetryHandler,
} from 'api/utils'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'

describe('utils', () => {
    const response: AxiosResponse = axiosSuccessResponse({})

    const defaultAxiosErrorTemplate: AxiosError = {
        isAxiosError: true,
        response,
        config: {
            headers: new AxiosHeaders(),
        },
        name: 'someName',
        message: 'someMessage',
        toJSON: jest.fn(),
    }

    const axiosErrorWithCode = (code: number): AxiosError => ({
        ...defaultAxiosErrorTemplate,
        response: {
            ...response,
            status: code,
        },
    })

    describe('doNotRetry40XErrorsHandler', () => {
        const axiosErrorWithCode = (code: number): AxiosError => ({
            ...defaultAxiosErrorTemplate,
            response: {
                ...response,
                status: code,
            },
        })

        it.each([
            {
                statusCode: 300,
                failureCount: 0,
                shouldRetry: true,
            },
            {
                statusCode: 400,
                failureCount: 0,
                shouldRetry: false,
            },
            {
                statusCode: 404,
                failureCount: 0,
                shouldRetry: false,
            },
            {
                statusCode: 500,
                failureCount: 0,
                shouldRetry: true,
            },
            {
                statusCode: 500,
                failureCount: 3,
                shouldRetry: false,
            },
        ])(
            `Should retry: $shouldRetry error with status $statusCode and failure count: $failureCount`,
            ({
                statusCode,
                failureCount,
                shouldRetry,
            }: {
                statusCode: number
                failureCount: number
                shouldRetry: boolean
            }) => {
                expect(
                    doNotRetry40XErrorsHandler(
                        failureCount,
                        axiosErrorWithCode(statusCode),
                    ),
                ).toEqual(shouldRetry)
            },
        )
    })

    describe('reportingRetryHandler', () => {
        it.each([
            {
                statusCode: 300,
                failureCount: 0,
                shouldRetry: true,
                description: '3xx redirects should retry (default behavior)',
            },
            {
                statusCode: 400,
                failureCount: 0,
                shouldRetry: false,
                description: '400 Bad Request should not retry',
            },
            {
                statusCode: 404,
                failureCount: 0,
                shouldRetry: false,
                description: '404 Not Found should not retry',
            },
            {
                statusCode: 429,
                failureCount: 0,
                shouldRetry: true,
                description: '429 Rate Limit should retry',
            },
            {
                statusCode: 429,
                failureCount: 2,
                shouldRetry: true,
                description: '429 should retry up to 3 times',
            },
            {
                statusCode: 429,
                failureCount: 3,
                shouldRetry: false,
                description: '429 should stop after 3 attempts',
            },
            {
                statusCode: 500,
                failureCount: 0,
                shouldRetry: true,
                description: '500 Internal Server Error should retry',
            },
            {
                statusCode: 500,
                failureCount: 2,
                shouldRetry: true,
                description: '500 should retry up to 3 times',
            },
            {
                statusCode: 500,
                failureCount: 3,
                shouldRetry: false,
                description: '500 should stop after 3 attempts',
            },
            {
                statusCode: 502,
                failureCount: 0,
                shouldRetry: true,
                description: '502 Bad Gateway should retry',
            },
            {
                statusCode: 503,
                failureCount: 0,
                shouldRetry: true,
                description: '503 Service Unavailable should retry',
            },
            {
                statusCode: 504,
                failureCount: 0,
                shouldRetry: true,
                description: '504 Gateway Timeout should retry',
            },
        ])(
            '$description (status: $statusCode, failureCount: $failureCount)',
            ({
                statusCode,
                failureCount,
                shouldRetry,
            }: {
                statusCode: number
                failureCount: number
                shouldRetry: boolean
                description: string
            }) => {
                expect(
                    reportingRetryHandler(
                        failureCount,
                        axiosErrorWithCode(statusCode),
                    ),
                ).toEqual(shouldRetry)
            },
        )

        it('should retry up to 20 times for 202 status code', () => {
            expect(reportingRetryHandler(0, axiosErrorWithCode(202))).toBe(true)
            expect(reportingRetryHandler(5, axiosErrorWithCode(202))).toBe(true)
            expect(reportingRetryHandler(19, axiosErrorWithCode(202))).toBe(
                true,
            )
        })

        it('should not retry after 20 times for 202 status code', () => {
            expect(reportingRetryHandler(20, axiosErrorWithCode(202))).toBe(
                false,
            )
        })
    })

    describe('reportingRetryDelayHandler', () => {
        it.each([
            { retryIndex: 0, expectedDelay: 1000 },
            { retryIndex: 1, expectedDelay: 2000 },
            { retryIndex: 2, expectedDelay: 4000 },
            { retryIndex: 3, expectedDelay: 8000 },
            { retryIndex: 4, expectedDelay: 16000 },
            { retryIndex: 5, expectedDelay: 16000 },
            { retryIndex: 10, expectedDelay: 16000 },
            { retryIndex: 19, expectedDelay: 16000 },
        ])(
            'should return $expectedDelay ms for retry index $retryIndex with 202 status code',
            ({ retryIndex, expectedDelay }) => {
                expect(
                    reportingRetryDelayHandler(
                        retryIndex,
                        axiosErrorWithCode(202),
                    ),
                ).toBe(expectedDelay)
            },
        )

        it.each([
            { retryIndex: 0, expectedDelay: 1000 },
            { retryIndex: 1, expectedDelay: 2000 },
            { retryIndex: 2, expectedDelay: 4000 },
            { retryIndex: 3, expectedDelay: 8000 },
            { retryIndex: 4, expectedDelay: 8000 },
        ])(
            'should return $expectedDelay ms for retry index $retryIndex with 429 status code',
            ({ retryIndex, expectedDelay }) => {
                expect(
                    reportingRetryDelayHandler(
                        retryIndex,
                        axiosErrorWithCode(429),
                    ),
                ).toBe(expectedDelay)
            },
        )

        it.each([
            { statusCode: 500, retryIndex: 0, expectedDelay: 1000 },
            { statusCode: 500, retryIndex: 1, expectedDelay: 2000 },
            { statusCode: 500, retryIndex: 2, expectedDelay: 4000 },
            { statusCode: 500, retryIndex: 3, expectedDelay: 8000 },
            { statusCode: 502, retryIndex: 0, expectedDelay: 1000 },
            { statusCode: 503, retryIndex: 1, expectedDelay: 2000 },
            { statusCode: 504, retryIndex: 2, expectedDelay: 4000 },
        ])(
            'should return $expectedDelay ms for retry index $retryIndex with $statusCode status code',
            ({ statusCode, retryIndex, expectedDelay }) => {
                expect(
                    reportingRetryDelayHandler(
                        retryIndex,
                        axiosErrorWithCode(statusCode),
                    ),
                ).toBe(expectedDelay)
            },
        )

        it.each([
            { retryIndex: 0, expectedDelay: 1000 },
            { retryIndex: 1, expectedDelay: 2000 },
            { retryIndex: 2, expectedDelay: 4000 },
        ])(
            'should return $expectedDelay ms for retry index $retryIndex with other errors',
            ({ retryIndex, expectedDelay }) => {
                expect(
                    reportingRetryDelayHandler(
                        retryIndex,
                        axiosErrorWithCode(400),
                    ),
                ).toBe(expectedDelay)
            },
        )
    })
})
