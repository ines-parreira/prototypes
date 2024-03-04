import {QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import {renderHook} from '@testing-library/react-hooks'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import {convertBundle} from 'fixtures/convertBundle'
import {axiosSuccessResponse} from 'fixtures/axiosResponse'
import * as resources from '../resources'
import * as queries from '../queries'

jest.mock('pages/settings/revenue/hooks/useRevenueAddonApi', () => ({
    useRevenueAddonApi: jest.fn(() => ({
        client: jest.fn(),
    })),
}))

jest.mock('../resources', () => ({
    listBundles: jest.fn(),
}))

const mockedResources = {
    mockListBundles: assumeMock(resources.listBundles),
}

const queryClient = mockQueryClient()

const wrapper = ({children}: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('Channel Connection queries', () => {
    const testOverrides = {
        staleTime: 0,
        cacheTime: 0,
        retry: 0,
    }

    beforeEach(() => {
        queryClient.clear()
    })

    describe('useListBundles', () => {
        it('should return correct data on success', async () => {
            mockedResources.mockListBundles.mockResolvedValueOnce(
                axiosSuccessResponse([convertBundle]) as any
            )
            const {result, waitFor} = renderHook(
                () => queries.useListBundles(testOverrides),
                {
                    wrapper,
                }
            )
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual([convertBundle])
        })

        it('should return expected error on failure', async () => {
            mockedResources.mockListBundles.mockRejectedValueOnce(
                Error('test error')
            )
            const {result, waitFor} = renderHook(
                () => queries.useListBundles(testOverrides),
                {
                    wrapper,
                }
            )
            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(result.current.error).toStrictEqual(Error('test error'))
        })
    })
})
