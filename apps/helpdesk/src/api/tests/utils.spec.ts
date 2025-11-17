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
                shouldRetry: false,
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
            { retryIndex: 1, expectedDelay: 1000 },
            { retryIndex: 2, expectedDelay: 1000 },
        ])(
            'should return $expectedDelay ms for retry index $retryIndex with other errors',
            ({ retryIndex, expectedDelay }) => {
                expect(
                    reportingRetryDelayHandler(
                        retryIndex,
                        axiosErrorWithCode(500),
                    ),
                ).toBe(expectedDelay)
            },
        )
    })
})
