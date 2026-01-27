import { act, renderHook } from '@testing-library/react'

import type { ShopifyIntegration } from 'models/integration/types'

import { useSubmenuNavigation } from '../useSubmenuNavigation'

const createMockStore = (
    overrides: Partial<ShopifyIntegration> = {},
): ShopifyIntegration =>
    ({
        id: 1,
        name: 'Test Store',
        type: 'shopify',
        ...overrides,
    }) as ShopifyIntegration

const createMockMouseEvent = () =>
    ({
        stopPropagation: jest.fn(),
    }) as unknown as React.MouseEvent

describe('useSubmenuNavigation', () => {
    it('has initial state at stores level with no selections', () => {
        const { result } = renderHook(() => useSubmenuNavigation())

        expect(result.current.currentLevel).toBe('stores')
        expect(result.current.selectedStore).toBeNull()
        expect(result.current.selectedCategory).toBeNull()
    })

    it('handleStoreSelect sets store and moves to categories level', () => {
        const { result } = renderHook(() => useSubmenuNavigation())
        const mockStore = createMockStore({ id: 123, name: 'My Store' })
        const mockEvent = createMockMouseEvent()

        act(() => {
            result.current.handleStoreSelect(mockEvent, mockStore)
        })

        expect(result.current.currentLevel).toBe('categories')
        expect(result.current.selectedStore).toBe(mockStore)
        expect(mockEvent.stopPropagation).toHaveBeenCalled()
    })

    it('handleCategorySelect sets category and moves to metafields level', () => {
        const { result } = renderHook(() => useSubmenuNavigation())
        const mockStore = createMockStore()
        const mockEvent = createMockMouseEvent()

        act(() => {
            result.current.handleStoreSelect(mockEvent, mockStore)
        })

        act(() => {
            result.current.handleCategorySelect(
                createMockMouseEvent(),
                'Customer',
            )
        })

        expect(result.current.currentLevel).toBe('metafields')
        expect(result.current.selectedCategory).toBe('Customer')
    })

    it('handleBack from metafields goes to categories and clears category', () => {
        const { result } = renderHook(() => useSubmenuNavigation())
        const mockStore = createMockStore()

        act(() => {
            result.current.handleStoreSelect(createMockMouseEvent(), mockStore)
        })
        act(() => {
            result.current.handleCategorySelect(createMockMouseEvent(), 'Order')
        })

        expect(result.current.currentLevel).toBe('metafields')

        act(() => {
            result.current.handleBack(createMockMouseEvent())
        })

        expect(result.current.currentLevel).toBe('categories')
        expect(result.current.selectedCategory).toBeNull()
        expect(result.current.selectedStore).toBe(mockStore)
    })

    it('handleBack from categories goes to stores and clears store', () => {
        const { result } = renderHook(() => useSubmenuNavigation())
        const mockStore = createMockStore()

        act(() => {
            result.current.handleStoreSelect(createMockMouseEvent(), mockStore)
        })

        expect(result.current.currentLevel).toBe('categories')

        act(() => {
            result.current.handleBack(createMockMouseEvent())
        })

        expect(result.current.currentLevel).toBe('stores')
        expect(result.current.selectedStore).toBeNull()
    })

    it('resetSubmenuState clears all state', () => {
        const { result } = renderHook(() => useSubmenuNavigation())
        const mockStore = createMockStore()

        act(() => {
            result.current.handleStoreSelect(createMockMouseEvent(), mockStore)
        })
        act(() => {
            result.current.handleCategorySelect(
                createMockMouseEvent(),
                'DraftOrder',
            )
        })

        expect(result.current.currentLevel).toBe('metafields')
        expect(result.current.selectedStore).not.toBeNull()
        expect(result.current.selectedCategory).not.toBeNull()

        act(() => {
            result.current.resetSubmenuState()
        })

        expect(result.current.currentLevel).toBe('stores')
        expect(result.current.selectedStore).toBeNull()
        expect(result.current.selectedCategory).toBeNull()
    })

    it('backButtonLabel returns store name when at categories level', () => {
        const { result } = renderHook(() => useSubmenuNavigation())
        const mockStore = createMockStore({ name: 'My Shopify Store' })

        act(() => {
            result.current.handleStoreSelect(createMockMouseEvent(), mockStore)
        })

        expect(result.current.currentLevel).toBe('categories')
        expect(result.current.backButtonLabel).toBe('My Shopify Store')
    })

    it('backButtonLabel returns category display name when at metafields level', () => {
        const { result } = renderHook(() => useSubmenuNavigation())
        const mockStore = createMockStore()

        act(() => {
            result.current.handleStoreSelect(createMockMouseEvent(), mockStore)
        })
        act(() => {
            result.current.handleCategorySelect(createMockMouseEvent(), 'Order')
        })

        expect(result.current.currentLevel).toBe('metafields')
        expect(result.current.backButtonLabel).toBe('Last Order')
    })

    it('backButtonLabel returns DraftOrder display name correctly', () => {
        const { result } = renderHook(() => useSubmenuNavigation())
        const mockStore = createMockStore()

        act(() => {
            result.current.handleStoreSelect(createMockMouseEvent(), mockStore)
        })
        act(() => {
            result.current.handleCategorySelect(
                createMockMouseEvent(),
                'DraftOrder',
            )
        })

        expect(result.current.backButtonLabel).toBe('Last Draft Order')
    })

    it('backButtonLabel returns Customer display name correctly', () => {
        const { result } = renderHook(() => useSubmenuNavigation())
        const mockStore = createMockStore()

        act(() => {
            result.current.handleStoreSelect(createMockMouseEvent(), mockStore)
        })
        act(() => {
            result.current.handleCategorySelect(
                createMockMouseEvent(),
                'Customer',
            )
        })

        expect(result.current.backButtonLabel).toBe('Customer')
    })

    it('backButtonLabel returns empty string at stores level', () => {
        const { result } = renderHook(() => useSubmenuNavigation())

        expect(result.current.backButtonLabel).toBe('')
    })

    it('handleBack at stores level does nothing', () => {
        const { result } = renderHook(() => useSubmenuNavigation())
        const mockEvent = createMockMouseEvent()

        act(() => {
            result.current.handleBack(mockEvent)
        })

        expect(result.current.currentLevel).toBe('stores')
        expect(mockEvent.stopPropagation).toHaveBeenCalled()
    })
})
