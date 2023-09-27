import {renderHook} from '@testing-library/react-hooks'
import {AxiosError, AxiosResponse} from 'axios'
import LD from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesMember} from 'models/reporting/cubes/TicketMessagesCube'

import {mockQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {doNotRetry40XErrorsHandler, usePostReporting} from '../queries'
import {postReporting} from '../resources'

import {ReportingFilterOperator, ReportingParams} from '../types'

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
        beforeEach(() => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.AnalyticsChannelFilter]: false,
            }))
        })

        it('should call postReporting and return the result', async () => {
            const {result, waitForNextUpdate} = renderHook(
                () => usePostReporting(payload),
                {
                    wrapper: mockQueryClientProvider(),
                }
            )
            await waitForNextUpdate()

            expect(postReportingMock).toHaveBeenCalledWith(payload)
            expect(result.current.data?.data.data).toEqual([42])
        })

        it(`should replace the ${TicketMember.Channel} with ${TicketMessagesMember.FirstMessageChannel}  when feature flag is disabled`, async () => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.AnalyticsChannelFilter]: false,
            }))
            const payloadWithNewFilter: ReportingParams = [
                {
                    ...payload[0],
                    filters: [
                        {
                            member: TicketMember.Channel,
                            operator: ReportingFilterOperator.Equals,
                            values: ['0'],
                        },
                    ],
                },
            ]

            const {waitForNextUpdate} = renderHook(
                () => usePostReporting(payloadWithNewFilter),
                {
                    wrapper: mockQueryClientProvider(),
                }
            )
            await waitForNextUpdate()

            expect(postReportingMock).toHaveBeenCalledWith([
                {
                    ...payloadWithNewFilter[0],
                    filters: [
                        {
                            member: TicketMessagesMember.FirstMessageChannel,
                            operator: ReportingFilterOperator.Equals,
                            values: ['0'],
                        },
                    ],
                },
            ])
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
