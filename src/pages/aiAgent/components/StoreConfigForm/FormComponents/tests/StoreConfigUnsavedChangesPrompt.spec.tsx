import { render, screen } from '@testing-library/react'

import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'
import AiAgentFormChangesProvider from 'pages/aiAgent/providers/AiAgentFormChangesProvider'

import { StoreConfigUnsavedChangesPrompt } from '../StoreConfigUnsavedChangesPrompt'

jest.mock('pages/common/components/UnsavedChangesPrompt', () => ({
    __esModule: true,
    ...jest.requireActual('pages/common/components/UnsavedChangesPrompt'),
    default: ({
        when,
        shouldShowSaveButton,
        body,
        title,
    }: {
        when: boolean
        shouldShowSaveButton: boolean
        body: string
        title: string
    }) => (
        <div>
            {shouldShowSaveButton && <button>Save rendered</button>}
            {when && <button>when enabled</button>}
            {body && <div>{body}</div>}
            {!body && <div>default body</div>}
            {title && <div>{title}</div>}
            {!title && <div>default title</div>}
        </div>
    ),
}))

jest.mock('pages/aiAgent/providers/AiAgentFormChangesContext')

const renderComponentWithContext = () => {
    return render(
        <AiAgentFormChangesProvider>
            <StoreConfigUnsavedChangesPrompt />
        </AiAgentFormChangesProvider>,
    )
}

const mockSetIsFormDirty = jest.fn()
const mockSetActionCallback = jest.fn()
const mockOnModalSave = jest.fn()
const mockOnModalDiscard = jest.fn()

const mockedHookContext = {
    isFormDirty: false,
    setIsFormDirty: mockSetIsFormDirty,
    setActionCallback: mockSetActionCallback,
    dirtySections: [],
    onModalSave: mockOnModalSave,
    onModalDiscard: mockOnModalDiscard,
}
describe('StoreConfigUnsavedChangesPrompt', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useAiAgentFormChangesContext as jest.Mock).mockReturnValue(
            mockedHookContext,
        )
    })

    it('should render the the unsaved prompt component when the form is dirty', () => {
        ;(useAiAgentFormChangesContext as jest.Mock).mockReturnValue({
            ...mockedHookContext,
            isFormDirty: true,
        })
        renderComponentWithContext()

        screen.getByText('when enabled')
    })

    it('should not render the the unsaved prompt component when the form is not dirty', () => {
        ;(useAiAgentFormChangesContext as jest.Mock).mockReturnValue({
            ...mockedHookContext,
            isFormDirty: false,
        })
        renderComponentWithContext()

        expect(screen.queryByText('when enabled')).toBeNull()
    })

    test.each([
        StoreConfigFormSection.generalSettings,
        StoreConfigFormSection.channelSettings,
    ])(
        'should show default message, title and save button when only one main section is changed',
        (section) => {
            ;(useAiAgentFormChangesContext as jest.Mock).mockReturnValue({
                ...mockedHookContext,
                isFormDirty: true,
                dirtySections: [section],
            })
            renderComponentWithContext()

            // Should use default message
            screen.getByText('when enabled')
            screen.getByText('default body')
            screen.getByText('default title')
            screen.getByRole('button', { name: /save/i })
        },
    )

    test.each([
        [
            StoreConfigFormSection.handoverCustomizationFallbackSettings,
            'Chat error handover',
        ],
        [
            StoreConfigFormSection.handoverCustomizationOfflineSettings,
            'Chat offline handover',
        ],
        [
            StoreConfigFormSection.handoverCustomizationOnlineSettings,
            'Chat online handover',
        ],
    ])(
        'should show custom message when only one subsection is changed',
        (section, sectionText) => {
            ;(useAiAgentFormChangesContext as jest.Mock).mockReturnValue({
                ...mockedHookContext,
                isFormDirty: true,
                dirtySections: [section],
            })
            renderComponentWithContext()

            // Should use custom message
            screen.getByText(
                `Your updates in ${sectionText} will be lost unless saved individually.`,
            )
            screen.getByText('Unsaved changes')
            expect(screen.queryByRole('button', { name: /save/i })).toBeNull()
        },
    )

    it('should show custom message for multiple section changes', () => {
        ;(useAiAgentFormChangesContext as jest.Mock).mockReturnValue({
            ...mockedHookContext,
            isFormDirty: true,
            dirtySections: [
                StoreConfigFormSection.generalSettings,
                StoreConfigFormSection.channelSettings,
                StoreConfigFormSection.handoverCustomizationOnlineSettings,
            ],
        })
        renderComponentWithContext()

        const sectionTexts = `General settings, Channel settings and Chat online handover`

        screen.getByText('Unsaved changes')
        screen.getByText(
            `Your updates in ${sectionTexts} will be lost unless saved individually.`,
        )
        expect(screen.queryByRole('button', { name: /save/i })).toBeNull()
    })

    test.each([
        [StoreConfigFormSection.generalSettings, 'General settings'],
        [StoreConfigFormSection.channelSettings, 'Channel settings'],
    ])(
        'should always render the main content section text first when there are multiple changes',
        (section, sectionText) => {
            ;(useAiAgentFormChangesContext as jest.Mock).mockReturnValue({
                ...mockedHookContext,
                isFormDirty: true,
                dirtySections: [
                    StoreConfigFormSection.handoverCustomizationOnlineSettings,
                    section,
                ],
            })
            renderComponentWithContext()

            const sectionTexts = `${sectionText} and Chat online handover`

            screen.getByText('Unsaved changes')
            screen.getByText(
                `Your updates in ${sectionTexts} will be lost unless saved individually.`,
            )
            expect(screen.queryByRole('button', { name: /save/i })).toBeNull()
        },
    )
})
