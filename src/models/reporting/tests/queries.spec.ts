import { waitFor } from '@testing-library/react'

import { defaultEnrichmentFields } from 'hooks/reporting/useDrillDownData'
import {
    fetchPostReporting,
    useEnrichedPostReporting,
    usePostReporting,
} from 'models/reporting/queries'
import {
    postEnrichedReporting,
    postReporting,
} from 'models/reporting/resources'
import { ReportingParams } from 'models/reporting/types'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('models/reporting/resources')
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
