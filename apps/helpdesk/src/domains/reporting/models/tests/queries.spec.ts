import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { defaultEnrichmentFields } from 'domains/reporting/hooks/useDrillDownData'
import {
    fetchPostReporting,
    useEnrichedPostReporting,
    usePostReporting,
} from 'domains/reporting/models/queries'
import {
    postEnrichedReporting,
    postReporting,
} from 'domains/reporting/models/resources'
import { ReportingParams } from 'domains/reporting/models/types'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

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
        },
    ]

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
