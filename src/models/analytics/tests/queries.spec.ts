import {renderHook} from '@testing-library/react-hooks'

import {createTestQueryClientProvider} from 'tests/reactQueryTestingUtils'

import {GetAnalyticsParams} from '../types'
import {getAnalytics} from '../resources'
import {useGetAnalytics} from '../queries'

jest.mock('../resources')
const getAnalyticsMock = getAnalytics as jest.Mock

describe('analytics queries', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        getAnalyticsMock.mockResolvedValue({
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

    describe('useGetAnalytics', () => {
        it('should call getAnalytics and return the result', async () => {
            const params: GetAnalyticsParams = {
                filters: [],
                measures: [],
                dimensions: [],
                timeDimensions: [],
            }

            const {result, waitForNextUpdate} = renderHook(
                () => useGetAnalytics<[number]>(params),
                {
                    wrapper: createTestQueryClientProvider(),
                }
            )
            await waitForNextUpdate()

            expect(getAnalyticsMock).toHaveBeenCalledWith(params)
            expect(result.current.data?.data.data).toEqual([42])
        })
    })
})
