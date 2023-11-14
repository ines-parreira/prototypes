import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {QueryClientProvider} from '@tanstack/react-query'
import {waitFor} from '@testing-library/react'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import useGetConvertStatus from '../useGetConvertStatus'

const queryClient = mockQueryClient()

const apiResponse = {
    status: 'active',
    usage_status: 'limit-reached',
    usage: 51,
    limit: 50,
    bundle_status: 'installed',
}

jest.mock('pages/settings/revenue/hooks/useRevenueAddonApi', () => {
    return {
        useRevenueAddonApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
                get_status_and_usage: () => {
                    return {
                        data: apiResponse,
                    }
                },
            },
        }),
    }
})

describe('useGetConvertStatus', () => {
    const renderHookWithQueryClient = () =>
        renderHook(() => useGetConvertStatus(), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

    beforeEach(() => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
    })

    it('should return api response', async () => {
        const {result} = renderHookWithQueryClient()

        await waitFor(() => {
            expect(result.current).toBe(apiResponse)
        })
    })
})
