import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { IntegrationType, ShopifyIntegration } from 'models/integration/types'

import { useShopifySettingsForm } from '../useShopifySettingsForm'

const mockUpdateIntegration = jest.fn()
jest.mock('../useStoreUpdater', () => ({
    __esModule: true,
    default: () => ({
        updateIntegration: mockUpdateIntegration,
        isUpdating: false,
    }),
}))

describe('useShopifySettingsForm', () => {
    const mockIntegration = {
        id: 123,
        name: 'Test Integration',
        type: IntegrationType.Shopify,
        meta: {
            shop_name: 'test-shop',
            sync_customer_notes: false,
            default_address_phone_matching_enabled: false,
        },
    } as ShopifyIntegration

    const mockRefetchStore = jest.fn()
    const mockShowConfirmation = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('initializes with correct default values', () => {
        const { result } = renderHook(() =>
            useShopifySettingsForm({
                integration: mockIntegration,
                onShowConfirmation: mockShowConfirmation,
                refetchStore: mockRefetchStore,
            }),
        )

        expect(result.current.syncCustomerNotes).toBe(false)
        expect(result.current.defaultAddressPhoneMatchingEnabled).toBe(false)
        expect(result.current.areIntegrationOptionsDirty).toBe(false)
    })

    it('updates sync customer notes', () => {
        const { result } = renderHook(() =>
            useShopifySettingsForm({
                integration: mockIntegration,
                onShowConfirmation: mockShowConfirmation,
                refetchStore: mockRefetchStore,
            }),
        )

        act(() => {
            result.current.setSyncCustomerNotes(true)
        })

        expect(result.current.syncCustomerNotes).toBe(true)
        expect(result.current.areIntegrationOptionsDirty).toBe(true)
    })

    it('updates default address phone matching', () => {
        const { result } = renderHook(() =>
            useShopifySettingsForm({
                integration: mockIntegration,
                onShowConfirmation: mockShowConfirmation,
                refetchStore: mockRefetchStore,
            }),
        )

        act(() => {
            result.current.setDefaultAddressPhoneMatchingEnabled(true)
        })

        expect(result.current.defaultAddressPhoneMatchingEnabled).toBe(true)
        expect(result.current.areIntegrationOptionsDirty).toBe(true)
    })

    it('shows confirmation when enabling default address phone matching', async () => {
        const { result } = renderHook(() =>
            useShopifySettingsForm({
                integration: mockIntegration,
                onShowConfirmation: mockShowConfirmation,
                refetchStore: mockRefetchStore,
            }),
        )

        act(() => {
            result.current.setDefaultAddressPhoneMatchingEnabled(true)
        })

        const mockEvent = {
            preventDefault: jest.fn(),
        }

        await act(async () => {
            await result.current.handleUpdate(mockEvent as any)
        })

        expect(mockShowConfirmation).toHaveBeenCalled()
        expect(mockUpdateIntegration).not.toHaveBeenCalled()
    })

    it('updates integration without confirmation when changing sync customer notes', async () => {
        const { result } = renderHook(() =>
            useShopifySettingsForm({
                integration: mockIntegration,
                onShowConfirmation: mockShowConfirmation,
                refetchStore: mockRefetchStore,
            }),
        )

        act(() => {
            result.current.setSyncCustomerNotes(true)
        })

        const mockEvent = {
            preventDefault: jest.fn(),
        }

        await act(async () => {
            await result.current.handleUpdate(mockEvent as any)
        })

        expect(mockShowConfirmation).not.toHaveBeenCalled()
        expect(mockUpdateIntegration).toHaveBeenCalledWith({
            id: mockIntegration.id,
            data: {
                name: mockIntegration.name,
                meta: {
                    ...mockIntegration.meta,
                    sync_customer_notes: true,
                    default_address_phone_matching_enabled: false,
                },
            },
        })
    })

    it('resets form values on cancel', () => {
        const { result } = renderHook(() =>
            useShopifySettingsForm({
                integration: mockIntegration,
                onShowConfirmation: mockShowConfirmation,
                refetchStore: mockRefetchStore,
            }),
        )

        act(() => {
            result.current.setSyncCustomerNotes(true)
            result.current.setDefaultAddressPhoneMatchingEnabled(true)
        })

        expect(result.current.areIntegrationOptionsDirty).toBe(true)

        act(() => {
            result.current.handleCancel()
        })

        expect(result.current.syncCustomerNotes).toBe(false)
        expect(result.current.defaultAddressPhoneMatchingEnabled).toBe(false)
        expect(result.current.areIntegrationOptionsDirty).toBe(false)
    })
})
