import React from 'react'

import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import { Provider } from 'react-redux'

import { mockStoresWithAssignedChannels } from 'pages/settings/storeManagement/fixtures'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import {
    StoreManagementProvider,
    useStoreManagementState,
} from '../StoreManagementProvider'

jest.mock('../hooks/useStoresWithMaps', () => ({
    __esModule: true,
    default: () => ({
        enrichedStores: mockStoresWithAssignedChannels,
        unassignedChannels: [],
        refetchMapping: jest.fn(),
    }),
}))

describe('StoreManagementProvider', () => {
    const { QueryClientProvider } = mockQueryClientProvider()
    const store = mockStore({} as any)

    it('provides initial state correctly', () => {
        const { result } = renderHook(() => useStoreManagementState(), {
            wrapper: ({ children }) => (
                <Provider store={store}>
                    <QueryClientProvider>
                        <StoreManagementProvider>
                            {children}
                        </StoreManagementProvider>
                    </QueryClientProvider>
                </Provider>
            ),
        })

        const { stores, paginatedStores, currentPage, totalPages } =
            result.current

        expect(stores.length).toBe(mockStoresWithAssignedChannels.length)
        expect(paginatedStores.length).toBe(3)
        expect(currentPage).toBe(1)
        expect(totalPages).toBe(
            Math.ceil(mockStoresWithAssignedChannels.length / 10),
        )
    })

    it('handles pagination correctly', () => {
        const { result } = renderHook(() => useStoreManagementState(), {
            wrapper: ({ children }) => (
                <Provider store={store}>
                    <QueryClientProvider>
                        <StoreManagementProvider>
                            {children}
                        </StoreManagementProvider>
                    </QueryClientProvider>
                </Provider>
            ),
        })

        act(() => {
            result.current.setCurrentPage(2)
        })

        const { currentPage } = result.current

        expect(currentPage).toBe(2)
    })
})
