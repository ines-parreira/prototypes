import { fireEvent, render, screen } from '@testing-library/react'

import {
    getGorgiasChatLanguageByCode,
    getLanguagesFromChatConfig,
    getPrimaryLanguageFromChatConfig,
} from 'config/integrations/gorgias_chat'
import { Language } from 'constants/languages'
import type { GorgiasChatIntegration } from 'models/integration/types'
import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useHandoverCustomizationChatFallbackSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatFallbackSettingsForm'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'

import HandoverCustomizationChatFallbackSettings from '../HandoverCustomizationChatFallbackSettings'

// Mock dependencies
jest.mock(
    'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatFallbackSettingsForm',
)
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
) =>
    render(
        <HandoverCustomizationChatFallbackSettings integration={integration} />,
    )

describe('HandoverCustomizationChatFallbackSettings', () => {
    const mockUpdateValue = jest.fn()
    const mockHandleOnSave = jest.fn()
    const mockHandleOnCancel = jest.fn()

    const mockSetIsFormDirty = jest.fn()
    const mockSetActionCallback = jest.fn()

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
            useHandoverCustomizationChatFallbackSettingsForm as jest.Mock
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
            setActionCallback: mockSetActionCallback,
        })
    })

    it('renders correctly with all UI elements', () => {
        renderComponent()

        // Check the textarea is rendered
        expect(
            screen.getByRole('textbox', { name: 'Error message' }),
        ).toBeInTheDocument()

        // Check that the banner is not rendered
        expect(
            screen.queryByText(
                /Enter a message, not Guidance. It will be sent as-is to customers during error./i,
            ),
        ).toBeNull()

        // Check the caption is rendered
        expect(
            screen.getByText(
                /AI Agent will only send this error message when it cannot request handover confirmation due to a temporary issue./i,
            ),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(
                /If an error occurs, AI Agent will send this exact message to the customer/i,
            ),
        ).toBeNull()

        // Check Save and Cancel buttons are rendered
        expect(screen.getByText('Save Changes')).toBeInTheDocument
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('renders the language selector when there are multiple languages', () => {
        renderComponent()

        // Check the language selector is rendered
        screen.getByLabelText('Select language')
    })

    it('does not render the language selector when there is only one language', () => {
        ;(getLanguagesFromChatConfig as jest.Mock).mockReturnValue(['en-US'])
        renderComponent()

        // Check the language selector is not rendered
        expect(screen.queryByLabelText('Select language')).toBeNull()
    })

    it('does not render the language selector when there is only one language', () => {
        ;(getLanguagesFromChatConfig as jest.Mock).mockReturnValue(['en-US'])

        renderComponent()

        // Check the language selector is not rendered
        expect(screen.queryByLabelText('Select language')).toBeNull()
    })

    it('renders the loading state when the language context is loading', () => {
        ;(
            useHandoverCustomizationChatFallbackSettingsForm as jest.Mock
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

    it('should build the correct action callback when the component is mounted', () => {
        renderComponent()

        expect(mockSetActionCallback).toHaveBeenCalledWith(
            StoreConfigFormSection.handoverCustomizationFallbackSettings,
            expect.objectContaining({
                onDiscard: mockHandleOnCancel,
            }),
        )
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
            useHandoverCustomizationChatFallbackSettingsForm as jest.Mock
        ).mockReturnValue({
            isLoading: false,
            formValues: newMockFormValues,
            updateValue: mockUpdateValue,
            handleOnSave: mockHandleOnSave,
            handleOnCancel: mockHandleOnCancel,
            hasChanges: false,
        })

        rerender(
            <HandoverCustomizationChatFallbackSettings
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
        ).toHaveValue('Spanish error message')
    })
    it('renders correctly with initial language selected', () => {
        renderComponent()

        // Check if English is selected initially
        screen.getByText('English')

        // Check if textarea is rendered with correct value
        expect(
            screen.getByRole('textbox', { name: 'Error message' }),
        ).toHaveValue('English error message')
    })

    it('changes language and displays corresponding error message when language is selected', async () => {
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
        ).toHaveValue('French error message')
    })

    describe('handover customization fallback error text', () => {
        it('renders the fallback initial error text from the context', () => {
            mockFormValues['en-US'].fallbackMessage = 'English error message'

            renderComponent()

            // Check if textarea is rendered with correct value
            expect(
                screen.getByRole('textbox', { name: 'Error message' }),
            ).toHaveValue('English error message')
        })

        it('renders the placeholder text when the textarea is empty', () => {
            mockFormValues['en-US'].fallbackMessage = ''

            renderComponent()

            // Check if textarea is rendered with correct value
            expect(
                screen.getByRole('textbox', { name: 'Error message' }),
            ).toHaveValue('')
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
                useHandoverCustomizationChatFallbackSettingsForm as jest.Mock
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

    it.each([true, false])(
        'should set isFormDirty to %s when there are changes coming from the form hook',
        (hasChanges) => {
            ;(
                useHandoverCustomizationChatFallbackSettingsForm as jest.Mock
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
