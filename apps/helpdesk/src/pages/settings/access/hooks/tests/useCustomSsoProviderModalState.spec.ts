import { act, renderHook } from '@testing-library/react'

import type { CustomSSOProviderData } from '../../types'
import { useCustomSsoProviderModalState } from '../useCustomSsoProviderModal'

describe('useCustomSsoProviderModalState', () => {
    const mockOnSave = jest.fn()

    const defaultProps = {
        onSave: mockOnSave,
    }

    const mockProviderData: CustomSSOProviderData = {
        name: 'Test Provider',
        clientId: 'test-client-id',
        clientSecret: 'test-secret',
        metadataUrl: 'https://test.okta.com',
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Initial state', () => {
        it('initializes with correct default values and provides expected functions', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModalState(defaultProps),
            )

            expect(result.current).toEqual({
                showModal: false,
                modalMode: 'create',
                editingProviderId: null,
                editingProviderData: null,
                openCreateModal: expect.any(Function),
                openEditModal: expect.any(Function),
                closeModal: expect.any(Function),
                handleSaveProvider: expect.any(Function),
            })
        })
    })

    describe('Modal operations', () => {
        it('handles create modal operations', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModalState(defaultProps),
            )

            act(() => {
                result.current.openEditModal('provider-123', mockProviderData)
            })

            expect(result.current.showModal).toBe(true)
            expect(result.current.modalMode).toBe('edit')
            expect(result.current.editingProviderId).toBe('provider-123')
            // Client secret should be sanitized for security
            expect(result.current.editingProviderData).toEqual({
                ...mockProviderData,
                clientSecret: '', // Should be empty, not the original secret
            })

            act(() => {
                result.current.openCreateModal()
            })

            expect(result.current.showModal).toBe(true)
            expect(result.current.modalMode).toBe('create')
            expect(result.current.editingProviderId).toBeNull()
            expect(result.current.editingProviderData).toBeNull()
        })

        it('handles edit modal operations', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModalState(defaultProps),
            )

            const customProviderData: CustomSSOProviderData = {
                name: 'Custom Provider',
                clientId: 'custom-client-id',
                clientSecret: 'custom-secret',
                metadataUrl: 'https://custom.provider.com',
            }

            act(() => {
                result.current.openEditModal('provider-123', mockProviderData)
            })

            expect(result.current.showModal).toBe(true)
            expect(result.current.modalMode).toBe('edit')
            expect(result.current.editingProviderId).toBe('provider-123')
            // Client secret should be sanitized for security
            expect(result.current.editingProviderData).toEqual({
                ...mockProviderData,
                clientSecret: '', // Should be empty, not the original secret
            })

            act(() => {
                result.current.openEditModal(
                    'custom-provider-456',
                    customProviderData,
                )
            })

            expect(result.current.editingProviderId).toBe('custom-provider-456')
            // Client secret should be sanitized for security
            expect(result.current.editingProviderData).toEqual({
                ...customProviderData,
                clientSecret: '', // Should be empty, not the original secret
            })
        })

        it('handles close modal operations', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModalState(defaultProps),
            )

            act(() => {
                result.current.openEditModal('provider-123', mockProviderData)
            })

            act(() => {
                result.current.closeModal()
            })

            expect(result.current.showModal).toBe(false)
            expect(result.current.editingProviderId).toBeNull()
            expect(result.current.editingProviderData).toBeNull()
            expect(result.current.modalMode).toBe('edit')

            act(() => {
                result.current.openCreateModal()
            })

            act(() => {
                result.current.closeModal()
            })

            expect(result.current.showModal).toBe(false)
            expect(result.current.editingProviderId).toBeNull()
            expect(result.current.editingProviderData).toBeNull()
            expect(result.current.modalMode).toBe('create')
        })
    })

    describe('Save operations', () => {
        it('handles save operations for create and edit modes', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModalState(defaultProps),
            )

            act(() => {
                result.current.openCreateModal()
            })

            act(() => {
                result.current.handleSaveProvider(mockProviderData)
            })

            expect(mockOnSave).toHaveBeenCalledWith(mockProviderData, undefined)
            expect(result.current.showModal).toBe(false)
            expect(result.current.editingProviderId).toBeNull()
            expect(result.current.editingProviderData).toBeNull()

            jest.clearAllMocks()

            act(() => {
                result.current.openEditModal('provider-123', mockProviderData)
            })

            const updatedData: CustomSSOProviderData = {
                ...mockProviderData,
                name: 'Updated Provider',
            }

            act(() => {
                result.current.handleSaveProvider(updatedData, 'provider-123')
            })

            expect(mockOnSave).toHaveBeenCalledWith(updatedData, 'provider-123')
            expect(result.current.showModal).toBe(false)
            expect(result.current.editingProviderId).toBeNull()
            expect(result.current.editingProviderData).toBeNull()

            jest.clearAllMocks()

            act(() => {
                result.current.openCreateModal()
            })

            act(() => {
                result.current.handleSaveProvider(mockProviderData, null)
            })

            expect(mockOnSave).toHaveBeenCalledWith(mockProviderData, null)
            expect(result.current.showModal).toBe(false)
        })
    })

    describe('Workflow scenarios', () => {
        it('handles complete create and edit workflows', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModalState(defaultProps),
            )

            act(() => {
                result.current.openCreateModal()
            })

            expect(result.current.showModal).toBe(true)
            expect(result.current.modalMode).toBe('create')

            act(() => {
                result.current.handleSaveProvider(mockProviderData)
            })

            expect(mockOnSave).toHaveBeenCalledWith(mockProviderData, undefined)
            expect(result.current.showModal).toBe(false)

            jest.clearAllMocks()

            act(() => {
                result.current.openEditModal('provider-456', mockProviderData)
            })

            expect(result.current.showModal).toBe(true)
            expect(result.current.modalMode).toBe('edit')
            expect(result.current.editingProviderId).toBe('provider-456')

            const updatedData: CustomSSOProviderData = {
                ...mockProviderData,
                clientId: 'updated-client-id',
            }

            act(() => {
                result.current.handleSaveProvider(updatedData, 'provider-456')
            })

            expect(mockOnSave).toHaveBeenCalledWith(updatedData, 'provider-456')
            expect(result.current.showModal).toBe(false)
        })

        it('handles cancel workflow and mode switching', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModalState(defaultProps),
            )

            act(() => {
                result.current.openEditModal('provider-789', mockProviderData)
            })

            expect(result.current.showModal).toBe(true)

            act(() => {
                result.current.closeModal()
            })

            expect(mockOnSave).not.toHaveBeenCalled()
            expect(result.current.showModal).toBe(false)

            act(() => {
                result.current.openCreateModal()
            })

            expect(result.current.modalMode).toBe('create')

            act(() => {
                result.current.openEditModal('provider-999', mockProviderData)
            })

            expect(result.current.modalMode).toBe('edit')
            expect(result.current.editingProviderId).toBe('provider-999')

            act(() => {
                result.current.openCreateModal()
            })

            expect(result.current.modalMode).toBe('create')
            expect(result.current.editingProviderId).toBeNull()
            expect(result.current.editingProviderData).toBeNull()
        })
    })

    describe('Edge cases', () => {
        it('handles edge cases and state persistence', () => {
            const { result, rerender } = renderHook(
                (props) => useCustomSsoProviderModalState(props),
                {
                    initialProps: defaultProps,
                },
            )

            act(() => {
                result.current.openEditModal('', mockProviderData)
            })

            expect(result.current.editingProviderId).toBe('')
            expect(result.current.modalMode).toBe('edit')

            const firstData = { ...mockProviderData, name: 'First Provider' }
            const secondData = { ...mockProviderData, name: 'Second Provider' }

            act(() => {
                result.current.openEditModal('first-id', firstData)
            })

            expect(result.current.editingProviderId).toBe('first-id')
            // Client secret should be sanitized for security
            expect(result.current.editingProviderData).toEqual({
                ...firstData,
                clientSecret: '', // Should be empty, not the original secret
            })

            act(() => {
                result.current.openEditModal('second-id', secondData)
            })

            expect(result.current.editingProviderId).toBe('second-id')
            // Client secret should be sanitized for security
            expect(result.current.editingProviderData).toEqual({
                ...secondData,
                clientSecret: '', // Should be empty, not the original secret
            })

            act(() => {
                result.current.openEditModal('persistent-id', mockProviderData)
            })

            rerender(defaultProps)

            expect(result.current.showModal).toBe(true)
            expect(result.current.modalMode).toBe('edit')
            expect(result.current.editingProviderId).toBe('persistent-id')
        })
    })
})
