import type { ReactNode } from 'react'
import React from 'react'

import { act, render, waitFor } from '@testing-library/react'
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
    GorgiasChatPositionAlignmentEnum,
    IntegrationType,
} from 'models/integration/types'
import { GorgiasChatIntegrationAppearanceRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationAppearance'
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

const mockDispatch = jest.fn().mockResolvedValue({})
const mockUseAppDispatch = jest.mocked(useAppDispatch)
const mockGetApplicationTexts = jest.mocked(getApplicationTexts)
const mockUpdateApplicationTexts = jest.mocked(updateApplicationTexts)
const mockUpdateOrCreateIntegration = jest.mocked(updateOrCreateIntegration)

type BrandCardProps = {
    mainColor: string
    headerPictureUrl?: string
    onMainColorChange: (value: string) => void
    onHeaderLogoUrlChange: (url?: string) => void
}

type ChatLauncherCardProps = {
    launcher: { type: string; label: string }
    mainColor: string
    position: GorgiasChatPosition
    onLauncherChange: (launcher: { type: string; label: string }) => void
    onPositionChange: (position: GorgiasChatPosition) => void
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
    onNameChange: (value: string) => void
    onAvatarChange: (avatar: GorgiasChatAvatarSettings) => void
}

const mockBrandCard = jest.fn()
const mockChatLauncherCard = jest.fn()
const mockLegalCard = jest.fn()
const mockAvatarCard = jest.fn()

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatRevampLayout',
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
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatCreationWizard/components/SaveChangesPrompt',
    () => ({
        __esModule: true,
        default: () => null,
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
    () => ({
        useGorgiasChatCreationWizardContext: () => ({
            resetPreview: jest.fn(),
        }),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationAppearance/BrandCard/BrandCard',
    () => ({
        BrandCard: (props: BrandCardProps) => {
            mockBrandCard(props)
            return null
        },
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationAppearance/LegalCard/LegalCard',
    () => ({
        LegalCard: (props: LegalCardProps) => {
            mockLegalCard(props)
            return null
        },
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationAppearance/AvatarCard/AvatarCard',
    () => ({
        AvatarCard: (props: AvatarCardProps) => {
            mockAvatarCard(props)
            return null
        },
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationAppearance/ChatLauncherCard/ChatLauncherCard',
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
        mockGetApplicationTexts.mockResolvedValue(mockApplicationTextsResponse)
        mockUpdateApplicationTexts.mockResolvedValue(undefined)
        global.CSS = {
            supports: jest.fn().mockReturnValue(true),
        } as unknown as typeof CSS
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
                const { onMainColorChange } = mockBrandCard.mock
                    .calls[0][0] as BrandCardProps
                onMainColorChange('#00FF00')
            })

            expect(mockBrandCard).toHaveBeenLastCalledWith(
                expect.objectContaining({ mainColor: '#00FF00' }),
            )
        })

        it('should update headerPictureUrl when onHeaderLogoUrlChange is called', () => {
            renderComponent()

            act(() => {
                const { onHeaderLogoUrlChange } = mockBrandCard.mock
                    .calls[0][0] as BrandCardProps
                onHeaderLogoUrlChange('https://new-logo.png')
            })

            expect(mockBrandCard).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    headerPictureUrl: 'https://new-logo.png',
                }),
            )
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
                const { onPositionChange } = mockChatLauncherCard.mock
                    .calls[0][0] as ChatLauncherCardProps
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
                const { onLegalDisclaimerEnabledChange } = mockLegalCard.mock
                    .calls[0][0] as LegalCardProps
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
                const { onLegalDisclaimerTextChange } = mockLegalCard.mock
                    .calls[
                    mockLegalCard.mock.calls.length - 1
                ][0] as LegalCardProps
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

        it('should update name when onNameChange is called', () => {
            renderComponent()

            act(() => {
                const { onNameChange } = mockAvatarCard.mock
                    .calls[0][0] as AvatarCardProps
                onNameChange('New Chat Name')
            })

            expect(mockAvatarCard).toHaveBeenLastCalledWith(
                expect.objectContaining({ name: 'New Chat Name' }),
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
                const { onAvatarChange } = mockAvatarCard.mock
                    .calls[0][0] as AvatarCardProps
                onAvatarChange(newAvatar)
            })

            expect(mockAvatarCard).toHaveBeenLastCalledWith(
                expect.objectContaining({ avatar: newAvatar }),
            )
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
                const { onMainColorChange } = mockBrandCard.mock
                    .calls[0][0] as BrandCardProps
                onMainColorChange('#00FF00')
            })

            await user.click(getByRole('button', { name: 'Save' }))

            expect(mockUpdateOrCreateIntegration).toHaveBeenCalledWith(
                expect.objectContaining({
                    toJS: expect.any(Function),
                }),
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
                const { onLegalDisclaimerTextChange } = mockLegalCard.mock
                    .calls[
                    mockLegalCard.mock.calls.length - 1
                ][0] as LegalCardProps
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
                const { onNameChange } = mockAvatarCard.mock
                    .calls[0][0] as AvatarCardProps
                onNameChange('New Chat Name')
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

        it('should become enabled after a field is changed', () => {
            const { getByRole } = renderComponent()

            act(() => {
                const { onMainColorChange } = mockBrandCard.mock
                    .calls[0][0] as BrandCardProps
                onMainColorChange('#00FF00')
            })

            expect(getByRole('button', { name: 'Save' })).not.toBeDisabled()
        })
    })
})
