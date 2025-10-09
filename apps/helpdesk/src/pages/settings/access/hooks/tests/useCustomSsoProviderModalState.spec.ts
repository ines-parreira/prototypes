import { act, renderHook } from '@testing-library/react'

import type { CustomSSOProviderData } from '../../types'
import { useCustomSsoProviderModalState } from '../useCustomSsoProviderModal'

describe('useCustomSsoProviderModalState', () => {
    const mockOnSave = jest.fn()
    const mockSetShowModal = jest.fn()

    const defaultProps = {
        showModal: false,
        setShowModal: mockSetShowModal,
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
        mockOnSave.mockResolvedValue(true)
    })

    describe('Initial state', () => {
        it('initializes with correct default values and provides expected functions', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModalState(defaultProps),
            )

            expect(result.current).toEqual({
                modalMode: 'create',
                editingProviderId: null,
                editingProviderData: null,
                openCreateModal: expect.any(Function),
                openEditModal: expect.any(Function),
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

            expect(mockSetShowModal).toHaveBeenCalledWith(true)
            expect(result.current.modalMode).toBe('edit')
            expect(result.current.editingProviderId).toBe('provider-123')
            expect(result.current.editingProviderData).toEqual(mockProviderData)

            jest.clearAllMocks()

            act(() => {
                result.current.openCreateModal()
            })

            expect(mockSetShowModal).toHaveBeenCalledWith(true)
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

            expect(mockSetShowModal).toHaveBeenCalledWith(true)
            expect(result.current.modalMode).toBe('edit')
            expect(result.current.editingProviderId).toBe('provider-123')
            expect(result.current.editingProviderData).toEqual(mockProviderData)

            jest.clearAllMocks()

            act(() => {
                result.current.openEditModal(
                    'custom-provider-456',
                    customProviderData,
                )
            })

            expect(mockSetShowModal).toHaveBeenCalledWith(true)
            expect(result.current.editingProviderId).toBe('custom-provider-456')
            expect(result.current.editingProviderData).toEqual(
                customProviderData,
            )
        })
    })

    describe('Save operations', () => {
        it('handles save operations for create and edit modes', async () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModalState(defaultProps),
            )

            act(() => {
                result.current.openCreateModal()
            })

            await act(async () => {
                await result.current.handleSaveProvider(mockProviderData)
            })

            expect(mockOnSave).toHaveBeenCalledWith(mockProviderData, undefined)
            expect(mockSetShowModal).toHaveBeenCalledWith(false)

            jest.clearAllMocks()

            act(() => {
                result.current.openEditModal('provider-123', mockProviderData)
            })

            const updatedData: CustomSSOProviderData = {
                ...mockProviderData,
                name: 'Updated Provider',
            }

            await act(async () => {
                await result.current.handleSaveProvider(
                    updatedData,
                    'provider-123',
                )
            })

            expect(mockOnSave).toHaveBeenCalledWith(updatedData, 'provider-123')
            expect(mockSetShowModal).toHaveBeenCalledWith(false)

            jest.clearAllMocks()

            act(() => {
                result.current.openCreateModal()
            })

            await act(async () => {
                await result.current.handleSaveProvider(mockProviderData, null)
            })

            expect(mockOnSave).toHaveBeenCalledWith(mockProviderData, null)
            expect(mockSetShowModal).toHaveBeenCalledWith(false)
        })

        it('does not close modal when save fails', async () => {
            mockOnSave.mockResolvedValue(false)
            const { result } = renderHook(() =>
                useCustomSsoProviderModalState({
                    ...defaultProps,
                    showModal: true,
                }),
            )

            act(() => {
                result.current.openCreateModal()
            })

            jest.clearAllMocks()

            await act(async () => {
                await result.current.handleSaveProvider(mockProviderData)
            })

            expect(mockOnSave).toHaveBeenCalledWith(mockProviderData, undefined)
            expect(mockSetShowModal).not.toHaveBeenCalled()
        })
    })

    describe('Workflow scenarios', () => {
        it('handles complete create and edit workflows', async () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModalState(defaultProps),
            )

            act(() => {
                result.current.openCreateModal()
            })

            expect(mockSetShowModal).toHaveBeenCalledWith(true)
            expect(result.current.modalMode).toBe('create')

            jest.clearAllMocks()

            await act(async () => {
                await result.current.handleSaveProvider(mockProviderData)
            })

            expect(mockOnSave).toHaveBeenCalledWith(mockProviderData, undefined)
            expect(mockSetShowModal).toHaveBeenCalledWith(false)

            jest.clearAllMocks()

            act(() => {
                result.current.openEditModal('provider-456', mockProviderData)
            })

            expect(mockSetShowModal).toHaveBeenCalledWith(true)
            expect(result.current.modalMode).toBe('edit')
            expect(result.current.editingProviderId).toBe('provider-456')

            jest.clearAllMocks()

            const updatedData: CustomSSOProviderData = {
                ...mockProviderData,
                clientId: 'updated-client-id',
            }

            await act(async () => {
                await result.current.handleSaveProvider(
                    updatedData,
                    'provider-456',
                )
            })

            expect(mockOnSave).toHaveBeenCalledWith(updatedData, 'provider-456')
            expect(mockSetShowModal).toHaveBeenCalledWith(false)
        })

        it('handles mode switching', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModalState(defaultProps),
            )

            act(() => {
                result.current.openEditModal('provider-789', mockProviderData)
            })

            expect(mockSetShowModal).toHaveBeenCalledWith(true)
            expect(result.current.modalMode).toBe('edit')

            jest.clearAllMocks()

            act(() => {
                result.current.openCreateModal()
            })

            expect(mockSetShowModal).toHaveBeenCalledWith(true)
            expect(result.current.modalMode).toBe('create')

            jest.clearAllMocks()

            act(() => {
                result.current.openEditModal('provider-999', mockProviderData)
            })

            expect(mockSetShowModal).toHaveBeenCalledWith(true)
            expect(result.current.modalMode).toBe('edit')
            expect(result.current.editingProviderId).toBe('provider-999')

            jest.clearAllMocks()

            act(() => {
                result.current.openCreateModal()
            })

            expect(mockSetShowModal).toHaveBeenCalledWith(true)
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
            expect(result.current.editingProviderData).toEqual(firstData)

            act(() => {
                result.current.openEditModal('second-id', secondData)
            })

            expect(result.current.editingProviderId).toBe('second-id')
            expect(result.current.editingProviderData).toEqual(secondData)

            act(() => {
                result.current.openEditModal('persistent-id', mockProviderData)
            })

            rerender(defaultProps)

            expect(result.current.modalMode).toBe('edit')
            expect(result.current.editingProviderId).toBe('persistent-id')
        })
    })
})
