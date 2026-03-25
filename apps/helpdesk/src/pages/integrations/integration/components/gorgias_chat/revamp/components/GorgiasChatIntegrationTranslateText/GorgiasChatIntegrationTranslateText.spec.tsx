import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { GorgiasChatIntegrationTranslateTextRevamp } from './GorgiasChatIntegrationTranslateText'

const mockUseGorgiasTranslateText = jest.fn()
const mockSelectField = jest.fn()

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationTranslateText/hooks/useUpdateApplicationTexts',
    () => ({
        useUpdateApplicationTexts: () => ({
            mutateAsync: jest.fn(),
            isPending: false,
        }),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationTranslateText/hooks/useGorgiasTranslateText',
    () => ({
        useGorgiasTranslateText: (...args: any[]) =>
            mockUseGorgiasTranslateText(...args),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatRevampLayout',
    () => ({
        GorgiasChatRevampLayout: ({
            children,
        }: {
            children: React.ReactNode
        }) => <>{children}</>,
    }),
)

jest.mock('../GorgiasChatCreationWizard/components/SaveChangesPrompt', () => ({
    __esModule: true,
    default: () => null,
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
    () => ({
        useGorgiasChatCreationWizardContext: () => ({
            reloadPreview: jest.fn(),
        }),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationTranslateText/components/TranslateSection',
    () => ({
        TranslateSection: ({
            children,
            title,
        }: {
            children: React.ReactNode
            title: string
        }) => <div data-testid={`section-${title}`}>{children}</div>,
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationTranslateText/components/TranslateInputRow',
    () => ({
        TranslateInputRow: ({ keyName }: { keyName: string }) => (
            <div data-testid={`input-row-${keyName}`} />
        ),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationTranslateText/components/TranslateUnsavedChangesModal',
    () => ({
        TranslateUnsavedChangesModal: ({
            isOpen,
            description,
        }: {
            isOpen: boolean
            description: string
        }) => (isOpen ? <div>{description}</div> : null),
    }),
)

const mockButton = jest.fn()

jest.mock('@gorgias/axiom', () => ({
    SelectField: (props: any) => {
        mockSelectField(props)
        return <div data-testid="language-select-field" />
    },
    ListItem: ({ label }: { label: string }) => <li>{label}</li>,
    Banner: ({ description }: { description: React.ReactNode }) => (
        <div data-testid="advanced-customization-banner">{description}</div>
    ),
    Button: (props: any) => {
        mockButton(props)
        return <button onClick={props.onClick}>{props.children}</button>
    },
    ButtonVariant: {},
    ButtonIntent: {},
    ButtonSize: {},
    IconName: { ArrowLeft: 'arrow-left' },
    Icon: () => null,
    Skeleton: ({ height }: { height: string }) => (
        <div data-testid="skeleton" style={{ height }} />
    ),
}))

const defaultHookReturn = {
    language: fromJS({ value: 'en-US', label: 'English (US)' }),
    handleLanguageChange: jest.fn(),
    handleBackClick: jest.fn(),
    languagePickerLanguages: [{ value: 'en-US', label: 'English (US)' }],
    textsOfSelectedLanguage: {},
    translations: {},
    dependenciesLoaded: true,
    hasChanges: false,
    isSubmitting: false,
    submitData: jest.fn(),
    resetValues: jest.fn(),
    saveKeyValue: jest.fn(),
    backUrl: '/app/settings/channels/gorgias_chat/1/languages',
    isDefaultLanguageLoaded: true,
    isAutomateSubscriber: false,
    isExitModalOpen: false,
    isLanguageChangeModalOpen: false,
    onCloseModals: jest.fn(),
    onDiscardChangesAndExit: jest.fn(),
    onSaveValuesAndExit: jest.fn(),
    onDiscardChangesAndSwitchLanguage: jest.fn(),
    onSaveValuesAndSwitchLanguage: jest.fn(),
    emailCaptureEnforcement: undefined,
    integrationChat: {
        id: 1,
        name: 'My Chat',
        decoration: {
            launcher: { type: 'icon-only' },
        },
        meta: {
            preferences: {},
        },
    },
}

describe('GorgiasChatIntegrationTranslateTextRevamp', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseGorgiasTranslateText.mockReturnValue(defaultHookReturn)
    })

    it('should show skeletons and hide sections when dependencies are not loaded', () => {
        mockUseGorgiasTranslateText.mockReturnValue({
            ...defaultHookReturn,
            dependenciesLoaded: false,
        })

        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
        expect(screen.queryByTestId('section-General')).not.toBeInTheDocument()
    })

    it('should render the language selector when dependencies are loaded', () => {
        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(screen.getByTestId('language-select-field')).toBeInTheDocument()
    })

    it('should render the General section when dependencies are loaded', () => {
        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(screen.getByTestId('section-General')).toBeInTheDocument()
    })

    it('should render the Intro message section when dependencies are loaded', () => {
        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(screen.getByTestId('section-Intro message')).toBeInTheDocument()
    })

    it('should use "Offline Capture" as the contact form section title', () => {
        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(
            screen.getByTestId('section-Offline Capture'),
        ).toBeInTheDocument()
    })

    it('should not render the privacy policy disclaimer section when the flag is disabled', () => {
        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(
            screen.queryByTestId('section-Privacy policy disclaimer'),
        ).not.toBeInTheDocument()
    })

    it('should render the privacy policy disclaimer section when the flag is enabled', () => {
        mockUseGorgiasTranslateText.mockReturnValue({
            ...defaultHookReturn,
            integrationChat: {
                ...defaultHookReturn.integrationChat,
                meta: {
                    preferences: {
                        privacy_policy_disclaimer_enabled: true,
                    },
                },
            },
        })

        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(
            screen.getByTestId('section-Privacy policy disclaimer'),
        ).toBeInTheDocument()
    })

    it('should show the exit modal when isExitModalOpen is true', () => {
        mockUseGorgiasTranslateText.mockReturnValue({
            ...defaultHookReturn,
            isExitModalOpen: true,
        })

        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(
            screen.getByText(/save your changes before leaving/i),
        ).toBeInTheDocument()
    })

    it('should not show the exit modal when isExitModalOpen is false', () => {
        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(
            screen.queryByText(/save your changes before leaving/i),
        ).not.toBeInTheDocument()
    })

    it('should show the language change modal when isLanguageChangeModalOpen is true', () => {
        mockUseGorgiasTranslateText.mockReturnValue({
            ...defaultHookReturn,
            isLanguageChangeModalOpen: true,
        })

        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(
            screen.getByText(/save your changes before switching language/i),
        ).toBeInTheDocument()
    })

    it('should pass integration to useGorgiasTranslateText', () => {
        const integration = fromJS({ id: 42 })
        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={integration}
            />,
        )

        expect(mockUseGorgiasTranslateText).toHaveBeenCalledWith({
            integration,
        })
    })

    it('should pass language options to SelectField', () => {
        const languagePickerLanguages = [
            { value: 'en-US', label: 'English (US)' },
            { value: 'fr', label: 'French' },
        ]
        mockUseGorgiasTranslateText.mockReturnValue({
            ...defaultHookReturn,
            languagePickerLanguages,
        })

        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(mockSelectField).toHaveBeenCalledWith(
            expect.objectContaining({
                items: expect.arrayContaining([
                    expect.objectContaining({ value: 'en-US' }),
                    expect.objectContaining({ value: 'fr' }),
                ]),
            }),
        )
    })

    it('should render dynamic wait time section when isAutomateSubscriber is true', () => {
        mockUseGorgiasTranslateText.mockReturnValue({
            ...defaultHookReturn,
            isAutomateSubscriber: true,
        })

        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(
            screen.getByTestId('section-Dynamic wait time'),
        ).toBeInTheDocument()
    })

    it('should render the email capture section when emailCaptureEnforcement is always-required', () => {
        mockUseGorgiasTranslateText.mockReturnValue({
            ...defaultHookReturn,
            emailCaptureEnforcement: 'always-required',
        })

        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(screen.getByTestId('section-Email capture')).toBeInTheDocument()
    })

    it('should pass required keys when launcher type is ICON_AND_LABEL and default language is loaded', () => {
        mockUseGorgiasTranslateText.mockReturnValue({
            ...defaultHookReturn,
            isDefaultLanguageLoaded: true,
            integrationChat: {
                ...defaultHookReturn.integrationChat,
                decoration: {
                    launcher: { type: 'icon-label' },
                },
            },
        })

        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(screen.getByTestId('section-General')).toBeInTheDocument()
    })

    it('should pass privacy policy required keys when disclaimer is enabled and default language is loaded', () => {
        mockUseGorgiasTranslateText.mockReturnValue({
            ...defaultHookReturn,
            isDefaultLanguageLoaded: true,
            integrationChat: {
                ...defaultHookReturn.integrationChat,
                meta: {
                    preferences: {
                        privacy_policy_disclaimer_enabled: true,
                    },
                },
            },
        })

        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(
            screen.getByTestId('section-Privacy policy disclaimer'),
        ).toBeInTheDocument()
    })

    it('should render the back button', () => {
        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(
            screen.getByRole('button', { name: /back/i }),
        ).toBeInTheDocument()
    })

    it('should call handleBackClick when the back button is clicked', async () => {
        const user = userEvent.setup()
        const handleBackClick = jest.fn()
        mockUseGorgiasTranslateText.mockReturnValue({
            ...defaultHookReturn,
            handleBackClick,
        })

        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        await user.click(screen.getByRole('button', { name: /back/i }))

        expect(handleBackClick).toHaveBeenCalledTimes(1)
    })

    it('should render the advanced customization banner', () => {
        render(
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={fromJS({ id: 1 })}
            />,
        )

        expect(
            screen.getByTestId('advanced-customization-banner'),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /advanced customization/i }),
        ).toBeInTheDocument()
    })
})
