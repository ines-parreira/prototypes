import { act } from '@testing-library/react'
import { fromJS } from 'immutable'

import { renderHook } from 'utils/testing/renderHook'

import { useEmailIntegrationUpdate } from './useEmailIntegrationUpdate'

describe('useEmailIntegrationUpdate', () => {
    describe('initial state', () => {
        it('should initialize with correct default values', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            expect(result.current.state).toEqual({
                dirty: false,
                name: '',
                useGmailCategories: false,
                enableGmailSending: true,
                enableOutlookSending: true,
                enableGmailThreading: true,
                errors: {},
                isInitialized: false,
                signatureHtml: '',
                signatureText: '',
                showCancelModal: false,
            })
        })
    })

    describe('setName', () => {
        it('should set name and mark as dirty', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.setName('Test Integration')
            })

            expect(result.current.state.name).toBe('Test Integration')
            expect(result.current.state.dirty).toBe(true)
        })

        it('should update name multiple times', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.setName('First Name')
            })

            act(() => {
                result.current.setName('Second Name')
            })

            expect(result.current.state.name).toBe('Second Name')
            expect(result.current.state.dirty).toBe(true)
        })
    })

    describe('setUseGmailCategories', () => {
        it('should set gmail categories and mark as dirty', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.setUseGmailCategories(true)
            })

            expect(result.current.state.useGmailCategories).toBe(true)
            expect(result.current.state.dirty).toBe(true)
        })

        it('should toggle gmail categories', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.setUseGmailCategories(true)
            })

            act(() => {
                result.current.setUseGmailCategories(false)
            })

            expect(result.current.state.useGmailCategories).toBe(false)
            expect(result.current.state.dirty).toBe(true)
        })
    })

    describe('setEnableGmailSending', () => {
        it('should set gmail sending and mark as dirty', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.setEnableGmailSending(false)
            })

            expect(result.current.state.enableGmailSending).toBe(false)
            expect(result.current.state.dirty).toBe(true)
        })
    })

    describe('setEnableOutlookSending', () => {
        it('should set outlook sending and mark as dirty', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.setEnableOutlookSending(false)
            })

            expect(result.current.state.enableOutlookSending).toBe(false)
            expect(result.current.state.dirty).toBe(true)
        })
    })

    describe('setEnableGmailThreading', () => {
        it('should set gmail threading and mark as dirty', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.setEnableGmailThreading(false)
            })

            expect(result.current.state.enableGmailThreading).toBe(false)
            expect(result.current.state.dirty).toBe(true)
        })
    })

    describe('setSignatureText', () => {
        it('should set signature text and mark as dirty', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.setSignatureText('Best regards')
            })

            expect(result.current.state.signatureText).toBe('Best regards')
            expect(result.current.state.dirty).toBe(true)
        })
    })

    describe('setSignatureHtml', () => {
        it('should set signature html and mark as dirty', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.setSignatureHtml('<p>Best regards</p>')
            })

            expect(result.current.state.signatureHtml).toBe(
                '<p>Best regards</p>',
            )
            expect(result.current.state.dirty).toBe(true)
        })
    })

    describe('setDirty', () => {
        it('should set dirty state to true', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.setDirty(true)
            })

            expect(result.current.state.dirty).toBe(true)
        })

        it('should set dirty state to false', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.setName('test')
            })

            act(() => {
                result.current.setDirty(false)
            })

            expect(result.current.state.dirty).toBe(false)
        })
    })

    describe('setError', () => {
        it('should set error for a field', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.setError('name', 'Name is required')
            })

            expect(result.current.state.errors).toEqual({
                name: 'Name is required',
            })
        })

        it('should set multiple errors', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.setError('name', 'Name is required')
            })

            act(() => {
                result.current.setError('email', 'Email is invalid')
            })

            expect(result.current.state.errors).toEqual({
                name: 'Name is required',
                email: 'Email is invalid',
            })
        })

        it('should clear error for a field', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.setError('name', 'Name is required')
            })

            act(() => {
                result.current.setError('name', null)
            })

            expect(result.current.state.errors).toEqual({
                name: null,
            })
        })
    })

    describe('clearErrors', () => {
        it('should clear all errors', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.setError('name', 'Name is required')
            })

            act(() => {
                result.current.setError('email', 'Email is invalid')
            })

            act(() => {
                result.current.clearErrors()
            })

            expect(result.current.state.errors).toEqual({})
        })
    })

    describe('initializeFromIntegration', () => {
        it('should initialize state from integration object', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            const integration = fromJS({
                name: 'Test Integration',
                meta: {
                    use_gmail_categories: true,
                    enable_gmail_sending: false,
                    enable_outlook_sending: false,
                    enable_gmail_threading: false,
                    signature: {
                        text: 'Best regards',
                        html: '<p>Best regards</p>',
                    },
                },
            })

            act(() => {
                result.current.initializeFromIntegration(integration)
            })

            expect(result.current.state).toEqual({
                dirty: false,
                name: 'Test Integration',
                useGmailCategories: true,
                enableGmailSending: false,
                enableOutlookSending: false,
                enableGmailThreading: false,
                errors: {},
                isInitialized: true,
                signatureHtml: '<p>Best regards</p>',
                signatureText: 'Best regards',
                showCancelModal: false,
            })
        })

        it('should use default values when integration fields are missing', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            const integration = fromJS({
                name: 'Minimal Integration',
            })

            act(() => {
                result.current.initializeFromIntegration(integration)
            })

            expect(result.current.state).toEqual({
                dirty: false,
                name: 'Minimal Integration',
                useGmailCategories: false,
                enableGmailSending: true,
                enableOutlookSending: true,
                enableGmailThreading: true,
                errors: {},
                isInitialized: true,
                signatureHtml: '',
                signatureText: '',
                showCancelModal: false,
            })
        })

        it('should reset dirty state when initializing', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.setName('Changed Name')
            })

            expect(result.current.state.dirty).toBe(true)

            const integration = fromJS({
                name: 'Original Name',
            })

            act(() => {
                result.current.initializeFromIntegration(integration)
            })

            expect(result.current.state.dirty).toBe(false)
        })
    })

    describe('showCancelModal', () => {
        it('should show cancel modal', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.showCancelModal(true)
            })

            expect(result.current.state.showCancelModal).toBe(true)
        })

        it('should hide cancel modal', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.showCancelModal(true)
            })

            act(() => {
                result.current.showCancelModal(false)
            })

            expect(result.current.state.showCancelModal).toBe(false)
        })
    })

    describe('submitIntegration', () => {
        it('should call update function with correct integration data', async () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            const mockUpdateFunction = jest.fn().mockResolvedValue(undefined)
            const originalIntegration = fromJS({
                id: 1,
                type: 'gmail',
                meta: {
                    address: 'test@example.com',
                },
            })

            act(() => {
                result.current.setName('Updated Name')
            })

            act(() => {
                result.current.setSignatureText('Updated signature')
            })

            act(() => {
                result.current.setSignatureHtml('<p>Updated signature</p>')
            })

            act(() => {
                result.current.setUseGmailCategories(true)
            })

            act(() => {
                result.current.setEnableGmailSending(false)
            })

            await act(async () => {
                await result.current.submitIntegration(
                    originalIntegration,
                    mockUpdateFunction,
                )
            })

            expect(mockUpdateFunction).toHaveBeenCalledWith(
                fromJS({
                    id: 1,
                    type: 'gmail',
                    name: 'Updated Name',
                    meta: {
                        address: 'test@example.com',
                        signature: {
                            text: 'Updated signature',
                            html: '<p>Updated signature</p>',
                        },
                        use_gmail_categories: true,
                        enable_gmail_sending: false,
                        enable_outlook_sending: true,
                        enable_gmail_threading: true,
                    },
                }),
            )
        })

        it('should reset dirty state after successful submission', async () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            const mockUpdateFunction = jest.fn().mockResolvedValue(undefined)
            const originalIntegration = fromJS({
                id: 1,
                name: 'Test Integration',
            })

            act(() => {
                result.current.setName('Updated Name')
            })

            expect(result.current.state.dirty).toBe(true)

            await act(async () => {
                await result.current.submitIntegration(
                    originalIntegration,
                    mockUpdateFunction,
                )
            })

            expect(result.current.state.dirty).toBe(false)
        })

        it('should handle update function errors', async () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            const mockUpdateFunction = jest
                .fn()
                .mockRejectedValue(new Error('Update failed'))
            const originalIntegration = fromJS({
                id: 1,
                name: 'Test Integration',
            })

            act(() => {
                result.current.setName('Updated Name')
            })

            await expect(
                act(async () => {
                    await result.current.submitIntegration(
                        originalIntegration,
                        mockUpdateFunction,
                    )
                }),
            ).rejects.toThrow('Update failed')

            expect(result.current.state.dirty).toBe(true)
        })
    })

    describe('complex state interactions', () => {
        it('should handle multiple state changes correctly', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            act(() => {
                result.current.setName('Complex Test')
            })

            act(() => {
                result.current.setUseGmailCategories(true)
            })

            act(() => {
                result.current.setSignatureText('Complex signature')
            })

            act(() => {
                result.current.setError('validation', 'Some error')
            })

            expect(result.current.state).toEqual({
                dirty: true,
                name: 'Complex Test',
                useGmailCategories: true,
                enableGmailSending: true,
                enableOutlookSending: true,
                enableGmailThreading: true,
                errors: { validation: 'Some error' },
                isInitialized: false,
                signatureHtml: '',
                signatureText: 'Complex signature',
                showCancelModal: false,
            })
        })

        it('should maintain state consistency during initialization and updates', () => {
            const { result } = renderHook(() => useEmailIntegrationUpdate())

            const integration = fromJS({
                name: 'Initial Name',
                meta: {
                    use_gmail_categories: true,
                    signature: {
                        text: 'Initial signature',
                    },
                },
            })

            act(() => {
                result.current.initializeFromIntegration(integration)
            })

            expect(result.current.state.dirty).toBe(false)
            expect(result.current.state.isInitialized).toBe(true)

            act(() => {
                result.current.setName('Modified Name')
            })

            expect(result.current.state.dirty).toBe(true)
            expect(result.current.state.name).toBe('Modified Name')
            expect(result.current.state.useGmailCategories).toBe(true)
        })
    })

    describe('function behavior', () => {
        it('should create new function instances on each render', () => {
            const { result, rerender } = renderHook(() =>
                useEmailIntegrationUpdate(),
            )

            const firstRenderFunctions = {
                setName: result.current.setName,
                submitIntegration: result.current.submitIntegration,
            }

            rerender()

            expect(result.current.setName).not.toBe(
                firstRenderFunctions.setName,
            )
            expect(result.current.submitIntegration).not.toBe(
                firstRenderFunctions.submitIntegration,
            )
        })
    })
})
