import type { ReactNode } from 'react'

import { render } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import type {
    GorgiasChatAvatarSettings,
    GorgiasChatPosition,
} from 'models/integration/types'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatBackgroundColorStyle,
    GorgiasChatPositionAlignmentEnum,
    IntegrationType,
} from 'models/integration/types'
import { GorgiasChatIntegrationAppearanceRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/GorgiasChatIntegrationAppearance'
import type { Texts } from 'rest_api/gorgias_chat_protected_api/types'
import {
    getApplicationTexts,
    updateApplicationTexts,
    updateOrCreateIntegration,
} from 'state/integrations/actions'

jest.mock('hooks/useAppDispatch')

jest.mock('state/integrations/actions', () => ({
    ...jest.requireActual('state/integrations/actions'),
    getApplicationTexts: jest.fn(),
    updateApplicationTexts: jest.fn(),
    updateOrCreateIntegration: jest.fn(() => () => Promise.resolve()),
}))

const mockUseIsAiAgentEnabled = jest.fn()
const mockUseShouldShowChatSettingsRevamp = jest.fn()

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useIsAiAgentEnabled',
    () => ({
        useIsAiAgentEnabled: () => mockUseIsAiAgentEnabled(),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp',
    () => ({
        useShouldShowChatSettingsRevamp: () =>
            mockUseShouldShowChatSettingsRevamp(),
    }),
)

jest.mock('pages/integrations/integration/hooks/useStoreIntegration', () => ({
    useStoreIntegration: () => ({
        storeIntegration: undefined,
        isConnected: false,
        isConnectedToShopify: false,
    }),
}))

const mockDispatch = jest.fn().mockResolvedValue({})
const mockUseAppDispatch = jest.mocked(useAppDispatch)
const mockGetApplicationTexts = jest.mocked(getApplicationTexts)
const mockUpdateApplicationTexts = jest.mocked(updateApplicationTexts)
const mockUpdateOrCreateIntegration = jest.mocked(updateOrCreateIntegration)

type BrandCardProps = {
    name: string
    mainColor: string
    conversationColor: string
    useMainColorOutsideBusinessHours: boolean
    backgroundStyle: GorgiasChatBackgroundColorStyle
    headerPictureUrl?: string
    headerAlternativePictureUrl?: string
    introductionText: string
    offlineIntroductionText: string
    isAiAgentEnabled?: boolean
    isAiAgentDisabled?: boolean
    mainFontFamily: string
    onNameChange: (value: string) => void
    onMainColorChange: (value: string) => void
    onConversationColorChange: (value: string) => void
    onUseMainColorOutsideBusinessHoursChange: (value: boolean) => void
    onBackgroundStyleChange: (value: GorgiasChatBackgroundColorStyle) => void
    onHeaderLogoUrlChange: (url?: string) => void
    onHeaderAlternativePictureUrlChange: (url?: string) => void
    onIntroductionTextChange: (value: string) => void
    onOfflineIntroductionTextChange: (value: string) => void
    onMainFontFamilyChange: (value: string) => void
}

type ChatLauncherCardProps = {
    launcher: { type: string; label: string }
    mainColor: string
    position: GorgiasChatPosition
    largeChatEnabled: boolean
    onLauncherChange: (launcher: { type: string; label: string }) => void
    onPositionChange: (position: GorgiasChatPosition) => void
    onLargeChatEnabledChange: (value: boolean) => void
}

type LegalCardProps = {
    legalDisclaimerText: string | undefined
    legalDisclaimerEnabled: boolean
    onLegalDisclaimerTextChange: (value: string) => void
    onLegalDisclaimerEnabledChange: (value: boolean) => void
}

type AvatarCardProps = {
    name: string
    avatar: GorgiasChatAvatarSettings
    onAvatarChange: (avatar: GorgiasChatAvatarSettings) => void
}

type ChatbotCardProps = {
    displayBotLabel: boolean
    onDisplayBotLabelChange: (value: boolean) => void
}

const mockBrandCard = jest.fn<void, [BrandCardProps]>()
const mockChatLauncherCard = jest.fn<void, [ChatLauncherCardProps]>()
const mockLegalCard = jest.fn<void, [LegalCardProps]>()
const mockAvatarCard = jest.fn<void, [AvatarCardProps]>()
const mockChatbotCard = jest.fn<void, [ChatbotCardProps]>()

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/GorgiasChatRevampLayout',
    () => ({
        GorgiasChatRevampLayout: ({
            children,
            onSave,
            isSaving,
            isSaveDisabled,
        }: {
            children: ReactNode
            onSave: () => void
            isSaving: boolean
            isSaveDisabled: boolean
        }) => (
            <div>
                <button
                    onClick={onSave}
                    data-saving={isSaving}
                    disabled={isSaveDisabled}
                >
                    Save
                </button>
                {children}
            </div>
        ),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/CreationWizard/components/SaveChangesPrompt',
    () => ({
        __esModule: true,
        default: () => null,
    }),
)

const mockOnChatPreviewLoaded = jest.fn()
const mockUpdateLegalDisclaimerEnabled = jest.fn()
const mockUpdateConversationColor = jest.fn()
const mockUpdateChatTitle = jest.fn()
const mockUpdateMainFontFamily = jest.fn()
const mockUpdateBackgroundStyle = jest.fn()
const mockUpdateIntroductionText = jest.fn()
const mockUpdateOfflineIntroductionText = jest.fn()

let mockIsPreviewingNewChat = false

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
    () => ({
        useChatPreviewPanelContext: () => ({
            reloadPreview: jest.fn(),
            onChatPreviewLoaded: (
                callback: () => void,
                fireIfAlreadyLoaded?: boolean,
            ) => mockOnChatPreviewLoaded(callback, fireIfAlreadyLoaded),
            updateLegalDisclaimerEnabled: (enabled: boolean) =>
                mockUpdateLegalDisclaimerEnabled(enabled),
            updateConversationColor: (color: string) =>
                mockUpdateConversationColor(color),
            updateChatTitle: (title: string) => mockUpdateChatTitle(title),
            updateMainFontFamily: (font: string) =>
                mockUpdateMainFontFamily(font),
            updateBackgroundStyle: (style: string) =>
                mockUpdateBackgroundStyle(style),
            updateIntroductionText: (text: string) =>
                mockUpdateIntroductionText(text),
            updateOfflineIntroductionText: (text: string) =>
                mockUpdateOfflineIntroductionText(text),
            isPreviewingNewChat: mockIsPreviewingNewChat,
            setIsPreviewingNewChat: jest.fn(),
        }),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/components/BrandCard/BrandCard',
    () => ({
        BrandCard: (props: BrandCardProps) => {
            mockBrandCard(props)
            return null
        },
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/components/LegalCard/LegalCard',
    () => ({
        LegalCard: (props: LegalCardProps) => {
            mockLegalCard(props)
            return null
        },
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/components/AvatarCard/AvatarCard',
    () => ({
        AvatarCard: (props: AvatarCardProps) => {
            mockAvatarCard(props)
            return null
        },
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/components/ChatbotCard/ChatbotCard',
    () => ({
        ChatbotCard: (props: ChatbotCardProps) => {
            mockChatbotCard(props)
            return null
        },
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/components/ChatLauncherCard/ChatLauncherCard',
    () => ({
        ChatLauncherCard: (props: ChatLauncherCardProps) => {
            mockChatLauncherCard(props)
            return null
        },
    }),
)

const mockApplicationTextsResponse = {
    'en-US': {
        texts: {
            privacyPolicyDisclaimer: 'Privacy policy text from API',
        },
        sspTexts: {},
        meta: {},
    },
} as unknown as Texts

describe('GorgiasChatIntegrationAppearanceRevamp', () => {
    const mockIntegration = fromJS({
        id: 1,
        name: 'Test Chat',
        type: IntegrationType.GorgiasChat,
        meta: {
            app_id: 'test-app-id',
            preferences: {
                privacy_policy_disclaimer_enabled: true,
            },
        },
        decoration: {
            main_color: '#FF0000',
            header_picture_url: 'https://example.com/logo.png',
            header_alternative_picture_url:
                'https://example.com/alternative-logo.png',
            introduction_text: 'How can we help?',
            offline_introduction_text: "We'll be back soon",
            position: {
                alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT,
                offsetX: 10,
                offsetY: 20,
            },
            avatar: {
                image_type: GorgiasChatAvatarImageType.AGENT_INITIALS,
                name_type: GorgiasChatAvatarNameType.AGENT_FULLNAME,
                company_logo_url: 'https://example.com/company.png',
            },
            ai_disclaimer_text: 'AI disclaimer text',
        },
    })

    const mockLoading = fromJS({})

    const renderComponent = (
        integration = mockIntegration,
        loading = mockLoading,
    ) => {
        return render(
            <GorgiasChatIntegrationAppearanceRevamp
                integration={integration}
                loading={loading}
            />,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockDispatch.mockClear()
        mockUseIsAiAgentEnabled.mockReturnValue({
            isAiAgentEnabled: false,
            isLoading: false,
        })
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            shouldShowLegacyChatCustomization: true,
        })
        mockIsPreviewingNewChat = false
        mockGetApplicationTexts.mockResolvedValue(mockApplicationTextsResponse)
        mockUpdateApplicationTexts.mockResolvedValue(undefined)
        mockUpdateConversationColor.mockReset()
        mockUpdateMainFontFamily.mockReset()
        mockUpdateBackgroundStyle.mockReset()
        mockUpdateIntroductionText.mockReset()
        mockUpdateOfflineIntroductionText.mockReset()
        mockOnChatPreviewLoaded.mockImplementation(
            (callback: () => void, fireIfAlreadyLoaded?: boolean) => {
                if (fireIfAlreadyLoaded) {
                    callback()
                }
                return jest.fn()
            },
        )
        global.CSS = {
            supports: jest.fn().mockReturnValue(true),
        } as unknown as typeof CSS
    })

    describe('BrandCard advanced colors visibility', () => {
        it('should not show advanced colors when AI agent is enabled', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: true,
                isLoading: false,
            })

            renderComponent()

            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({ isAiAgentDisabled: false }),
            )
        })

        it('should show advanced colors when AI agent is disabled', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })

            renderComponent()

            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({ isAiAgentDisabled: true }),
            )
        })

        it('should not show advanced colors while AI agent config is loading', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: true,
            })

            renderComponent()

            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({ isAiAgentDisabled: false }),
            )
        })

        it('should hide the legacy color, background and font controls when the customer has opted in to Chat 2.0', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })
            mockUseShouldShowChatSettingsRevamp.mockReturnValue({
                shouldShowLegacyChatCustomization: false,
            })

            renderComponent()

            // The raw AI-agent flags are unchanged for the other fields...
            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    isAiAgentDisabled: true,
                    isAiAgentEnabled: false,
                    // ...but the legacy color/background/font block is hidden.
                    shouldShowLegacyChatCustomization: false,
                }),
            )
        })

        it('should hide the legacy controls while previewing Chat 2.0 from the banner, even before opting in', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })
            mockUseShouldShowChatSettingsRevamp.mockReturnValue({
                shouldShowLegacyChatCustomization: true,
            })
            mockIsPreviewingNewChat = true

            renderComponent()

            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    shouldShowLegacyChatCustomization: false,
                }),
            )
        })

        it('should show the legacy controls when not previewing Chat 2.0', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })
            mockUseShouldShowChatSettingsRevamp.mockReturnValue({
                shouldShowLegacyChatCustomization: true,
            })
            mockIsPreviewingNewChat = false

            renderComponent()

            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    shouldShowLegacyChatCustomization: true,
                }),
            )
        })

        it('should default conversationColor to mainColor when missing on integration', () => {
            renderComponent()

            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    mainColor: '#FF0000',
                    conversationColor: '#FF0000',
                }),
            )
        })

        it('should read conversationColor and useMainColorOutsideBusinessHours from integration', () => {
            const integration = fromJS({
                ...mockIntegration.toJS(),
                decoration: {
                    ...mockIntegration.get('decoration').toJS(),
                    conversation_color: '#123456',
                    use_main_color_outside_business_hours: true,
                },
            })

            renderComponent(integration)

            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    conversationColor: '#123456',
                    useMainColorOutsideBusinessHours: true,
                }),
            )
        })

        it('should sync conversationColor to the chat preview when it loads', () => {
            const integration = fromJS({
                ...mockIntegration.toJS(),
                decoration: {
                    ...mockIntegration.get('decoration').toJS(),
                    conversation_color: '#123456',
                },
            })

            renderComponent(integration)

            expect(mockUpdateConversationColor).toHaveBeenCalledWith('#123456')
        })

        it('should sync the default conversationColor (mainColor) to the chat preview when conversation_color is missing', () => {
            renderComponent()

            expect(mockUpdateConversationColor).toHaveBeenCalledWith('#FF0000')
        })

        it('should re-sync conversationColor to the chat preview when the color changes', () => {
            renderComponent()

            act(() => {
                const { onConversationColorChange } = mockBrandCard.mock.calls[
                    mockBrandCard.mock.calls.length - 1
                ][0] as BrandCardProps
                onConversationColorChange('#ABCDEF')
            })

            expect(mockUpdateConversationColor).toHaveBeenLastCalledWith(
                '#ABCDEF',
            )
        })

        it('should save conversation_color and use_main_color_outside_business_hours independently', async () => {
            const user = userEvent.setup()
            const { getByRole } = renderComponent()

            act(() => {
                const {
                    onConversationColorChange,
                    onUseMainColorOutsideBusinessHoursChange,
                } = mockBrandCard.mock.calls[0][0] as BrandCardProps
                onConversationColorChange('#ABCDEF')
                onUseMainColorOutsideBusinessHoursChange(true)
            })

            await user.click(getByRole('button', { name: 'Save' }))

            const calledWith =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(calledWith.decoration).toMatchObject({
                main_color: '#FF0000',
                conversation_color: '#ABCDEF',
                use_main_color_outside_business_hours: true,
            })
        })

        it('should pass the integration name to BrandCard', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })

            renderComponent()

            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Test Chat' }),
            )
        })

        it('should save the updated chat title', async () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })
            const user = userEvent.setup()
            const { getByRole } = renderComponent()

            act(() => {
                const { onNameChange } = mockBrandCard.mock
                    .calls[0][0] as BrandCardProps
                onNameChange('New chat title')
            })

            await user.click(getByRole('button', { name: 'Save' }))

            const calledWith =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(calledWith.name).toBe('New chat title')
        })

        it('should default backgroundStyle to Gradient when missing on integration', () => {
            renderComponent()

            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    backgroundStyle: GorgiasChatBackgroundColorStyle.Gradient,
                }),
            )
        })

        it('should read backgroundStyle from integration', () => {
            const integration = fromJS({
                ...mockIntegration.toJS(),
                decoration: {
                    ...mockIntegration.get('decoration').toJS(),
                    background_color_style:
                        GorgiasChatBackgroundColorStyle.Solid,
                },
            })

            renderComponent(integration)

            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    backgroundStyle: GorgiasChatBackgroundColorStyle.Solid,
                }),
            )
        })

        it('should save background_color_style', async () => {
            const user = userEvent.setup()
            const { getByRole } = renderComponent()

            act(() => {
                const { onBackgroundStyleChange } = mockBrandCard.mock
                    .calls[0][0] as BrandCardProps
                onBackgroundStyleChange(GorgiasChatBackgroundColorStyle.Solid)
            })

            await user.click(getByRole('button', { name: 'Save' }))

            const calledWith =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(calledWith.decoration).toMatchObject({
                background_color_style: GorgiasChatBackgroundColorStyle.Solid,
            })
        })

        it('should sync the default backgroundStyle (Gradient) to the chat preview when background_color_style is missing', () => {
            renderComponent()

            expect(mockUpdateBackgroundStyle).toHaveBeenCalledWith(
                GorgiasChatBackgroundColorStyle.Gradient,
            )
        })

        it('should sync backgroundStyle to the chat preview when it loads', () => {
            const integration = fromJS({
                ...mockIntegration.toJS(),
                decoration: {
                    ...mockIntegration.get('decoration').toJS(),
                    background_color_style:
                        GorgiasChatBackgroundColorStyle.Solid,
                },
            })

            renderComponent(integration)

            expect(mockUpdateBackgroundStyle).toHaveBeenCalledWith(
                GorgiasChatBackgroundColorStyle.Solid,
            )
        })

        it('should re-sync backgroundStyle to the chat preview when it changes', () => {
            renderComponent()

            act(() => {
                const { onBackgroundStyleChange } = mockBrandCard.mock.calls[
                    mockBrandCard.mock.calls.length - 1
                ][0] as BrandCardProps
                onBackgroundStyleChange(GorgiasChatBackgroundColorStyle.Solid)
            })

            expect(mockUpdateBackgroundStyle).toHaveBeenLastCalledWith(
                GorgiasChatBackgroundColorStyle.Solid,
            )
        })

        it('should sync the default mainFontFamily (Inter) to the chat preview when main_font_family is missing', () => {
            renderComponent()

            expect(mockUpdateMainFontFamily).toHaveBeenCalledWith('Inter')
        })

        it('should sync mainFontFamily to the chat preview when it loads', () => {
            const integration = fromJS({
                ...mockIntegration.toJS(),
                decoration: {
                    ...mockIntegration.get('decoration').toJS(),
                    main_font_family: 'Roboto',
                },
            })

            renderComponent(integration)

            expect(mockUpdateMainFontFamily).toHaveBeenCalledWith('Roboto')
        })

        it('should re-sync mainFontFamily to the chat preview when it changes', () => {
            renderComponent()

            act(() => {
                const { onMainFontFamilyChange } = mockBrandCard.mock.calls[
                    mockBrandCard.mock.calls.length - 1
                ][0] as BrandCardProps
                onMainFontFamilyChange('Lato')
            })

            expect(mockUpdateMainFontFamily).toHaveBeenLastCalledWith('Lato')
        })

        it('should sync introductionText to the chat preview when it loads', () => {
            renderComponent()

            expect(mockUpdateIntroductionText).toHaveBeenCalledWith(
                'How can we help?',
            )
        })

        it('should re-sync introductionText to the chat preview when it changes', () => {
            renderComponent()

            act(() => {
                const { onIntroductionTextChange } = mockBrandCard.mock.calls[
                    mockBrandCard.mock.calls.length - 1
                ][0] as BrandCardProps
                onIntroductionTextChange('Hello!')
            })

            expect(mockUpdateIntroductionText).toHaveBeenLastCalledWith(
                'Hello!',
            )
        })

        it('should sync offlineIntroductionText to the chat preview when it loads', () => {
            renderComponent()

            expect(mockUpdateOfflineIntroductionText).toHaveBeenCalledWith(
                "We'll be back soon",
            )
        })

        it('should re-sync offlineIntroductionText to the chat preview when it changes', () => {
            renderComponent()

            act(() => {
                const { onOfflineIntroductionTextChange } = mockBrandCard.mock
                    .calls[
                    mockBrandCard.mock.calls.length - 1
                ][0] as BrandCardProps
                onOfflineIntroductionTextChange('Back tomorrow')
            })

            expect(mockUpdateOfflineIntroductionText).toHaveBeenLastCalledWith(
                'Back tomorrow',
            )
        })
    })

    describe('BrandCard', () => {
        it('should receive mainColor from integration', () => {
            renderComponent()

            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    mainColor: '#FF0000',
                }),
            )
        })

        it('should receive headerPictureUrl from integration', () => {
            renderComponent()

            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    headerPictureUrl: 'https://example.com/logo.png',
                }),
            )
        })

        it('should update mainColor when onMainColorChange is called', () => {
            renderComponent()

            act(() => {
                const { onMainColorChange } = mockBrandCard.mock.calls[0][0]
                onMainColorChange('#00FF00')
            })

            expect(mockBrandCard).toHaveBeenLastCalledWith(
                expect.objectContaining({ mainColor: '#00FF00' }),
            )
        })

        it('should update headerPictureUrl when onHeaderLogoUrlChange is called', () => {
            renderComponent()

            act(() => {
                const { onHeaderLogoUrlChange } = mockBrandCard.mock.calls[0][0]
                onHeaderLogoUrlChange('https://new-logo.png')
            })

            expect(mockBrandCard).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    headerPictureUrl: 'https://new-logo.png',
                }),
            )
        })

        it('should receive headerAlternativePictureUrl from integration', () => {
            renderComponent()

            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    headerAlternativePictureUrl:
                        'https://example.com/alternative-logo.png',
                }),
            )
        })

        it('should update headerAlternativePictureUrl when onHeaderAlternativePictureUrlChange is called', () => {
            renderComponent()

            act(() => {
                const { onHeaderAlternativePictureUrlChange } =
                    mockBrandCard.mock.calls[0][0]
                onHeaderAlternativePictureUrlChange(
                    'https://new-alternative-logo.png',
                )
            })

            expect(mockBrandCard).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    headerAlternativePictureUrl:
                        'https://new-alternative-logo.png',
                }),
            )
        })

        it('should receive greeting texts from integration decoration', () => {
            renderComponent()

            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    introductionText: 'How can we help?',
                    offlineIntroductionText: "We'll be back soon",
                }),
            )
        })

        it('should update introductionText when onIntroductionTextChange is called', () => {
            renderComponent()

            act(() => {
                const { onIntroductionTextChange } =
                    mockBrandCard.mock.calls[0][0]
                onIntroductionTextChange('Hi there!')
            })

            expect(mockBrandCard).toHaveBeenLastCalledWith(
                expect.objectContaining({ introductionText: 'Hi there!' }),
            )
        })

        it('should update offlineIntroductionText when onOfflineIntroductionTextChange is called', () => {
            renderComponent()

            act(() => {
                const { onOfflineIntroductionTextChange } =
                    mockBrandCard.mock.calls[0][0]
                onOfflineIntroductionTextChange('Back tomorrow')
            })

            expect(mockBrandCard).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    offlineIntroductionText: 'Back tomorrow',
                }),
            )
        })

        it('should pass isAiAgentEnabled=false from the hook', () => {
            renderComponent()

            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({ isAiAgentEnabled: false }),
            )
        })

        it('should pass isAiAgentEnabled=true when the hook reports AI Agent enabled', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: true,
                isLoading: false,
            })

            renderComponent()

            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({ isAiAgentEnabled: true }),
            )
        })

        it('should submit greeting texts in the decoration payload', async () => {
            const user = userEvent.setup()
            const { getByRole } = renderComponent()

            act(() => {
                const { onIntroductionTextChange } =
                    mockBrandCard.mock.calls[0][0]
                onIntroductionTextChange('Hi there!')
            })

            await user.click(getByRole('button', { name: 'Save' }))

            const calledWith =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(calledWith.decoration).toMatchObject({
                introduction_text: 'Hi there!',
                offline_introduction_text: "We'll be back soon",
            })
        })
    })

    describe('ChatLauncherCard', () => {
        it('should receive position from integration', () => {
            renderComponent()

            expect(mockChatLauncherCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    position: {
                        alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT,
                        offsetX: 10,
                        offsetY: 20,
                    },
                }),
            )
        })

        it('should update position when onPositionChange is called', () => {
            renderComponent()

            act(() => {
                const { onPositionChange } =
                    mockChatLauncherCard.mock.calls[0][0]
                onPositionChange({
                    alignment: GorgiasChatPositionAlignmentEnum.TOP_RIGHT,
                    offsetX: 5,
                    offsetY: 15,
                })
            })

            expect(mockChatLauncherCard).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    position: {
                        alignment: GorgiasChatPositionAlignmentEnum.TOP_RIGHT,
                        offsetX: 5,
                        offsetY: 15,
                    },
                }),
            )
        })
    })

    describe('LegalCard', () => {
        it('should receive legalDisclaimerText from application texts API', async () => {
            renderComponent()

            await waitFor(() => {
                expect(mockLegalCard).toHaveBeenCalledWith(
                    expect.objectContaining({
                        legalDisclaimerText: 'Privacy policy text from API',
                    }),
                )
            })
        })

        it('should receive legalDisclaimerEnabled from integration', () => {
            renderComponent()

            expect(mockLegalCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    legalDisclaimerEnabled: true,
                }),
            )
        })

        it('should call getApplicationTexts with the app_id', async () => {
            renderComponent()

            await waitFor(() => {
                expect(mockGetApplicationTexts).toHaveBeenCalledWith(
                    'test-app-id',
                )
            })
        })

        it('should update legalDisclaimerEnabled when onLegalDisclaimerEnabledChange is called', () => {
            renderComponent()

            act(() => {
                const { onLegalDisclaimerEnabledChange } =
                    mockLegalCard.mock.calls[0][0]
                onLegalDisclaimerEnabledChange(false)
            })

            expect(mockLegalCard).toHaveBeenLastCalledWith(
                expect.objectContaining({ legalDisclaimerEnabled: false }),
            )
        })

        it('should update legalDisclaimerText when onLegalDisclaimerTextChange is called', async () => {
            renderComponent()

            await waitFor(() => {
                expect(mockGetApplicationTexts).toHaveBeenCalled()
            })

            act(() => {
                const { onLegalDisclaimerTextChange } =
                    mockLegalCard.mock.calls[
                        mockLegalCard.mock.calls.length - 1
                    ][0]
                onLegalDisclaimerTextChange('Updated disclaimer')
            })

            expect(mockLegalCard).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    legalDisclaimerText: 'Updated disclaimer',
                }),
            )
        })

        it('should not call getApplicationTexts when no app_id', () => {
            const integrationWithoutAppId = fromJS({
                id: 1,
                name: 'Test Chat',
                type: IntegrationType.GorgiasChat,
                meta: { preferences: {} },
                decoration: {},
            })

            renderComponent(integrationWithoutAppId)

            expect(mockGetApplicationTexts).not.toHaveBeenCalled()
        })

        const makeIntegrationWithDisclaimerEnabled = (enabled: boolean) =>
            fromJS({
                ...mockIntegration.toJS(),
                meta: {
                    ...mockIntegration.get('meta').toJS(),
                    preferences: {
                        ...mockIntegration
                            .getIn(['meta', 'preferences'])
                            .toJS(),
                        privacy_policy_disclaimer_enabled: enabled,
                    },
                },
            })

        it('should sync legalDisclaimerEnabled=false to the chat preview when it loads', () => {
            renderComponent(makeIntegrationWithDisclaimerEnabled(false))

            expect(mockUpdateLegalDisclaimerEnabled).toHaveBeenCalledWith(false)
        })

        it('should sync legalDisclaimerEnabled=true to the chat preview when it loads', () => {
            renderComponent(makeIntegrationWithDisclaimerEnabled(true))

            expect(mockUpdateLegalDisclaimerEnabled).toHaveBeenCalledWith(true)
        })

        it('should default legalDisclaimerEnabled to false when missing from integration', () => {
            const integrationWithoutPreference = fromJS({
                ...mockIntegration.toJS(),
                meta: {
                    ...mockIntegration.get('meta').toJS(),
                    preferences: {},
                },
            })

            renderComponent(integrationWithoutPreference)

            expect(mockUpdateLegalDisclaimerEnabled).toHaveBeenCalledWith(false)
        })

        it('should subscribe with fireIfAlreadyLoaded=true so the value is pushed even if the iframe is already loaded', () => {
            renderComponent()

            expect(mockOnChatPreviewLoaded).toHaveBeenCalledWith(
                expect.any(Function),
                true,
            )
        })

        it('should re-sync legalDisclaimerEnabled to the chat preview when the toggle changes', () => {
            renderComponent(makeIntegrationWithDisclaimerEnabled(true))

            expect(mockUpdateLegalDisclaimerEnabled).toHaveBeenLastCalledWith(
                true,
            )

            act(() => {
                const { onLegalDisclaimerEnabledChange } =
                    mockLegalCard.mock.calls[
                        mockLegalCard.mock.calls.length - 1
                    ][0]
                onLegalDisclaimerEnabledChange(false)
            })

            expect(mockUpdateLegalDisclaimerEnabled).toHaveBeenLastCalledWith(
                false,
            )
        })

        it('should clean up the chat preview subscription on unmount', () => {
            const unsubscribe = jest.fn()
            mockOnChatPreviewLoaded.mockReturnValue(unsubscribe)

            const { unmount } = renderComponent()
            unmount()

            expect(unsubscribe).toHaveBeenCalled()
        })
    })

    describe('chat title preview sync', () => {
        it('should sync the integration name to the chat preview when it loads', () => {
            renderComponent()

            expect(mockUpdateChatTitle).toHaveBeenCalledWith('Test Chat')
        })

        it('should re-sync the chat title to the preview when the name changes', () => {
            renderComponent()

            act(() => {
                const { onNameChange } = mockBrandCard.mock
                    .calls[0][0] as BrandCardProps
                onNameChange('New Title')
            })

            expect(mockUpdateChatTitle).toHaveBeenLastCalledWith('New Title')
        })
    })

    describe('AvatarCard', () => {
        it('should receive name from integration', () => {
            renderComponent()

            expect(mockAvatarCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Test Chat',
                }),
            )
        })

        it('should receive avatar settings from integration', () => {
            renderComponent()

            expect(mockAvatarCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    avatar: {
                        imageType: GorgiasChatAvatarImageType.AGENT_INITIALS,
                        nameType: GorgiasChatAvatarNameType.AGENT_FULLNAME,
                        companyLogoUrl: 'https://example.com/company.png',
                    },
                }),
            )
        })

        it('should update avatar when onAvatarChange is called', () => {
            renderComponent()

            const newAvatar: GorgiasChatAvatarSettings = {
                imageType: GorgiasChatAvatarImageType.COMPANY_LOGO,
                nameType: GorgiasChatAvatarNameType.CHAT_TITLE,
                companyLogoUrl: 'https://example.com/new-logo.png',
            }

            act(() => {
                const { onAvatarChange } = mockAvatarCard.mock.calls[0][0]
                onAvatarChange(newAvatar)
            })

            expect(mockAvatarCard).toHaveBeenLastCalledWith(
                expect.objectContaining({ avatar: newAvatar }),
            )
        })
    })

    describe('ChatbotCard', () => {
        beforeEach(() => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: false,
            })
        })

        it('should not render when AI agent is enabled', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: true,
                isLoading: false,
            })

            renderComponent()

            expect(mockChatbotCard).not.toHaveBeenCalled()
        })

        it('should not render while AI agent config is loading', () => {
            mockUseIsAiAgentEnabled.mockReturnValue({
                isAiAgentEnabled: false,
                isLoading: true,
            })

            renderComponent()

            expect(mockChatbotCard).not.toHaveBeenCalled()
        })

        it('should render when AI agent is disabled', () => {
            renderComponent()

            expect(mockChatbotCard).toHaveBeenCalled()
        })

        it('should default displayBotLabel to true when missing on integration', () => {
            renderComponent()

            expect(mockChatbotCard).toHaveBeenCalledWith(
                expect.objectContaining({ displayBotLabel: true }),
            )
        })

        it('should read displayBotLabel from integration decoration', () => {
            const integration = fromJS({
                ...mockIntegration.toJS(),
                decoration: {
                    ...mockIntegration.get('decoration').toJS(),
                    display_bot_label: false,
                },
            })

            renderComponent(integration)

            expect(mockChatbotCard).toHaveBeenCalledWith(
                expect.objectContaining({ displayBotLabel: false }),
            )
        })

        it('should update displayBotLabel when onDisplayBotLabelChange is called', () => {
            renderComponent()

            act(() => {
                const { onDisplayBotLabelChange } = mockChatbotCard.mock
                    .calls[0][0] as ChatbotCardProps
                onDisplayBotLabelChange(false)
            })

            expect(mockChatbotCard).toHaveBeenLastCalledWith(
                expect.objectContaining({ displayBotLabel: false }),
            )
        })

        it('should persist displayBotLabel under decoration.display_bot_label on save', async () => {
            const user = userEvent.setup()
            const { getByRole } = renderComponent()

            act(() => {
                const { onDisplayBotLabelChange } = mockChatbotCard.mock
                    .calls[0][0] as ChatbotCardProps
                onDisplayBotLabelChange(false)
            })

            await user.click(getByRole('button', { name: 'Save' }))

            const calledWith =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(calledWith.decoration.display_bot_label).toBe(false)
        })
    })

    describe('isSaving', () => {
        it('should pass isSaving as true when updateIntegration loading matches integration id', () => {
            const { getByRole } = renderComponent(
                mockIntegration,
                fromJS({ updateIntegration: 1 }),
            )

            expect(getByRole('button', { name: 'Save' }).dataset.saving).toBe(
                'true',
            )
        })

        it('should pass isSaving as false when no loading state', () => {
            const { getByRole } = renderComponent()

            expect(getByRole('button', { name: 'Save' }).dataset.saving).toBe(
                'false',
            )
        })
    })

    describe('default values', () => {
        it('should use defaults when integration has no decoration', () => {
            const emptyIntegration = fromJS({
                id: 2,
                name: '',
                type: IntegrationType.GorgiasChat,
                meta: { preferences: {} },
            })

            renderComponent(emptyIntegration)

            expect(mockBrandCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    mainColor: '#115cb5',
                    headerPictureUrl: undefined,
                    headerAlternativePictureUrl: undefined,
                }),
            )

            expect(mockLegalCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    legalDisclaimerText: undefined,
                    legalDisclaimerEnabled: false,
                }),
            )
        })
    })

    describe('form submission', () => {
        it('should call updateOrCreateIntegration with form data when Save is clicked', async () => {
            const user = userEvent.setup()
            const { getByRole } = renderComponent()

            act(() => {
                const { onMainColorChange, onConversationColorChange } =
                    mockBrandCard.mock.calls[0][0] as BrandCardProps
                onMainColorChange('#00FF00')
                onConversationColorChange('#00FF00')
            })

            await user.click(getByRole('button', { name: 'Save' }))

            expect(mockUpdateOrCreateIntegration).toHaveBeenCalledWith(
                expect.objectContaining({
                    toJS: expect.any(Function),
                }),
                undefined,
                undefined,
                undefined,
                true,
                undefined,
                true,
            )

            const calledWith =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(calledWith).toMatchObject({
                id: 1,
                name: 'Test Chat',
                decoration: expect.objectContaining({
                    main_color: '#00FF00',
                    conversation_color: '#00FF00',
                }),
            })
        })

        it('should call savePrivacyPolicyText (updateApplicationTexts) when Save is clicked', async () => {
            const user = userEvent.setup()
            const { getByRole } = renderComponent()

            await waitFor(() => {
                expect(mockGetApplicationTexts).toHaveBeenCalled()
            })

            act(() => {
                const { onLegalDisclaimerTextChange } =
                    mockLegalCard.mock.calls[
                        mockLegalCard.mock.calls.length - 1
                    ][0]
                onLegalDisclaimerTextChange('Updated disclaimer')
            })

            await user.click(getByRole('button', { name: 'Save' }))

            await waitFor(() => {
                expect(mockUpdateApplicationTexts).toHaveBeenCalledWith(
                    'test-app-id',
                    expect.anything(),
                )
            })
        })

        it('should fall back to default color when mainColor is not a valid CSS color', async () => {
            const user = userEvent.setup()
            ;(global.CSS.supports as jest.Mock).mockReturnValue(false)

            const integrationWithInvalidColor = fromJS({
                ...mockIntegration.toJS(),
                decoration: {
                    ...mockIntegration.get('decoration').toJS(),
                    main_color: 'not-a-valid-color',
                },
            })

            const { getByRole } = renderComponent(integrationWithInvalidColor)

            act(() => {
                const { onAvatarChange, avatar } =
                    mockAvatarCard.mock.calls[0][0]
                onAvatarChange({
                    ...avatar,
                    nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
                })
            })

            await user.click(getByRole('button', { name: 'Save' }))

            const calledWith =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(calledWith.decoration.main_color).toBe('#115cb5')
            expect(calledWith.decoration.conversation_color).toBe('#115cb5')
        })
    })

    describe('integration reset', () => {
        it('should reset form values when integration prop changes and loading is done', async () => {
            const { rerender } = renderComponent()

            const updatedIntegration = fromJS({
                ...mockIntegration.toJS(),
                name: 'Updated Chat Name',
                decoration: {
                    ...mockIntegration.get('decoration').toJS(),
                    main_color: '#00FF00',
                },
            })

            rerender(
                <GorgiasChatIntegrationAppearanceRevamp
                    integration={updatedIntegration}
                    loading={mockLoading}
                />,
            )

            await waitFor(() => {
                expect(mockBrandCard).toHaveBeenCalledWith(
                    expect.objectContaining({
                        mainColor: '#00FF00',
                    }),
                )
            })
        })

        it('should not reset form values when integration is still loading', async () => {
            const loadingState = fromJS({ integration: true })
            const updatedIntegration = fromJS({
                ...mockIntegration.toJS(),
                name: 'Should Not Update',
                decoration: {
                    ...mockIntegration.get('decoration').toJS(),
                    main_color: '#ABCDEF',
                },
            })

            const { rerender } = renderComponent(mockIntegration, loadingState)

            rerender(
                <GorgiasChatIntegrationAppearanceRevamp
                    integration={updatedIntegration}
                    loading={loadingState}
                />,
            )

            expect(mockBrandCard).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    mainColor: '#ABCDEF',
                }),
            )
        })
    })

    describe('save button disabled state', () => {
        it('should be disabled by default', () => {
            const { getByRole } = renderComponent()

            expect(getByRole('button', { name: 'Save' })).toBeDisabled()
        })

        it('should stay disabled after privacy policy text loads', async () => {
            const { getByRole } = renderComponent()

            await waitFor(() => {
                expect(mockLegalCard).toHaveBeenCalledWith(
                    expect.objectContaining({
                        legalDisclaimerText: 'Privacy policy text from API',
                    }),
                )
            })

            expect(getByRole('button', { name: 'Save' })).toBeDisabled()
        })

        it('should become enabled after a field is changed', () => {
            const { getByRole } = renderComponent()

            act(() => {
                const { onMainColorChange } = mockBrandCard.mock.calls[0][0]
                onMainColorChange('#00FF00')
            })

            expect(getByRole('button', { name: 'Save' })).not.toBeDisabled()
        })
    })
})
