import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { DEFAULT_PLAYGROUND_CUSTOMER } from '../../../constants'
import { useMessagesContext } from '../../contexts/MessagesContext'
import { useSettingsContext } from '../../contexts/SettingsContext'
import { usePlaygroundForm } from '../usePlaygroundForm'

jest.mock('../../contexts/MessagesContext', () => ({
    useMessagesContext: jest.fn(),
}))

jest.mock('../../contexts/SettingsContext', () => ({
    useSettingsContext: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticles', () => ({
    useGuidanceArticles: jest.fn(() => ({
        guidanceArticles: [],
    })),
}))

jest.mock('../../../hooks/usePublicResources', () => ({
    usePublicResources: jest.fn(() => ({
        sourceItems: [],
    })),
}))

jest.mock('../../../hooks/usePublicResourcesPooling', () => ({
    usePublicResourcesPooling: jest.fn(),
}))

jest.mock('../../../hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: jest.fn(() => ({
        routes: {
            configuration: () => '/configuration',
        },
    })),
}))

const mockUseMessagesContext = jest.mocked(useMessagesContext)
const mockUseSettingsContext = jest.mocked(useSettingsContext)

const defaultMessagesContext = {
    draftMessage: '',
    draftSubject: '',
    setDraftMessage: jest.fn(),
    setDraftSubject: jest.fn(),
    messages: [],
    onMessageSend: jest.fn(),
    isMessageSending: false,
    onNewConversation: jest.fn(),
    isWaitingResponse: false,
}

const defaultSettingsContext = {
    selectedCustomer: {
        email: 'test@example.com',
        name: 'Test Customer',
        id: 123,
    },
    chatAvailability: 'online' as const,
    areActionsEnabled: false,
    mode: 'inbound' as const,
    resetSettings: jest.fn(),
    setSettings: jest.fn(),
}

const defaultProps = {
    shopName: 'test-store',
    snippetHelpCenterId: 456,
    helpCenterId: 789,
    guidanceHelpCenterId: 101,
}

describe('usePlaygroundForm', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseMessagesContext.mockReturnValue(defaultMessagesContext as any)
        mockUseSettingsContext.mockReturnValue(defaultSettingsContext as any)
    })

    describe('formValues', () => {
        it('should return form values from contexts', () => {
            const { result } = renderHook(() => usePlaygroundForm(defaultProps))

            expect(result.current.formValues).toEqual({
                message: '',
                subject: '',
                customer: {
                    email: 'test@example.com',
                    name: 'Test Customer',
                    id: 123,
                },
            })
        })

        it('should use default customer from context', () => {
            mockUseSettingsContext.mockReturnValue({
                ...defaultSettingsContext,
                selectedCustomer: DEFAULT_PLAYGROUND_CUSTOMER,
            } as any)

            const { result } = renderHook(() => usePlaygroundForm(defaultProps))

            expect(result.current.formValues.customer).toEqual(
                DEFAULT_PLAYGROUND_CUSTOMER,
            )
        })

        it('should update form values when context values change', () => {
            const { result, rerender } = renderHook(() =>
                usePlaygroundForm(defaultProps),
            )

            expect(result.current.formValues.message).toBe('')

            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesContext,
                draftMessage: 'Hello world',
                draftSubject: 'Test subject',
            } as any)

            rerender()

            expect(result.current.formValues.message).toBe('Hello world')
            expect(result.current.formValues.subject).toBe('Test subject')
        })

        it('should update customer when context customer changes', () => {
            const { result, rerender } = renderHook(() =>
                usePlaygroundForm(defaultProps),
            )

            const newCustomer = {
                email: 'new@example.com',
                name: 'New Customer',
                id: 456,
            }

            mockUseSettingsContext.mockReturnValue({
                ...defaultSettingsContext,
                selectedCustomer: newCustomer,
            } as any)

            rerender()

            expect(result.current.formValues.customer).toEqual(newCustomer)
        })
    })

    describe('onFormValuesChange', () => {
        it('should update message when message key is changed', () => {
            const setDraftMessage = jest.fn()
            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesContext,
                setDraftMessage,
            } as any)

            const { result } = renderHook(() => usePlaygroundForm(defaultProps))

            act(() => {
                result.current.onFormValuesChange('message', 'New message')
            })

            expect(setDraftMessage).toHaveBeenCalledWith('New message')
        })

        it('should update subject when subject key is changed', () => {
            const setDraftSubject = jest.fn()
            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesContext,
                setDraftSubject,
            } as any)

            const { result } = renderHook(() => usePlaygroundForm(defaultProps))

            act(() => {
                result.current.onFormValuesChange('subject', 'New subject')
            })

            expect(setDraftSubject).toHaveBeenCalledWith('New subject')
        })

        it('should update customer when customer key is changed', () => {
            const setSettings = jest.fn()
            mockUseSettingsContext.mockReturnValue({
                ...defaultSettingsContext,
                setSettings,
            } as any)

            const { result } = renderHook(() => usePlaygroundForm(defaultProps))

            const newCustomer = {
                email: 'test@test.com',
                name: 'Test',
                id: 1,
            }

            act(() => {
                result.current.onFormValuesChange('customer', newCustomer)
            })

            expect(setSettings).toHaveBeenCalledWith({
                selectedCustomer: newCustomer,
            })
        })
    })

    describe('clearForm', () => {
        it('should clear message and subject', () => {
            const setDraftMessage = jest.fn()
            const setDraftSubject = jest.fn()
            const setSettings = jest.fn()
            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesContext,
                draftMessage: 'Some message',
                draftSubject: 'Some subject',
                setDraftMessage,
                setDraftSubject,
            } as any)
            mockUseSettingsContext.mockReturnValue({
                ...defaultSettingsContext,
                setSettings,
            } as any)

            const { result } = renderHook(() => usePlaygroundForm(defaultProps))

            act(() => {
                result.current.clearForm()
            })

            expect(setDraftMessage).toHaveBeenCalledWith('')
            expect(setDraftSubject).toHaveBeenCalledWith('')
            expect(setSettings).not.toHaveBeenCalled()
        })
    })

    describe('isFormValid', () => {
        it('should be false when message is empty', () => {
            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesContext,
                draftMessage: '',
            } as any)

            const { result } = renderHook(() => usePlaygroundForm(defaultProps))

            expect(result.current.isFormValid).toBe(false)
        })

        it('should be true when message has content', () => {
            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesContext,
                draftMessage: 'Hello',
            } as any)

            const { result } = renderHook(() => usePlaygroundForm(defaultProps))

            expect(result.current.isFormValid).toBe(true)
        })

        it('should update when message changes', () => {
            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesContext,
                draftMessage: '',
            } as any)

            const { result, rerender } = renderHook(() =>
                usePlaygroundForm(defaultProps),
            )

            expect(result.current.isFormValid).toBe(false)

            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesContext,
                draftMessage: 'New message',
            } as any)

            rerender()

            expect(result.current.isFormValid).toBe(true)
        })
    })

    describe('isDisabled', () => {
        it('should be true when form is invalid', () => {
            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesContext,
                draftMessage: '',
            } as any)

            const { result } = renderHook(() => usePlaygroundForm(defaultProps))

            expect(result.current.isDisabled).toBe(true)
        })

        it('should be false when form is valid and resources are loaded', () => {
            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesContext,
                draftMessage: 'Test message',
            } as any)

            const { result } = renderHook(() => usePlaygroundForm(defaultProps))

            expect(result.current.isDisabled).toBe(false)
        })
    })

    describe('disabledMessage', () => {
        it('should be undefined when form is enabled', () => {
            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesContext,
                draftMessage: 'Test message',
            } as any)

            const { result } = renderHook(() => usePlaygroundForm(defaultProps))

            expect(result.current.disabledMessage).toBeUndefined()
        })
    })

    describe('integration with contexts', () => {
        it('should properly integrate message context updates with form validation', () => {
            const setDraftMessage = jest.fn()
            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesContext,
                draftMessage: '',
                setDraftMessage,
            } as any)

            const { result, rerender } = renderHook(() =>
                usePlaygroundForm(defaultProps),
            )

            expect(result.current.isFormValid).toBe(false)
            expect(result.current.isDisabled).toBe(true)

            act(() => {
                result.current.onFormValuesChange('message', 'New message')
            })

            expect(setDraftMessage).toHaveBeenCalledWith('New message')

            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesContext,
                draftMessage: 'New message',
                setDraftMessage,
            } as any)

            rerender()

            expect(result.current.isFormValid).toBe(true)
            expect(result.current.isDisabled).toBe(false)
        })

        it('should properly integrate clearing with contexts', () => {
            const setDraftMessage = jest.fn()
            const setDraftSubject = jest.fn()
            const setSettings = jest.fn()
            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesContext,
                draftMessage: 'Message',
                draftSubject: 'Subject',
                setDraftMessage,
                setDraftSubject,
            } as any)
            mockUseSettingsContext.mockReturnValue({
                ...defaultSettingsContext,
                setSettings,
            } as any)

            const { result } = renderHook(() => usePlaygroundForm(defaultProps))

            act(() => {
                result.current.clearForm()
            })

            expect(setDraftMessage).toHaveBeenCalledWith('')
            expect(setDraftSubject).toHaveBeenCalledWith('')
            expect(setSettings).not.toHaveBeenCalled()
        })

        it('should use selectedCustomer from SettingsContext in formValues', () => {
            const customCustomer = {
                email: 'custom@example.com',
                name: 'Custom Name',
                id: 999,
            }

            mockUseSettingsContext.mockReturnValue({
                ...defaultSettingsContext,
                selectedCustomer: customCustomer,
            } as any)

            const { result } = renderHook(() => usePlaygroundForm(defaultProps))

            expect(result.current.formValues.customer).toEqual(customCustomer)
        })
    })
})
