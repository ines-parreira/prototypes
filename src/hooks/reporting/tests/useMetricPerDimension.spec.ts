import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import {firstResponseTimeMetricPerAgentQueryFactory} from 'hooks/reporting/metricsPerDimension'
import {
    QueryReturnType,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import {
    ReportingQuery,
    TicketDimension,
    TicketMeasure,
} from 'models/reporting/types'
import {usePostReporting} from 'models/reporting/queries'
import {assumeMock} from 'utils/testing'
jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

describe('useMetricPerDimension.spec.ts', () => {
    const query: ReportingQuery = firstResponseTimeMetricPerAgentQueryFactory(
        {
            period: {
                start_datetime: '2020-01-16T03:04:56.789-10:00',
                end_datetime: '2020-01-02T03:04:56.789-10:00',
            },
        },
        'timezone'
    )
    const agentId = 'someId'
    const metricValue = 4567
    const mockedResponse = {
        isFetching: false,
        isError: false,
        data: [
            {
                [TicketDimension.FirstHelpdeskMessageUserId]: agentId,
                [TicketMeasure.FirstResponseTime]: String(metricValue),
            },
        ],
    } as UseQueryResult<QueryReturnType>

    it('should usePostReporting with query and select', () => {
        usePostReportingMock.mockReturnValue(mockedResponse)

        const {result} = renderHook(() => useMetricPerDimension(query, agentId))

        expect(result.current).toEqual({
            isFetching: mockedResponse.isFetching,
            isError: mockedResponse.isError,
            data: {
                value: metricValue,
                allData: mockedResponse.data,
            },
        })
    })

    it('should return null when data not available for entity id', () => {
        const agentId = 'notInResponse'
        usePostReportingMock.mockReturnValue(mockedResponse)

        const {result} = renderHook(() => useMetricPerDimension(query, agentId))

        expect(result.current?.data?.value).toBeNull()
    })

    it('should return null when called without entity', () => {
        usePostReportingMock.mockReturnValue(mockedResponse)

        const {result} = renderHook(() => useMetricPerDimension(query))

        expect(result.current?.data?.value).toBeNull()
    })

    it('should return null when no data in response', () => {
        const agentIdNotInResponse = 'notInResponse'
        usePostReportingMock.mockReturnValue({
            ...mockedResponse,
            data: undefined,
        })

        const {result} = renderHook(() =>
            useMetricPerDimension(query, agentIdNotInResponse)
        )

        expect(result.current?.data).toBeNull()
    })

    it('should use the select function', () => {
        const mockedClientResponse = {
            data: {
                data: mockedResponse.data,
            },
        } as any
        usePostReportingMock.mockImplementation(
            jest
                .fn()
                .mockImplementation(
                    (
                        query,
                        {select}: {select: (data: unknown) => unknown}
                    ) => ({
                        ...mockedResponse,
                        data: select(mockedClientResponse),
                    })
                )
        )

        const {result} = renderHook(() => useMetricPerDimension(query, agentId))

        expect(result.current?.data?.allData).toEqual(mockedResponse.data)
    })
})
