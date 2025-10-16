import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { defaultEnrichmentFields } from 'domains/reporting/hooks/useDrillDownData'
import {
    fetchPostReporting,
    useEnrichedPostReporting,
    usePostReporting,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import {
    postEnrichedReporting,
    postReporting,
} from 'domains/reporting/models/resources'
import { BuiltQuery } from 'domains/reporting/models/scopes/scope'
import { ReportingParams } from 'domains/reporting/models/types'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'

jest.mock('domains/reporting/models/resources')
const postReportingMock = assumeMock(postReporting)
const postEnrichedReportingMock = assumeMock(postEnrichedReporting)

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
    } as any

    const cubeQueries: ReportingParams = [
        {
            filters: [],
            measures: [],
            dimensions: [],
            metricName: METRIC_NAMES.TEST_METRIC,
        },
    ]

    const newQuery: BuiltQuery = {
        scope: MetricScope.TicketsClosed,
        dimensions: [],
        measures: [],
        filters: [],
        metricName: METRIC_NAMES.TEST_METRIC,
    }

    beforeEach(() => {
        jest.resetAllMocks()
        postReportingMock.mockResolvedValue(mockData)
    })

    describe('usePostReporting', () => {
        it('should call postReporting and return the result', async () => {
            const { result } = renderHook(() => usePostReporting(cubeQueries), {
                wrapper: mockQueryClientProvider().QueryClientProvider,
            })
            await waitFor(() => {
                expect(postReportingMock).toHaveBeenCalledWith(cubeQueries)
                expect(result.current.data?.data.data).toEqual([42])
            })
        })
    })

    describe('usePostReportingV2', () => {
        it('should call postReporting and return the result', async () => {
            const { result } = renderHook(
                () => usePostReportingV2(cubeQueries, newQuery),
                {
                    wrapper: mockQueryClientProvider().QueryClientProvider,
                },
            )
            await waitFor(() => {
                expect(postReportingMock).toHaveBeenCalledWith(
                    cubeQueries,
                    newQuery,
                )
                expect(result.current.data?.data.data).toEqual([42])
            })
        })
    })

    describe('useEnrichedPostReporting', () => {
        it('should ', async () => {
            const payload = {
                query: cubeQueries[0],
                enrichment_fields: defaultEnrichmentFields,
            }

            renderHook(() => useEnrichedPostReporting(payload), {
                wrapper: mockQueryClientProvider().QueryClientProvider,
            })
            await waitFor(() => {
                expect(postEnrichedReportingMock).toHaveBeenCalledWith(
                    payload.query,
                    payload.enrichment_fields,
                )
            })
        })
    })

    describe('fetchPostReporting', () => {
        it('should call postReporting', async () => {
            const result = await fetchPostReporting(cubeQueries)

            expect(postReportingMock).toHaveBeenCalledWith(cubeQueries)
            expect(result.data?.data).toEqual([42])
        })
    })
})
