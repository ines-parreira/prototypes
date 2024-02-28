import {renderHook} from '@testing-library/react-hooks'
import {defaultEnrichmentFields} from 'hooks/reporting/useDrillDownData'
import {mockQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'
import {useEnrichedPostReporting, usePostReporting} from '../queries'
import {postEnrichedReporting, postReporting} from '../resources'

import {ReportingParams} from '../types'

jest.mock('../resources')
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
            const {result, waitForNextUpdate} = renderHook(
                () => usePostReporting(cubeQueries),
                {
                    wrapper: mockQueryClientProvider(),
                }
            )
            await waitForNextUpdate()

            expect(postReportingMock).toHaveBeenCalledWith(cubeQueries)
            expect(result.current.data?.data.data).toEqual([42])
        })
    })

    describe('useEnrichedPostReporting', () => {
        it('should ', async () => {
            const payload = {
                query: cubeQueries[0],
                enrichment_fields: defaultEnrichmentFields,
            }

            const {waitForNextUpdate} = renderHook(
                () => useEnrichedPostReporting(payload),
                {
                    wrapper: mockQueryClientProvider(),
                }
            )
            await waitForNextUpdate()

            expect(postEnrichedReportingMock).toHaveBeenCalledWith(
                payload.query,
                payload.enrichment_fields
            )
        })
    })
})
