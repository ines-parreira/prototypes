import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import {
    getGorgiasChatLanguageByCode,
    getLanguagesFromChatConfig,
    getPrimaryLanguageFromChatConfig,
} from 'config/integrations/gorgias_chat'
import { Language } from 'constants/languages'
import { GorgiasChatIntegration } from 'models/integration/types'
import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'

import { useHandoverCustomizationFallbackSettingsForm } from '../../../../hooks/useHandoverCustomizationFallbackSettingsForm'
import HandoverCustomizationFallbackSettings from '../HandoverCustomizationFallbackSettings'

// Mock dependencies
jest.mock('pages/aiAgent/hooks/useHandoverCustomizationFallbackSettingsForm')
jest.mock('pages/aiAgent/providers/AiAgentFormChangesContext')
jest.mock('config/integrations/gorgias_chat')
jest.mock('constants/languages')

// Mock data
const mockedIntegration = {
    meta: {
        app_id: 'test-app-id',
        languages: [
            { language: Language.EnglishUs },
            { language: Language.FrenchFr },
        ],
    },
} as unknown as GorgiasChatIntegration

const mockFormValues = {
    'en-US': { fallbackMessage: 'English error message' },
    'fr-FR': { fallbackMessage: 'French error message' },
}

const mockLanguages = [
    { value: 'en-US', label: 'English' },
    { value: 'fr-FR', label: 'French' },
    { value: 'es-ES', label: 'Spanish' },
]

const renderComponent = (
    integration: GorgiasChatIntegration = mockedIntegration,
) => render(<HandoverCustomizationFallbackSettings integration={integration} />)

describe('HandoverCustomizationFallbackSettings', () => {
    const mockUpdateValue = jest.fn()
    const mockHandleOnSave = jest.fn()
    const mockHandleOnCancel = jest.fn()

    const mockSetIsFormDirty = jest.fn()

    const mockHookValues = {
        isLoading: false,
        isSaving: false,
        formValues: mockFormValues,
        updateValue: mockUpdateValue,
        handleOnSave: mockHandleOnSave,
        handleOnCancel: mockHandleOnCancel,
        hasChanges: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()

        // Mock form hook
        ;(
            useHandoverCustomizationFallbackSettingsForm as jest.Mock
        ).mockReturnValue(mockHookValues)

        // Mock language functions
        ;(getPrimaryLanguageFromChatConfig as jest.Mock).mockReturnValue(
            'en-US',
        )
        ;(getLanguagesFromChatConfig as jest.Mock).mockReturnValue([
            'en-US',
            'fr-FR',
        ])
        ;(getGorgiasChatLanguageByCode as jest.Mock).mockImplementation(
            (code) => {
                return mockLanguages.find((lang) => lang.value === code)
            },
        )
        ;(useAiAgentFormChangesContext as jest.Mock).mockReturnValue({
            setIsFormDirty: mockSetIsFormDirty,
        })
    })

    it('renders correctly with all UI elements', () => {
        renderComponent()

        // Check the textarea is rendered
        screen.getByRole('textbox', { name: 'Error message' })

        // Check the caption is rendered
        screen.getByText(
            /AI Agent will send the exact text if it encounters an unexpected error handing over/i,
        )

        // Check the language selector is rendered
        screen.getByLabelText('Select language')

        // Check Save and Cancel buttons are rendered
        screen.getByText('Save Changes')
        screen.getByText('Cancel')
    })

    it('renders the loading state when the language context is loading', () => {
        ;(
            useHandoverCustomizationFallbackSettingsForm as jest.Mock
        ).mockReturnValue({
            isLoading: true,
            formValues: mockFormValues,
            updateValue: mockUpdateValue,
            handleOnSave: mockHandleOnSave,
            handleOnCancel: mockHandleOnCancel,
            hasChanges: false,
        })

        renderComponent()

        // Check the loading spinner is rendered
        screen.getByText(/loading/i)
    })

    it('should update the language options when the integration is updated', () => {
        const { rerender } = renderComponent()

        // New integration with different languages
        const newIntegration = {
            meta: {
                app_id: 'new-app-id',
                languages: [
                    { language: Language.EnglishUs },
                    { language: Language.Spanish },
                ],
            },
        } as unknown as GorgiasChatIntegration

        const newMockFormValues = {
            'en-US': { fallbackMessage: 'English error message' },
            'es-ES': { fallbackMessage: 'Spanish error message' },
        }

        // Update mocks for new integration
        ;(getPrimaryLanguageFromChatConfig as jest.Mock).mockReturnValue(
            'es-ES',
        )
        ;(getLanguagesFromChatConfig as jest.Mock).mockReturnValue([
            'en-US',
            'es-ES',
        ])
        ;(
            useHandoverCustomizationFallbackSettingsForm as jest.Mock
        ).mockReturnValue({
            isLoading: false,
            formValues: newMockFormValues,
            updateValue: mockUpdateValue,
            handleOnSave: mockHandleOnSave,
            handleOnCancel: mockHandleOnCancel,
            hasChanges: false,
        })

        rerender(
            <HandoverCustomizationFallbackSettings
                integration={newIntegration}
            />,
        )

        // Spanish should be available now
        expect(getLanguagesFromChatConfig).toHaveBeenCalledWith(
            newIntegration.meta,
        )

        // Check if Spanish is selected initially
        screen.getByText('Spanish')

        // Check if textarea is rendered with correct value
        expect(
            screen.getByRole('textbox', { name: 'Error message' }),
        ).toHaveTextContent('Spanish error message')
    })
    it('renders correctly with initial language selected', () => {
        renderComponent()

        // Check if English is selected initially
        screen.getByText('English')

        // Check if textarea is rendered with correct value
        expect(
            screen.getByRole('textbox', { name: 'Error message' }),
        ).toHaveTextContent('English error message')
    })

    it('changes language and displays corresponding error message', async () => {
        renderComponent()

        // Open the language dropdown
        const languageSelect = screen.getByLabelText('Select language')
        fireEvent.click(languageSelect)

        // Select French
        const frenchOption = await screen.findByText('French')
        fireEvent.click(frenchOption)

        // Should display French error message
        expect(
            screen.getByRole('textbox', { name: 'Error message' }),
        ).toHaveTextContent('French error message')
    })

    describe('handover customization fallback error text', () => {
        it('renders the fallback initial error text from the context', () => {
            renderComponent()

            // Check if textarea is rendered with correct value
            expect(
                screen.getByRole('textbox', { name: 'Error message' }),
            ).toHaveTextContent('English error message')
        })

        it('renders the placeholder text when the textarea is empty', () => {
            mockFormValues['en-US'].fallbackMessage = ''

            renderComponent()

            // Check if textarea is rendered with correct value
            expect(
                screen.getByRole('textbox', { name: 'Error message' }),
            ).toHaveTextContent('')
        })

        it('should trigger the updateValue function when the textarea is changed', () => {
            renderComponent()

            // Change the textarea value
            fireEvent.change(
                screen.getByRole('textbox', { name: 'Error message' }),
                { target: { value: 'New error message' } },
            )

            // Check if the updateValue function is called
            expect(mockUpdateValue).toHaveBeenCalledWith(
                'fallbackMessage',
                'en-US',
                'New error message',
            )
        })
    })

    describe('form handlers', () => {
        it('calls handleOnCancel when Cancel button is clicked', () => {
            renderComponent()

            const cancelButton = screen.getByText('Cancel')
            fireEvent.click(cancelButton)

            expect(mockHandleOnCancel).toHaveBeenCalled()
        })

        it('calls handleOnSave when Save Changes button is clicked', () => {
            renderComponent()

            const saveButton = screen.getByText('Save Changes')
            fireEvent.click(saveButton)

            expect(mockHandleOnSave).toHaveBeenCalled()
        })

        it('should disable the save button when the form is saving', () => {
            ;(
                useHandoverCustomizationFallbackSettingsForm as jest.Mock
            ).mockReturnValue({
                isSaving: true,
                formValues: mockFormValues,
                updateValue: mockUpdateValue,
                handleOnSave: mockHandleOnSave,
                handleOnCancel: mockHandleOnCancel,
                hasChanges: true,
            })

            renderComponent()

            const saveButton = screen.getByRole('button', {
                name: 'Save Changes',
            })

            expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        })
    })
    test.each([true, false])(
        'should set isFormDirty to %s when there are changes coming from the form hook',
        (hasChanges) => {
            ;(
                useHandoverCustomizationFallbackSettingsForm as jest.Mock
            ).mockReturnValue({
                ...mockHookValues,
                hasChanges,
            })
            renderComponent()

            expect(mockSetIsFormDirty).toHaveBeenCalledWith(
                StoreConfigFormSection.handoverCustomizationFallbackSettings,
                hasChanges,
            )
        },
    )
})
