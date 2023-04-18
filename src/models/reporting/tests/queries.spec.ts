import {renderHook} from '@testing-library/react-hooks'

import {createTestQueryClientProvider} from 'tests/reactQueryTestingUtils'

import {ReportingParams} from '../types'
import {getReporting, postReporting} from '../resources'
import {useGetReporting, usePostReporting} from '../queries'

jest.mock('../resources')
const getReportingMock = getReporting as jest.Mock
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
        getReportingMock.mockResolvedValue(mockData)
        postReportingMock.mockResolvedValue(mockData)
    })

    describe('useGetReporting', () => {
        it('should call getReporting and return the result', async () => {
            const {result, waitForNextUpdate} = renderHook(
                () => useGetReporting<[number]>(payload),
                {
                    wrapper: createTestQueryClientProvider(),
                }
            )
            await waitForNextUpdate()

            expect(getReportingMock).toHaveBeenCalledWith(payload)
            expect(result.current.data?.data.data).toEqual([42])
        })
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
})
