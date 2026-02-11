import { assumeMock } from '@repo/testing'
import { renderHook } from '@testing-library/react'

import { useMetafieldDefinitions } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/hooks/useMetafieldDefinitions'

import { useGetMetafieldByKey } from '../useGetMetafieldByKey'

jest.mock(
    'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/hooks/useMetafieldDefinitions',
)
const mockUseMetafieldDefinitions = assumeMock(useMetafieldDefinitions)

const mockMetafields = [
    {
        id: 1,
        key: 'custom.notes',
        name: 'Notes',
        type: 'single_line_text_field',
    },
    { id: 2, key: 'custom.active', name: 'Active', type: 'boolean' },
]

describe('useGetMetafieldByKey', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseMetafieldDefinitions.mockReturnValue({
            data: mockMetafields,
            isLoading: false,
            isError: false,
            error: null,
        } as any)
    })

    it('should return the metafield matching the given key', () => {
        const { result } = renderHook(() =>
            useGetMetafieldByKey('custom.notes', 42),
        )

        expect(result.current).toEqual(mockMetafields[0])
    })

    it('should return null when metafieldKey is undefined', () => {
        const { result } = renderHook(() => useGetMetafieldByKey(undefined, 42))

        expect(result.current).toBeNull()
    })

    it('should return null when metafieldKey is null', () => {
        const { result } = renderHook(() => useGetMetafieldByKey(null, 42))

        expect(result.current).toBeNull()
    })

    it('should return null when no metafield matches the key', () => {
        const { result } = renderHook(() =>
            useGetMetafieldByKey('nonexistent.key', 42),
        )

        expect(result.current).toBeNull()
    })

    it('should call useMetafieldDefinitions with the given integrationId and pinned true', () => {
        renderHook(() => useGetMetafieldByKey('custom.notes', 99))

        expect(mockUseMetafieldDefinitions).toHaveBeenCalledWith({
            integrationId: 99,
            pinned: true,
        })
    })

    it('should default integrationId to 0 when undefined', () => {
        renderHook(() => useGetMetafieldByKey('custom.notes'))

        expect(mockUseMetafieldDefinitions).toHaveBeenCalledWith({
            integrationId: 0,
            pinned: true,
        })
    })

    it('should handle empty metafields data', () => {
        mockUseMetafieldDefinitions.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() =>
            useGetMetafieldByKey('custom.notes', 42),
        )

        expect(result.current).toBeNull()
    })
})
