import React from 'react'

import { act } from '@testing-library/react'

import { renderHook } from 'utils/testing/renderHook'

import { storeMappingFixture } from '../fixtures'
import {
    StoreManagementProvider,
    useStoreManagementState,
} from '../StoreManagementProvider'

describe('StoreManagementProvider', () => {
    it('provides initial state correctly', () => {
        const { result } = renderHook(() => useStoreManagementState(), {
            wrapper: ({ children }) => (
                <StoreManagementProvider>{children}</StoreManagementProvider>
            ),
        })

        const { stores, paginatedStores, currentPage, totalPages } =
            result.current

        expect(stores.length).toBe(storeMappingFixture.length)
        expect(paginatedStores.length).toBe(10)
        expect(currentPage).toBe(1)
        expect(totalPages).toBe(Math.ceil(storeMappingFixture.length / 10))
    })

    it('handles pagination correctly', () => {
        const { result } = renderHook(() => useStoreManagementState(), {
            wrapper: ({ children }) => (
                <StoreManagementProvider>{children}</StoreManagementProvider>
            ),
        })

        act(() => {
            result.current.setCurrentPage(2)
        })

        const { currentPage } = result.current

        expect(currentPage).toBe(2)
    })

    it('updates stores correctly', () => {
        const { result } = renderHook(() => useStoreManagementState(), {
            wrapper: ({ children }) => (
                <StoreManagementProvider>{children}</StoreManagementProvider>
            ),
        })

        act(() => {
            result.current.setStores([
                ...result.current.stores,
                {
                    id: 'new-store',
                    name: 'New Store',
                    url: 'www.new-store.com',
                    type: 'shopify',
                    channels: [],
                },
            ])
        })

        const { stores } = result.current

        expect(stores.length).toBe(storeMappingFixture.length + 1)
    })
})
