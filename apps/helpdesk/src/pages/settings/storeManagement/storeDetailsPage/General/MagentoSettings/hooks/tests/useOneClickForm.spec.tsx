import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { IntegrationType } from 'models/integration/constants'
import { Magento2Integration } from 'models/integration/types'

import useStoreUpdater from '../../../../General/hooks/useStoreUpdater'
import { useOneClickForm } from '../useOneClickForm'

jest.mock('../../../../General/hooks/useStoreUpdater')

describe('useOneClickForm', () => {
    const mockIntegration = {
        id: 123,
        name: 'Test Store',
        type: IntegrationType.Magento2,
        meta: {
            admin_url_suffix: 'admin',
            store_url: 'https://test-store.com',
            is_manual: true,
            import_state: {
                is_over: false,
            },
        },
        created_datetime: '2024-01-01T00:00:00Z',
        deactivated_datetime: null,
    } as Magento2Integration

    const mockRefetchStore = jest.fn()
    const mockUpdateIntegration = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useStoreUpdater as jest.Mock).mockReturnValue({
            updateIntegration: mockUpdateIntegration,
            isUpdating: false,
        })
    })

    it('should return correct default values', () => {
        const { result } = renderHook(() =>
            useOneClickForm({
                integration: mockIntegration,
                refetchStore: mockRefetchStore,
            }),
        )

        expect(result.current.defaultValues).toEqual({
            adminURLSuffix: 'admin',
        })
        expect(result.current.storeURL).toBe('https://test-store.com')
        expect(result.current.isSubmitting).toBe(false)
    })

    it('should call updateIntegration with correct values when handleUpdate is called', async () => {
        const { result } = renderHook(() =>
            useOneClickForm({
                integration: mockIntegration,
                refetchStore: mockRefetchStore,
            }),
        )

        const newValues = {
            adminURLSuffix: 'new-admin',
        }

        await act(async () => {
            await result.current.handleUpdate(newValues)
        })

        expect(mockUpdateIntegration).toHaveBeenCalledWith({
            id: 123,
            data: {
                name: 'Test Store',
                meta: {
                    ...mockIntegration.meta,
                    admin_url_suffix: 'new-admin',
                },
            },
        })
    })

    it('should handle empty meta values', () => {
        const integrationWithEmptyMeta = {
            ...mockIntegration,
            meta: {},
        }

        const { result } = renderHook(() =>
            useOneClickForm({
                integration: integrationWithEmptyMeta as Magento2Integration,
                refetchStore: mockRefetchStore,
            }),
        )

        expect(result.current.defaultValues).toEqual({
            adminURLSuffix: '',
        })
        expect(result.current.storeURL).toBe('')
    })

    it('should reflect isSubmitting state from useStoreUpdater', () => {
        ;(useStoreUpdater as jest.Mock).mockReturnValue({
            updateIntegration: mockUpdateIntegration,
            isUpdating: true,
        })

        const { result } = renderHook(() =>
            useOneClickForm({
                integration: mockIntegration,
                refetchStore: mockRefetchStore,
            }),
        )

        expect(result.current.isSubmitting).toBe(true)
    })
})
