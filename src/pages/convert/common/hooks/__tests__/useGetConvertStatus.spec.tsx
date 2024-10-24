import {QueryClientProvider} from '@tanstack/react-query'
import {waitFor} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'
import React from 'react'

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

jest.mock('pages/convert/common/hooks/useConvertApi', () => {
    return {
        useConvertApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
                get_status_and_usage: () => {
                    return {
                        data: apiResponse,
                        status: 200,
                    }
                },
            },
        }),
    }
})

let useIsConvertSubscriberMock: jest.SpyInstance
describe('useGetConvertStatus', () => {
    const renderHookWithQueryClient = (
        fetchForAll?: boolean,
        shopIntegrationId?: number
    ) =>
        renderHook(() => useGetConvertStatus(fetchForAll, shopIntegrationId), {
            wrapper: ({children}) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

    const mockUseIsConvertSubscriber = (isConvertSubscriber: boolean) => {
        useIsConvertSubscriberMock = jest
            .spyOn(isConvertSubscriberHook, 'useIsConvertSubscriber')
            .mockImplementation(() => isConvertSubscriber)
    }

    beforeEach(() => {
        queryClient.clear()
    })

    afterEach(() => {
        useIsConvertSubscriberMock.mockRestore()
    })

    it('should return api response', async () => {
        mockUseIsConvertSubscriber(true)

        const {result} = renderHookWithQueryClient()

        await waitFor(() => {
            expect(result.current).toBe(apiResponse)
        })
    })

    it('should not return api response', async () => {
        mockUseIsConvertSubscriber(false)

        const {result} = renderHookWithQueryClient()

        await waitFor(() => {
            expect(result.current).toBe(undefined)
        })
    })

    it('should return api response anyway', async () => {
        mockUseIsConvertSubscriber(false)

        const {result} = renderHookWithQueryClient(true, 1)

        await waitFor(() => {
            expect(result.current).toBe(apiResponse)
        })
    })
})
