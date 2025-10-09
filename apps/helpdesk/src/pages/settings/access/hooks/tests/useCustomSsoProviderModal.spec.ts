import { act, renderHook } from '@testing-library/react'

import type { CustomSSOProviderData, ModalMode } from '../../types'
import { useCustomSsoProviderModal } from '../useCustomSsoProviderModal'

describe('useCustomSsoProviderModal', () => {
    const mockOnSave = jest.fn()

    const defaultProps = {
        initialData: null as CustomSSOProviderData | null,
        isOpen: true,
        mode: 'create' as ModalMode,
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
                expect(result.current.clientSecret).toBeUndefined()
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
                expect(result.current.clientSecret).toBeUndefined()
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
                expect(result.current.clientSecret).toBeUndefined()
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
                    result.current.setClientSecret('new-secret')
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
                    result.current.setClientSecret('new-secret')
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
                    result.current.setClientSecret('updated-secret')
                })

                expect(result.current.clientSecret).toBe('updated-secret')
            })

            it('sends undefined client secret when not changed in edit mode', () => {
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
                        clientSecret: undefined,
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
                    result.current.setClientSecret('updated-secret')
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
                    result.current.setClientSecret('secret-456')
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
                result.current.setClientSecret('secret-456')
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
                result.current.setClientSecret('secret-456')
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
                result.current.setClientSecret('secret-456')
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
                result.current.setClientSecret('secret-456')
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
                result.current.setClientSecret('secret-456')
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
                result.current.setClientSecret('secret-456')
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
            expect(result.current.clientSecret).toBeUndefined()
            expect(result.current.metadataUrl).toBe('https://example.com')
        })
    })
})
