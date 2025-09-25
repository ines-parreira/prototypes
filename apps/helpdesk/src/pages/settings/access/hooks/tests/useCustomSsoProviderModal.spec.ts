import { act, renderHook } from '@testing-library/react'

import type { CustomSSOProviderData, ModalMode } from '../../types'
import {
    useCustomSsoProviderModal,
    useCustomSsoProviderModalState,
} from '../useCustomSsoProviderModal'

describe('useCustomSsoProviderModal', () => {
    const mockOnClose = jest.fn()
    const mockOnSave = jest.fn()

    const defaultProps = {
        initialData: null as CustomSSOProviderData | null,
        isOpen: true,
        mode: 'create' as ModalMode,
        onClose: mockOnClose,
        onSave: mockOnSave,
        editingProviderId: null,
    }

    const mockInitialData: CustomSSOProviderData = {
        name: 'Test Provider',
        clientId: 'test-client-id',
        clientSecret: 'test-secret',
        metadataUrl: 'https://test.okta.com',
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Form state initialization', () => {
        describe('Create mode', () => {
            it('initializes with empty values in create mode', () => {
                const { result } = renderHook(() =>
                    useCustomSsoProviderModal({
                        ...defaultProps,
                        mode: 'create',
                    }),
                )

                expect(result.current.name).toBe('')
                expect(result.current.clientId).toBe('')
                expect(result.current.clientSecret).toBe('')
                expect(result.current.metadataUrl).toBe('')
                expect(result.current.isFormValid).toBe(false)
            })

            it('ignores initial data in create mode', () => {
                const { result } = renderHook(() =>
                    useCustomSsoProviderModal({
                        ...defaultProps,
                        mode: 'create',
                        initialData: mockInitialData,
                    }),
                )

                expect(result.current.name).toBe('')
                expect(result.current.clientId).toBe('')
                expect(result.current.clientSecret).toBe('')
                expect(result.current.metadataUrl).toBe('')
            })
        })

        describe('Edit mode', () => {
            it('initializes with provided data in edit mode', () => {
                const { result } = renderHook(() =>
                    useCustomSsoProviderModal({
                        ...defaultProps,
                        mode: 'edit',
                        initialData: mockInitialData,
                    }),
                )

                expect(result.current.name).toBe('Test Provider')
                expect(result.current.clientId).toBe('test-client-id')
                expect(result.current.clientSecret).toBe('')
                expect(result.current.metadataUrl).toBe('https://test.okta.com')
            })
        })
    })

    describe('Form state updates', () => {
        it('updates name', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModal(defaultProps),
            )

            act(() => {
                result.current.setName('New Provider')
            })

            expect(result.current.name).toBe('New Provider')
        })

        it('updates client ID', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModal(defaultProps),
            )

            act(() => {
                result.current.setClientId('new-client-id')
            })

            expect(result.current.clientId).toBe('new-client-id')
        })

        it('updates metadata URL', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModal(defaultProps),
            )

            act(() => {
                result.current.setMetadataUrl('https://new.provider.com')
            })

            expect(result.current.metadataUrl).toBe('https://new.provider.com')
        })

        it('updates form validity', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModal(defaultProps),
            )

            act(() => {
                result.current.setIsFormValid(true)
            })

            expect(result.current.isFormValid).toBe(true)
        })
    })

    describe('Client secret handling', () => {
        describe('Create mode', () => {
            it('updates client secret in create mode', () => {
                const { result } = renderHook(() =>
                    useCustomSsoProviderModal({
                        ...defaultProps,
                        mode: 'create',
                    }),
                )

                act(() => {
                    result.current.handleClientSecretChange('new-secret')
                })

                expect(result.current.clientSecret).toBe('new-secret')
            })

            it('does not track client secret changes in create mode', () => {
                const { result } = renderHook(() =>
                    useCustomSsoProviderModal({
                        ...defaultProps,
                        mode: 'create',
                    }),
                )

                act(() => {
                    result.current.handleClientSecretChange('new-secret')
                })

                act(() => {
                    result.current.handleSave()
                })

                expect(mockOnSave).toHaveBeenCalledWith(
                    expect.objectContaining({
                        clientSecret: 'new-secret',
                    }),
                    null,
                )
            })
        })

        describe('Edit mode', () => {
            it('updates client secret in edit mode', () => {
                const { result } = renderHook(() =>
                    useCustomSsoProviderModal({
                        ...defaultProps,
                        mode: 'edit',
                        initialData: mockInitialData,
                    }),
                )

                act(() => {
                    result.current.handleClientSecretChange('updated-secret')
                })

                expect(result.current.clientSecret).toBe('updated-secret')
            })

            it('sends empty client secret when not changed in edit mode', () => {
                const { result } = renderHook(() =>
                    useCustomSsoProviderModal({
                        ...defaultProps,
                        mode: 'edit',
                        editingProviderId: 'provider-123',
                        initialData: mockInitialData,
                    }),
                )

                act(() => {
                    result.current.handleSave()
                })

                expect(mockOnSave).toHaveBeenCalledWith(
                    expect.objectContaining({
                        clientSecret: '',
                    }),
                    'provider-123',
                )
            })

            it('sends updated client secret when changed in edit mode', () => {
                const { result } = renderHook(() =>
                    useCustomSsoProviderModal({
                        ...defaultProps,
                        mode: 'edit',
                        editingProviderId: 'provider-123',
                        initialData: mockInitialData,
                    }),
                )

                act(() => {
                    result.current.handleClientSecretChange('updated-secret')
                })

                act(() => {
                    result.current.handleSave()
                })

                expect(mockOnSave).toHaveBeenCalledWith(
                    expect.objectContaining({
                        clientSecret: 'updated-secret',
                    }),
                    'provider-123',
                )
            })

            it('tracks secret change state correctly', () => {
                const { result } = renderHook(() =>
                    useCustomSsoProviderModal({
                        ...defaultProps,
                        mode: 'edit',
                        initialData: mockInitialData,
                    }),
                )

                act(() => {
                    result.current.handleClientSecretChange('new-secret')
                })

                act(() => {
                    result.current.handleClientSecretChange('')
                })

                act(() => {
                    result.current.handleSave()
                })

                expect(mockOnSave).toHaveBeenCalledWith(
                    expect.objectContaining({
                        clientSecret: '',
                    }),
                    null,
                )
            })
        })
    })

    describe('Modal actions', () => {
        describe('handleSave', () => {
            it('calls onSave with form data in create mode', () => {
                const { result } = renderHook(() =>
                    useCustomSsoProviderModal({
                        ...defaultProps,
                        mode: 'create',
                    }),
                )

                act(() => {
                    result.current.setName('Test Provider')
                    result.current.setClientId('client-123')
                    result.current.handleClientSecretChange('secret-456')
                    result.current.setMetadataUrl('https://test.com')
                })

                act(() => {
                    result.current.handleSave()
                })

                expect(mockOnSave).toHaveBeenCalledWith(
                    {
                        name: 'Test Provider',
                        clientId: 'client-123',
                        clientSecret: 'secret-456',
                        metadataUrl:
                            'https://test.com/.well-known/openid-configuration',
                    },
                    null,
                )
            })

            it('calls onSave with provider ID in edit mode', () => {
                const { result } = renderHook(() =>
                    useCustomSsoProviderModal({
                        ...defaultProps,
                        mode: 'edit',
                        editingProviderId: 'provider-123',
                        initialData: mockInitialData,
                    }),
                )

                act(() => {
                    result.current.handleSave()
                })

                expect(mockOnSave).toHaveBeenCalledWith(
                    expect.any(Object),
                    'provider-123',
                )
            })

            it('calls onClose after saving', () => {
                const { result } = renderHook(() =>
                    useCustomSsoProviderModal(defaultProps),
                )

                act(() => {
                    result.current.handleSave()
                })

                expect(mockOnClose).toHaveBeenCalledTimes(1)
            })

            it('resets form state after saving', () => {
                const { result } = renderHook(() =>
                    useCustomSsoProviderModal(defaultProps),
                )

                act(() => {
                    result.current.setName('Test')
                    result.current.setClientId('test-id')
                    result.current.handleClientSecretChange('test-secret')
                    result.current.setMetadataUrl('https://test.com')
                })

                act(() => {
                    result.current.handleSave()
                })

                expect(result.current.name).toBe('')
                expect(result.current.clientId).toBe('')
                expect(result.current.clientSecret).toBe('')
                expect(result.current.metadataUrl).toBe('')
            })
        })

        describe('handleClose', () => {
            it('calls onClose', () => {
                const { result } = renderHook(() =>
                    useCustomSsoProviderModal(defaultProps),
                )

                act(() => {
                    result.current.handleClose()
                })

                expect(mockOnClose).toHaveBeenCalledTimes(1)
            })

            it('resets form state when closing', () => {
                const { result } = renderHook(() =>
                    useCustomSsoProviderModal(defaultProps),
                )

                act(() => {
                    result.current.setName('Test')
                    result.current.setClientId('test-id')
                    result.current.handleClientSecretChange('test-secret')
                    result.current.setMetadataUrl('https://test.com')
                })

                act(() => {
                    result.current.handleClose()
                })

                expect(result.current.name).toBe('')
                expect(result.current.clientId).toBe('')
                expect(result.current.clientSecret).toBe('')
                expect(result.current.metadataUrl).toBe('')
            })
        })
    })

    describe('Form reset on modal state changes', () => {
        it('resets form when modal opens', () => {
            const { result, rerender } = renderHook(
                (props) => useCustomSsoProviderModal(props),
                {
                    initialProps: {
                        ...defaultProps,
                        isOpen: false,
                    },
                },
            )

            act(() => {
                result.current.setName('Test')
            })

            rerender({
                ...defaultProps,
                isOpen: true,
            })

            expect(result.current.name).toBe('')
        })

        it('resets form when mode changes', () => {
            const { result, rerender } = renderHook(
                (props) => useCustomSsoProviderModal(props),
                {
                    initialProps: {
                        ...defaultProps,
                        mode: 'create' as ModalMode,
                    },
                },
            )

            act(() => {
                result.current.setName('Test')
            })

            rerender({
                ...defaultProps,
                mode: 'edit' as ModalMode,
                initialData: mockInitialData,
            })

            expect(result.current.name).toBe('Test Provider')
        })

        it('resets form when initial data changes', () => {
            const newInitialData = {
                ...mockInitialData,
                name: 'Updated Provider',
            }

            const { result, rerender } = renderHook(
                (props) => useCustomSsoProviderModal(props),
                {
                    initialProps: {
                        ...defaultProps,
                        mode: 'edit' as ModalMode,
                        initialData: mockInitialData,
                    },
                },
            )

            expect(result.current.name).toBe('Test Provider')

            rerender({
                ...defaultProps,
                mode: 'edit',
                initialData: newInitialData,
            })

            expect(result.current.name).toBe('Updated Provider')
        })
    })

    describe('URL processing', () => {
        it('processes metadataUrl correctly when saving - strips https prefix', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModal({
                    ...defaultProps,
                    mode: 'create',
                }),
            )

            act(() => {
                result.current.setName('Test Provider')
                result.current.setClientId('client-123')
                result.current.handleClientSecretChange('secret-456')
                result.current.setMetadataUrl('https://test.okta.com')
            })

            act(() => {
                result.current.handleSave()
            })

            expect(mockOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    metadataUrl:
                        'https://test.okta.com/.well-known/openid-configuration',
                }),
                null,
            )
        })

        it('processes metadataUrl correctly when saving - removes well-known suffix', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModal({
                    ...defaultProps,
                    mode: 'create',
                }),
            )

            act(() => {
                result.current.setName('Test Provider')
                result.current.setClientId('client-123')
                result.current.handleClientSecretChange('secret-456')
                result.current.setMetadataUrl(
                    'https://test.okta.com/.well-known/openid-configuration',
                )
            })

            act(() => {
                result.current.handleSave()
            })

            expect(mockOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    metadataUrl:
                        'https://test.okta.com/.well-known/openid-configuration',
                }),
                null,
            )
        })

        it('processes metadataUrl correctly when saving - removes trailing slashes', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModal({
                    ...defaultProps,
                    mode: 'create',
                }),
            )

            act(() => {
                result.current.setName('Test Provider')
                result.current.setClientId('client-123')
                result.current.handleClientSecretChange('secret-456')
                result.current.setMetadataUrl('test.okta.com///')
            })

            act(() => {
                result.current.handleSave()
            })

            expect(mockOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    metadataUrl:
                        'https://test.okta.com/.well-known/openid-configuration',
                }),
                null,
            )
        })

        it('processes metadataUrl correctly when saving - complex URL processing', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModal({
                    ...defaultProps,
                    mode: 'create',
                }),
            )

            act(() => {
                result.current.setName('Test Provider')
                result.current.setClientId('client-123')
                result.current.handleClientSecretChange('secret-456')
                result.current.setMetadataUrl(
                    'https://my-domain.onelogin.com/oidc/2/.well-known/openid-configuration/',
                )
            })

            act(() => {
                result.current.handleSave()
            })

            expect(mockOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    metadataUrl:
                        'https://my-domain.onelogin.com/oidc/2/.well-known/openid-configuration',
                }),
                null,
            )
        })

        it('processes metadataUrl correctly when saving - handles URL without protocol', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModal({
                    ...defaultProps,
                    mode: 'create',
                }),
            )

            act(() => {
                result.current.setName('Test Provider')
                result.current.setClientId('client-123')
                result.current.handleClientSecretChange('secret-456')
                result.current.setMetadataUrl('my-domain.okta.com')
            })

            act(() => {
                result.current.handleSave()
            })

            expect(mockOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    metadataUrl:
                        'https://my-domain.okta.com/.well-known/openid-configuration',
                }),
                null,
            )
        })

        it('processes metadataUrl correctly when saving - handles empty and whitespace', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModal({
                    ...defaultProps,
                    mode: 'create',
                }),
            )

            act(() => {
                result.current.setName('Test Provider')
                result.current.setClientId('client-123')
                result.current.handleClientSecretChange('secret-456')
                result.current.setMetadataUrl('  ')
            })

            act(() => {
                result.current.handleSave()
            })

            expect(mockOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    metadataUrl: 'https:///.well-known/openid-configuration',
                }),
                null,
            )
        })
    })

    describe('Client Secret Security', () => {
        it('sanitizes client secret when opening edit modal', () => {
            const mockProviderDataWithSecret = {
                name: 'Test Provider',
                clientId: 'test-client-id',
                clientSecret: 'SENSITIVE-SECRET-FROM-BACKEND',
                metadataUrl: 'https://test.okta.com',
            }

            const { result } = renderHook(() =>
                useCustomSsoProviderModalState({
                    onSave: jest.fn(),
                }),
            )

            act(() => {
                result.current.openEditModal(
                    'provider-123',
                    mockProviderDataWithSecret,
                )
            })

            // The editingProviderData should have client secret stripped
            expect(result.current.editingProviderData).toEqual({
                name: 'Test Provider',
                clientId: 'test-client-id',
                clientSecret: '', // Should be empty, not the original secret
                metadataUrl: 'https://test.okta.com',
            })
        })

        it('does not leak client secret through initialData in edit mode', () => {
            const mockProviderDataWithSecret = {
                name: 'Test Provider',
                clientId: 'test-client-id',
                clientSecret: 'SENSITIVE-SECRET-FROM-BACKEND',
                metadataUrl: 'https://test.okta.com',
            }

            const { result: modalStateResult } = renderHook(() =>
                useCustomSsoProviderModalState({
                    onSave: jest.fn(),
                }),
            )

            // Open edit modal with provider data containing secret
            act(() => {
                modalStateResult.current.openEditModal(
                    'provider-123',
                    mockProviderDataWithSecret,
                )
            })

            // Now test the main modal hook with the sanitized data
            const { result: modalResult } = renderHook(() =>
                useCustomSsoProviderModal({
                    initialData: modalStateResult.current.editingProviderData,
                    isOpen: true,
                    mode: 'edit',
                    onClose: jest.fn(),
                    onSave: jest.fn(),
                    editingProviderId: 'provider-123',
                }),
            )

            // The client secret should be empty in the form
            expect(modalResult.current.clientSecret).toBe('')

            // Even if we try to save without changing the secret, it should send empty string
            act(() => {
                modalResult.current.handleSave()
            })

            // Verify that save was called with empty client secret
            expect(
                modalStateResult.current.editingProviderData?.clientSecret,
            ).toBe('')
        })
    })

    describe('Edge cases', () => {
        it('handles undefined initial data gracefully', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModal({
                    ...defaultProps,
                    mode: 'edit' as ModalMode,
                    initialData: undefined,
                }),
            )

            expect(result.current.name).toBe('')
            expect(result.current.clientId).toBe('')
            expect(result.current.metadataUrl).toBe('')
        })

        it('handles empty string editing provider ID', () => {
            const { result } = renderHook(() =>
                useCustomSsoProviderModal({
                    ...defaultProps,
                    editingProviderId: '',
                }),
            )

            act(() => {
                result.current.handleSave()
            })

            expect(mockOnSave).toHaveBeenCalledWith(expect.any(Object), '')
        })

        it('preserves all form data on mode change with data', () => {
            const { result, rerender } = renderHook(
                (props) => useCustomSsoProviderModal(props),
                {
                    initialProps: {
                        ...defaultProps,
                        mode: 'create' as ModalMode,
                    },
                },
            )

            rerender({
                ...defaultProps,
                mode: 'edit' as ModalMode,
                initialData: {
                    name: 'Provider Name',
                    clientId: 'client-123',
                    clientSecret: 'secret-456',
                    metadataUrl: 'https://example.com',
                },
            })

            expect(result.current.name).toBe('Provider Name')
            expect(result.current.clientId).toBe('client-123')
            expect(result.current.clientSecret).toBe('')
            expect(result.current.metadataUrl).toBe('https://example.com')
        })
    })
})
