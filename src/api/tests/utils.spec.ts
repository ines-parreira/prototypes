import {AxiosError, AxiosHeaders, AxiosResponse} from 'axios'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import {doNotRetry40XErrorsHandler} from '../utils'

describe('doNotRetry40XErrorsHandler', () => {
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
                    axiosErrorWithCode(statusCode)
                )
            ).toEqual(shouldRetry)
        }
    )
})
