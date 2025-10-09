import { act, renderHook } from '@testing-library/react'

import { useAccessManagementForm } from '../useAccessManagementForm'

describe('useAccessManagementForm', () => {
    const defaultProps = {
        clientId: 'test-client-id',
        clientSecret: 'test-secret',
        metadataUrl: 'https://test.okta.com',
        mode: 'create' as const,
        providerName: 'TestProvider',
    }

    describe('Form validation', () => {
        describe('Provider name validation', () => {
            it.each([
                ['', 'Provider name is required', false],
                ['   ', 'Provider name is required', false],
                ['a'.repeat(100), null, true],
                ['Test Provider! @#$%', null, true],
                ['ValidProvider', null, true],
                ['provider-123', null, true],
                ['provider_name', null, true],
                ['Provider_Name-123', null, true],
            ])(
                'validates provider name: "%s"',
                (name, expectedError, expectedValid) => {
                    const { result } = renderHook(() =>
                        useAccessManagementForm({
                            ...defaultProps,
                            providerName: name,
                        }),
                    )

                    expect(result.current.validationErrors.providerName).toBe(
                        expectedError,
                    )
                    if (expectedValid !== undefined) {
                        expect(result.current.isFormValid).toBe(expectedValid)
                    }
                },
            )
        })

        describe('Client ID validation', () => {
            it.each([
                ['', 'Client ID is required', false],
                ['   ', 'Client ID is required', false],
                ['valid-client-id-123', null, true],
            ])(
                'validates client ID: "%s"',
                (clientId, expectedError, expectedValid) => {
                    const { result } = renderHook(() =>
                        useAccessManagementForm({
                            ...defaultProps,
                            clientId,
                        }),
                    )

                    expect(result.current.validationErrors.clientId).toBe(
                        expectedError,
                    )
                    if (expectedValid !== undefined) {
                        expect(result.current.isFormValid).toBe(expectedValid)
                    }
                },
            )
        })

        describe('Client secret validation', () => {
            describe('Create mode', () => {
                it.each([
                    ['', 'Client secret is required', false],
                    ['   ', 'Client secret is required', false],
                    ['valid-secret', null, true],
                ])(
                    'validates client secret in create mode: "%s"',
                    (clientSecret, expectedError, expectedValid) => {
                        const { result } = renderHook(() =>
                            useAccessManagementForm({
                                ...defaultProps,
                                mode: 'create',
                                clientSecret,
                            }),
                        )

                        expect(
                            result.current.validationErrors.clientSecret,
                        ).toBe(expectedError)
                        if (expectedValid !== undefined) {
                            expect(result.current.isFormValid).toBe(
                                expectedValid,
                            )
                        }
                    },
                )
            })

            describe('Edit mode', () => {
                it.each([
                    ['', null],
                    ['   ', null],
                    ['new-secret', null],
                ])(
                    'allows any client secret in edit mode: "%s"',
                    (clientSecret, expectedError) => {
                        const { result } = renderHook(() =>
                            useAccessManagementForm({
                                ...defaultProps,
                                mode: 'edit',
                                clientSecret,
                            }),
                        )

                        expect(
                            result.current.validationErrors.clientSecret,
                        ).toBe(expectedError)
                    },
                )
            })
        })

        describe('Metadata URL validation', () => {
            it.each([
                ['', 'Provider URL is required', false],
                ['   ', 'Provider URL is required', false],
                [
                    'not-a-valid-url-@#$%',
                    'Please enter a valid URL or domain',
                    false,
                ],
                ['https://test.okta.com', null, true],
                [
                    'https://test.okta.com/.well-known/openid-configuration',
                    null,
                    true,
                ],
                [
                    'http://localhost:8080/auth',
                    'Please enter a valid URL or domain',
                    false,
                ],
                ['https://auth.example.com/oauth2/default', null, true],
                ['https://example.com:8080', null, true],
                ['//example.com', null, true], // Valid - protocol-relative URL
                ['example.com', null, true],
                ['subdomain.example.com', null, true],
                ['localhost:8080', 'Please enter a valid URL or domain', false],
                [
                    'invalid..domain',
                    'Please enter a valid URL or domain',
                    false,
                ],
                [
                    'space in domain.com',
                    'Please enter a valid URL or domain',
                    false,
                ],
            ])(
                'validates metadata URL: "%s"',
                (metadataUrl, expectedError, expectedValid) => {
                    const { result } = renderHook(() =>
                        useAccessManagementForm({
                            ...defaultProps,
                            metadataUrl,
                        }),
                    )

                    expect(result.current.validationErrors.metadataUrl).toBe(
                        expectedError,
                    )
                    if (expectedValid !== undefined) {
                        expect(result.current.isFormValid).toBe(expectedValid)
                    }
                },
            )
        })
    })

    describe('Form validity', () => {
        it('handles form validity state changes', () => {
            const { result, rerender } = renderHook(
                (props) => useAccessManagementForm(props),
                {
                    initialProps: {
                        ...defaultProps,
                        providerName: '',
                    },
                },
            )

            expect(result.current.isFormValid).toBe(false)

            rerender({
                ...defaultProps,
                providerName: 'ValidProvider',
            })

            expect(result.current.isFormValid).toBe(true)
        })
    })

    describe('Field errors and touched state', () => {
        it('manages touched fields and error display', () => {
            const { result } = renderHook(() =>
                useAccessManagementForm({
                    ...defaultProps,
                    providerName: '',
                    clientId: '',
                }),
            )

            expect(result.current.fieldErrors.providerName).toBeUndefined()
            expect(result.current.fieldErrors.clientId).toBeUndefined()

            act(() => {
                result.current.markFieldAsTouched('providerName')
                result.current.markFieldAsTouched('clientId')
            })

            expect(result.current.fieldErrors.providerName).toBe(
                'Provider name is required',
            )
            expect(result.current.fieldErrors.clientId).toBe(
                'Client ID is required',
            )
        })

        it('preserves touched state across rerenders', () => {
            const { result, rerender } = renderHook(
                (props) => useAccessManagementForm(props),
                {
                    initialProps: {
                        ...defaultProps,
                        providerName: '',
                    },
                },
            )

            act(() => {
                result.current.markFieldAsTouched('providerName')
            })

            expect(result.current.fieldErrors.providerName).toBe(
                'Provider name is required',
            )

            rerender({
                ...defaultProps,
                providerName: 'ValidName',
            })

            expect(result.current.fieldErrors.providerName).toBeUndefined()
        })
    })

    describe('Validation callback', () => {
        it('calls onValidationChange when form validity changes', () => {
            const onValidationChange = jest.fn()
            const { rerender } = renderHook(
                (props) => useAccessManagementForm(props),
                {
                    initialProps: {
                        ...defaultProps,
                        onValidationChange,
                    },
                },
            )

            expect(onValidationChange).toHaveBeenCalledWith(true)

            rerender({
                ...defaultProps,
                providerName: '',
                onValidationChange,
            })

            expect(onValidationChange).toHaveBeenCalledWith(false)
        })

        it('does not call onValidationChange if not provided', () => {
            const { rerender } = renderHook(
                (props) => useAccessManagementForm(props),
                {
                    initialProps: defaultProps,
                },
            )

            rerender({
                ...defaultProps,
                providerName: '',
            })
        })
    })
})
