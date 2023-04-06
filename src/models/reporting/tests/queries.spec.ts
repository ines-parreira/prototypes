import {renderHook} from '@testing-library/react-hooks'

import {createTestQueryClientProvider} from 'tests/reactQueryTestingUtils'

import {GetReportingParams} from '../types'
import {getReporting} from '../resources'
import {useGetReporting} from '../queries'

jest.mock('../resources')
const getReportingMock = getReporting as jest.Mock

describe('Reporting queries', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        getReportingMock.mockResolvedValue({
            data: {
                annotation: {
                    title: 'Foo Bar',
                    shortTitle: 'foo',
                    type: 'number',
                },
                query: 'foo bar',
                data: [42],
            },
        })
    })

    describe('useGetReporting', () => {
        it('should call getReporting and return the result', async () => {
            const params: GetReportingParams = {
                filters: [],
                measures: [],
                dimensions: [],
                timeDimensions: [],
            }

            const {result, waitForNextUpdate} = renderHook(
                () => useGetReporting<[number]>(params),
                {
                    wrapper: createTestQueryClientProvider(),
                }
            )
            await waitForNextUpdate()

            expect(getReportingMock).toHaveBeenCalledWith(params)
            expect(result.current.data?.data.data).toEqual([42])
        })
    })
})
