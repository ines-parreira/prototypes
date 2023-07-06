import {renderHook} from '@testing-library/react-hooks'
import {AxiosError, AxiosResponse} from 'axios'

import {createTestQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {doNotRetry40XErrorsHandler, usePostReporting} from '../queries'
import {postReporting} from '../resources'

import {ReportingParams} from '../types'

jest.mock('../resources')
const postReportingMock = postReporting as jest.Mock

describe('Reporting queries', () => {
    const mockData = {
        data: {
            annotation: {
                title: 'Foo Bar',
                shortTitle: 'foo',
                type: 'number',
            },
            query: 'foo bar',
            data: [42],
        },
    }

    const payload: ReportingParams = [
        {
            filters: [],
            measures: [],
            dimensions: [],
        },
    ]

    beforeEach(() => {
        jest.resetAllMocks()
        postReportingMock.mockResolvedValue(mockData)
    })

    describe('usePostReporting', () => {
        it('should call postReporting and return the result', async () => {
            const {result, waitForNextUpdate} = renderHook(
                () => usePostReporting(payload),
                {
                    wrapper: createTestQueryClientProvider(),
                }
            )
            await waitForNextUpdate()

            expect(postReportingMock).toHaveBeenCalledWith(payload)
            expect(result.current.data?.data.data).toEqual([42])
        })
    })

    describe('doNotRetry40XErrorsHandler', () => {
        const response: AxiosResponse = {
            data: {},
            status: 200,
            statusText: 'some text',
            headers: [],
            config: {},
        }

        const defaultAxiosErrorTemplate: AxiosError = {
            isAxiosError: true,
            response,
            config: {},
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
})
