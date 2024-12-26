import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import React from 'react'

import {Integration} from 'models/integration/types'
import {useUpsertStoreApps} from 'models/workflows/queries'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import useAddStoreApp from '../useAddStoreApp'

const queryClient = mockQueryClient()

jest.mock('models/workflows/queries')
const useUpsertStoreAppsMock = assumeMock(useUpsertStoreApps)

describe('useAddStoreApp', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should upsert store app', async () => {
        const mutateAsync = jest.fn()
        useUpsertStoreAppsMock.mockReturnValue({
            isLoading: false,
            mutateAsync,
        } as unknown as ReturnType<typeof useUpsertStoreApps>)

        const {result} = renderHook(
            () =>
                useAddStoreApp({
                    storeName: 'shop-name',
                    storeType: 'shopify',
                    integration: {
                        type: 'recharge',
                        id: 1,
                    } as Integration,
                }),
            {
                wrapper: ({children}) => (
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                ),
            }
        )
        await result.current()

        expect(mutateAsync).toHaveBeenCalledWith([
            {
                store_name: 'shop-name',
                store_type: 'shopify',
                type: 'recharge',
            },
            {
                integration_id: 1,
            },
        ])
    })
})
