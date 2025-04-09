import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { Language } from 'constants/languages'
import {
    GorgiasChatAutoResponderReply,
    GorgiasChatEmailCaptureType,
    GorgiasChatIntegration,
} from 'models/integration/types'
import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useHandoverCustomizationChatOnlineSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOnlineSettingsForm'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import HandoverCustomizationChatOnlineSettings from '../HandoverCustomizationChatOnlineSettings'

// Mock dependencies
jest.mock(
    'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOnlineSettingsForm',
)

jest.mock('pages/aiAgent/providers/AiAgentFormChangesContext')

const mockedIntegration = {
    type: 'gorgias_chat',
    id: '1',
    meta: {
        app_id: 'test-app-id',
        languages: [
            { language: Language.EnglishUs },
            { language: Language.FrenchFr },
        ],
        shop_name: 'test-store',
        shop_type: 'shopify',
        shop_id: '123',
        shop_domain: 'test-store.myshopify.com',
    },
} as unknown as GorgiasChatIntegration

const QueryClientProvider = mockQueryClientProvider()

const defaultState = {}

const renderComponent = (
    integration: GorgiasChatIntegration = mockedIntegration,
) => {
    render(
        <Provider store={mockStore(defaultState)}>
            <QueryClientProvider>
                <HandoverCustomizationChatOnlineSettings
                    integration={integration}
                />
            </QueryClientProvider>
        </Provider>,
    )
}

describe('HandoverCustomizationChatOnlineSettings', () => {
    const mockUpdateValue = jest.fn()
    const mockHandleOnSave = jest.fn()
    const mockHandleOnCancel = jest.fn()

    const mockSetIsFormDirty = jest.fn()

    const mockSetActionCallback = jest.fn()

    const mockOnlineValuesForm = {
        formValues: {
            onlineInstructions: 'Default instructions',
            emailCaptureEnabled: false,
            emailCaptureEnforcement: GorgiasChatEmailCaptureType.Optional,
            autoResponderEnabled: false,
            autoResponderReply: GorgiasChatAutoResponderReply.ReplyDynamic,
        },
        updateValue: mockUpdateValue,
        handleOnSave: mockHandleOnSave,
        handleOnCancel: mockHandleOnCancel,
        isLoading: false,
        isSaving: false,
        hasChanges: false,
    }
    beforeEach(() => {
        jest.clearAllMocks()
        // Default mock implementation
        ;(
            useHandoverCustomizationChatOnlineSettingsForm as jest.Mock
        ).mockReturnValue(mockOnlineValuesForm)
        ;(useAiAgentFormChangesContext as jest.Mock).mockReturnValue({
            setIsFormDirty: mockSetIsFormDirty,
            setActionCallback: mockSetActionCallback,
        })
    })

    it('renders component with all required elements', () => {
        renderComponent(mockedIntegration)

        // Check for main section headers
        screen.getByText('Online instructions')

        // Check for TextArea
        screen.getByRole('textbox')

        // Check for caption text
        screen.getByText(
            /Write optional instructions for AI Agent to follow during handover/i,
        )

        // Check for alert about chat preferences
        screen.getByText(
            /Changes to the settings below will be reflected in your/i,
        )

        // Check for link to chat preferences
        const chatPreferencesLink = screen.getByRole('link', {
            name: 'Chat preferences.',
        })

        expect(chatPreferencesLink.getAttribute('href')).toBe(
            `/app/settings/channels/gorgias_chat/${mockedIntegration.id}/preferences`,
        )

        expect(chatPreferencesLink.getAttribute('target')).toBe('_blank')

        // Check for mocked child components
        screen.getByText(/Enable email capture/i)

        screen.getByText(/Send wait time/i)

        // Check for buttons
        screen.getByText('Save Changes')
        screen.getByText('Cancel')
    })

    it('should show loading spinner when isLoading is true', () => {
        ;(
            useHandoverCustomizationChatOnlineSettingsForm as jest.Mock
        ).mockReturnValue({
            isLoading: true,
        })

        renderComponent(mockedIntegration)

        screen.getByLabelText('Loading')

        expect(screen.queryByText('Instructions')).toBeNull()
    })

    it('should build the correct action callback when the component is mounted', () => {
        renderComponent()

        expect(mockSetActionCallback).toHaveBeenCalledWith(
            StoreConfigFormSection.handoverCustomizationOnlineSettings,
            expect.objectContaining({
                onDiscard: mockHandleOnCancel,
            }),
        )
    })

    describe('Form Interactions', () => {
        it('should handle online instructions changes', async () => {
            renderComponent()

            fireEvent.change(
                screen.getByRole('textbox', {
                    name: 'Online instructions',
                }),
                { target: { value: 'New instructions' } },
            )

            expect(mockUpdateValue).toHaveBeenCalledWith(
                'onlineInstructions',
                'New instructions',
            )
        })

        it('should handle email capture toggle change', () => {
            renderComponent()

            const toggle = screen.getByRole('switch', {
                name: /Enable email capture/i,
            })
            fireEvent.click(toggle)

            expect(mockUpdateValue).toHaveBeenCalledWith(
                'emailCaptureEnabled',
                true,
            )
        })

        it('should handle email capture enforcement change', () => {
            renderComponent()
            const option = screen.getByRole('radio', {
                name: /Required/i,
            })

            fireEvent.click(option)

            expect(mockUpdateValue).toHaveBeenCalledWith(
                'emailCaptureEnforcement',
                GorgiasChatEmailCaptureType.AlwaysRequired,
            )
        })

        it('should handle send wait time toggle change', () => {
            renderComponent()

            const toggle = screen.getByRole('switch', {
                name: /Provide auto-reply wait time in the chat/i,
            })
            fireEvent.click(toggle)

            expect(mockUpdateValue).toHaveBeenCalledWith(
                'autoResponderEnabled',
                true,
            )
        })

        it('should handle auto responder reply change', () => {
            renderComponent()
            const option = screen.getByRole('radio', {
                name: /In a few minutes/i,
            })
            fireEvent.click(option)

            expect(mockUpdateValue).toHaveBeenCalledWith(
                'autoResponderReply',
                GorgiasChatAutoResponderReply.ReplyInMinutes,
            )
        })

        test.each([true, false])(
            'should set isFormDirty to %s when there are changes coming from the form hook',
            (hasChanges) => {
                ;(
                    useHandoverCustomizationChatOnlineSettingsForm as jest.Mock
                ).mockReturnValue({
                    ...mockOnlineValuesForm,
                    hasChanges,
                })
                renderComponent()

                expect(mockSetIsFormDirty).toHaveBeenCalledWith(
                    StoreConfigFormSection.handoverCustomizationOnlineSettings,
                    hasChanges,
                )
            },
        )
    })

    describe('Save and Cancel Actions', () => {
        it('should disable save button when isSaving is true', () => {
            ;(
                useHandoverCustomizationChatOnlineSettingsForm as jest.Mock
            ).mockReturnValue({
                ...mockOnlineValuesForm,
                isLoading: false,
                isSaving: true,
            })

            renderComponent()

            const saveButton = screen.getByRole('button', {
                name: 'Save Changes',
            })

            expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should handle save button click', () => {
            renderComponent()

            const saveButton = screen.getByRole('button', {
                name: 'Save Changes',
            })
            fireEvent.click(saveButton)

            expect(mockHandleOnSave).toHaveBeenCalled()
        })

        it('should handle cancel button click', () => {
            renderComponent()

            const cancelButton = screen.getByRole('button', {
                name: 'Cancel',
            })
            fireEvent.click(cancelButton)

            expect(mockHandleOnCancel).toHaveBeenCalled()
        })
    })
})
