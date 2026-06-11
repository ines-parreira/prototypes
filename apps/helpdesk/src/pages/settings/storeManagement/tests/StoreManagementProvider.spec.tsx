import React from 'react'

import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { mockStoresWithAssignedChannels } from 'pages/settings/storeManagement/fixtures'

import {
    StoreManagementProvider,
    useStoreManagementState,
} from '../StoreManagementProvider'

jest.mock('../hooks/useStoresWithMaps', () => ({
    __esModule: true,
    useStoresWithMaps: () => ({
        enrichedStores: mockStoresWithAssignedChannels,
        unassignedChannels: [],
        refetchMapping: jest.fn(),
    }),
}))

describe('StoreManagementProvider', () => {
    const wrapper = ({ children }: React.PropsWithChildren) => (
        <StoreManagementProvider>{children}</StoreManagementProvider>
    )

    it('provides initial state correctly', () => {
        const { result } = renderHook(() => useStoreManagementState(), {
            wrapper,
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
            wrapper,
        })

        act(() => {
            result.current.setCurrentPage(2)
        })

        const { currentPage } = result.current

        expect(currentPage).toBe(2)
    })
})
