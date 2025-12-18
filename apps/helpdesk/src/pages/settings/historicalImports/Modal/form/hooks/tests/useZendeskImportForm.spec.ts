import { act, renderHook } from '@testing-library/react'

import { useCreateIntegration } from '@gorgias/helpdesk-queries'

import { IntegrationType } from 'models/integration/types'

import { useZendeskImportForm } from '../useZendeskImportForm'

jest.mock('@gorgias/helpdesk-queries', () => ({
    useCreateIntegration: jest.fn(),
}))

describe('useZendeskImportForm', () => {
    const mockCreateIntegration = jest.fn()
    const mockOnSuccess = jest.fn()
    const mockOnError = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useCreateIntegration as jest.Mock).mockReturnValue({
            mutate: mockCreateIntegration,
            isLoading: false,
        })
    })

    it('should initialize with empty form state and isFormValid as false when form is empty', () => {
        const { result } = renderHook(() =>
            useZendeskImportForm({
                onSuccess: mockOnSuccess,
                onError: mockOnError,
            }),
        )

        expect(result.current.formState.subdomain).toBe('')
        expect(result.current.formState.loginEmail).toBe('')
        expect(result.current.formState.apiKey).toBe('')
        expect(result.current.isFormValid).toBe(false)
    })

    it('should return isFormValid as true when all fields are filled', () => {
        const { result } = renderHook(() =>
            useZendeskImportForm({
                onSuccess: mockOnSuccess,
                onError: mockOnError,
            }),
        )

        act(() => {
            result.current.formActions.setSubdomain('acme')
            result.current.formActions.setLoginEmail('test@example.com')
            result.current.formActions.setApiKey('test-api-key')
        })

        expect(result.current.isFormValid).toBe(true)
    })

    it('should call createIntegration with correct data on submit', () => {
        const { result } = renderHook(() =>
            useZendeskImportForm({
                onSuccess: mockOnSuccess,
                onError: mockOnError,
            }),
        )

        act(() => {
            result.current.formActions.setSubdomain('acme')
            result.current.formActions.setLoginEmail('test@example.com')
            result.current.formActions.setApiKey('test-key')
        })

        act(() => {
            result.current.handleSubmit()
        })

        expect(mockCreateIntegration).toHaveBeenCalledWith({
            data: expect.objectContaining({
                name: 'acme',
                type: IntegrationType.Zendesk,
                connections: [
                    {
                        type: 'zendesk_auth_data',
                        data: {
                            domain: 'acme',
                            email: 'test@example.com',
                            api_key: 'test-key',
                        },
                    },
                ],
            }),
        })
    })

    it('should extract subdomain from full domain format', () => {
        const { result } = renderHook(() =>
            useZendeskImportForm({
                onSuccess: mockOnSuccess,
                onError: mockOnError,
            }),
        )

        act(() => {
            result.current.formActions.setSubdomain('acme.zendesk.com')
            result.current.formActions.setLoginEmail('test@example.com')
            result.current.formActions.setApiKey('test-key')
        })

        act(() => {
            result.current.handleSubmit()
        })

        expect(mockCreateIntegration).toHaveBeenCalledWith({
            data: expect.objectContaining({
                name: 'acme',
                connections: [
                    {
                        type: 'zendesk_auth_data',
                        data: expect.objectContaining({
                            domain: 'acme',
                        }),
                    },
                ],
            }),
        })
    })

    it('should extract subdomain from URL format', () => {
        const { result } = renderHook(() =>
            useZendeskImportForm({
                onSuccess: mockOnSuccess,
                onError: mockOnError,
            }),
        )

        act(() => {
            result.current.formActions.setSubdomain('https://acme.zendesk.com')
            result.current.formActions.setLoginEmail('test@example.com')
            result.current.formActions.setApiKey('test-key')
        })

        act(() => {
            result.current.handleSubmit()
        })

        expect(mockCreateIntegration).toHaveBeenCalledWith({
            data: expect.objectContaining({
                name: 'acme',
                connections: [
                    {
                        type: 'zendesk_auth_data',
                        data: expect.objectContaining({
                            domain: 'acme',
                        }),
                    },
                ],
            }),
        })
    })

    it('should include deactivated_datetime in integration data', () => {
        const { result } = renderHook(() =>
            useZendeskImportForm({
                onSuccess: mockOnSuccess,
                onError: mockOnError,
            }),
        )

        act(() => {
            result.current.formActions.setSubdomain('acme')
            result.current.formActions.setLoginEmail('test@example.com')
            result.current.formActions.setApiKey('test-key')
        })

        act(() => {
            result.current.handleSubmit()
        })

        expect(mockCreateIntegration).toHaveBeenCalledWith({
            data: expect.objectContaining({
                deactivated_datetime: expect.any(String),
            }),
        })
    })

    it('should prevent default on form submit event', () => {
        const { result } = renderHook(() =>
            useZendeskImportForm({
                onSuccess: mockOnSuccess,
                onError: mockOnError,
            }),
        )

        const mockEvent = {
            preventDefault: jest.fn(),
        } as unknown as React.FormEvent

        act(() => {
            result.current.handleSubmit(mockEvent)
        })

        expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('should call onSuccess when integration is created successfully', async () => {
        let capturedOnSuccess: (() => void) | undefined
        ;(useCreateIntegration as jest.Mock).mockImplementation(
            ({ mutation }) => {
                capturedOnSuccess = mutation.onSuccess
                return {
                    mutate: mockCreateIntegration,
                    isLoading: false,
                }
            },
        )

        renderHook(() =>
            useZendeskImportForm({
                onSuccess: mockOnSuccess,
                onError: mockOnError,
            }),
        )

        expect(capturedOnSuccess).toBeDefined()

        act(() => {
            capturedOnSuccess!()
        })

        expect(mockOnSuccess).toHaveBeenCalled()
    })

    it('should call onError when integration creation fails', async () => {
        let capturedOnError: (() => void) | undefined
        ;(useCreateIntegration as jest.Mock).mockImplementation(
            ({ mutation }) => {
                capturedOnError = mutation.onError
                return {
                    mutate: mockCreateIntegration,
                    isLoading: false,
                }
            },
        )

        renderHook(() =>
            useZendeskImportForm({
                onSuccess: mockOnSuccess,
                onError: mockOnError,
            }),
        )

        expect(capturedOnError).toBeDefined()

        act(() => {
            capturedOnError!()
        })

        expect(mockOnError).toHaveBeenCalled()
    })

    it('should return isLoading state from useCreateIntegration', () => {
        ;(useCreateIntegration as jest.Mock).mockReturnValue({
            mutate: mockCreateIntegration,
            isLoading: true,
        })

        const { result } = renderHook(() =>
            useZendeskImportForm({
                onSuccess: mockOnSuccess,
                onError: mockOnError,
            }),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should set email error when invalid email is entered', () => {
        const { result } = renderHook(() =>
            useZendeskImportForm({
                onSuccess: mockOnSuccess,
                onError: mockOnError,
            }),
        )

        act(() => {
            result.current.formActions.setLoginEmail('invalid-email')
        })

        expect(result.current.formErrors.emailError).toBe(
            'Please enter a valid email address',
        )
    })

    it('should clear email error when valid email is entered', () => {
        const { result } = renderHook(() =>
            useZendeskImportForm({
                onSuccess: mockOnSuccess,
                onError: mockOnError,
            }),
        )

        act(() => {
            result.current.formActions.setLoginEmail('invalid-email')
        })

        expect(result.current.formErrors.emailError).toBe(
            'Please enter a valid email address',
        )

        act(() => {
            result.current.formActions.setLoginEmail('valid@example.com')
        })

        expect(result.current.formErrors.emailError).toBe('')
    })

    it('should not set email error when email is empty', () => {
        const { result } = renderHook(() =>
            useZendeskImportForm({
                onSuccess: mockOnSuccess,
                onError: mockOnError,
            }),
        )

        act(() => {
            result.current.formActions.setLoginEmail('')
        })

        expect(result.current.formErrors.emailError).toBe('')
    })

    it('should return isFormValid as false when email has error', () => {
        const { result } = renderHook(() =>
            useZendeskImportForm({
                onSuccess: mockOnSuccess,
                onError: mockOnError,
            }),
        )

        act(() => {
            result.current.formActions.setSubdomain('acme')
            result.current.formActions.setLoginEmail('invalid-email')
            result.current.formActions.setApiKey('test-key')
        })

        expect(result.current.isFormValid).toBe(false)
    })

    it('should not submit form when email is invalid', () => {
        const { result } = renderHook(() =>
            useZendeskImportForm({
                onSuccess: mockOnSuccess,
                onError: mockOnError,
            }),
        )

        act(() => {
            result.current.formActions.setSubdomain('acme')
            result.current.formActions.setLoginEmail('invalid-email')
            result.current.formActions.setApiKey('test-key')
        })

        expect(result.current.formErrors.emailError).toBe(
            'Please enter a valid email address',
        )

        act(() => {
            result.current.handleSubmit()
        })

        expect(mockCreateIntegration).not.toHaveBeenCalled()
    })
})
