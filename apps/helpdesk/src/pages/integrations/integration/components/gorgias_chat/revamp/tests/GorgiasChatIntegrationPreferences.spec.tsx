import React from 'react'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { IntegrationType } from 'models/integration/types'
import { GorgiasChatIntegrationPreferencesRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationPreferences'
import { submitSetting } from 'state/currentAccount/actions'

const mockChatAvailabilityCard = jest.fn()
const mockChatVisibilityCard = jest.fn()
const mockChatWaitTimeCard = jest.fn()
const mockChatAutomationCard = jest.fn()
const mockChatEmailCaptureCard = jest.fn()
const mockChatShopperExperienceCard = jest.fn()
const mockDispatch = jest.fn()

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatRevampLayout',
    () => ({
        GorgiasChatRevampLayout: ({
            children,
            onSave,
            isSaveDisabled,
        }: {
            children: React.ReactNode
            onSave: () => void
            isSaveDisabled: boolean
        }) => (
            <>
                <button onClick={onSave} disabled={isSaveDisabled}>
                    Save
                </button>
                {children}
            </>
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

jest.mock('../components/ChatPreviewPanel/hooks/useChatPreviewPanel', () => ({
    useChatPreviewPanel: jest.fn(),
    useGorgiasChatCreationWizardContext: () => ({ resetPreview: jest.fn() }),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationPreferences/ChatAvailabilityCard/ChatAvailabilityCard',
    () => ({
        ChatAvailabilityCard: (props: any) => {
            mockChatAvailabilityCard(props)
            return null
        },
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationPreferences/ChatVisibilityCard/ChatVisibilityCard',
    () => ({
        ChatVisibilityCard: (props: any) => {
            mockChatVisibilityCard(props)
            return null
        },
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationPreferences/ChatWaitTimeCard/ChatWaitTimeCard',
    () => ({
        ChatWaitTimeCard: (props: any) => {
            mockChatWaitTimeCard(props)
            return null
        },
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationPreferences/ChatAutomationCard/ChatAutomationCard',
    () => ({
        ChatAutomationCard: (props: any) => {
            mockChatAutomationCard(props)
            return null
        },
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationPreferences/ChatEmailCaptureCard/ChatEmailCaptureCard',
    () => ({
        ChatEmailCaptureCard: (props: any) => {
            mockChatEmailCaptureCard(props)
            return null
        },
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationPreferences/ChatShopperExperienceCard/ChatShopperExperienceCard',
    () => ({
        ChatShopperExperienceCard: (props: any) => {
            mockChatShopperExperienceCard(props)
            return null
        },
    }),
)

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: () => mockDispatch,
}))

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        id: 1,
        data: {
            send_survey_for_chat: false,
            send_survey_for_email: false,
            survey_email_html: '',
            survey_email_text: '',
            survey_interval: 24,
        },
    })),
}))

jest.mock('state/currentAccount/actions', () => ({
    submitSetting: jest.fn((s) => s),
}))

jest.mock('state/currentAccount/selectors', () => ({
    getSurveysSettingsJS: jest.fn(),
}))

const mockSubmitSetting = submitSetting as jest.MockedFunction<
    typeof submitSetting
>

describe('GorgiasChatIntegrationPreferencesRevamp', () => {
    const mockUpdateOrCreateIntegration = jest.fn()

    const mockIntegration = fromJS({
        id: 1,
        name: 'Test Chat',
        type: IntegrationType.GorgiasChat,
        deactivated_datetime: null,
        meta: {
            preferences: {
                live_chat_availability: 'auto-based-on-agent-availability',
                hide_outside_business_hours: false,
                hide_on_mobile: false,
                display_campaigns_hidden_chat: false,
                auto_responder: { enabled: true, reply: 'reply-dynamic' },
                control_ticket_volume: false,
                email_capture_enabled: true,
                email_capture_enforcement: 'optional',
                linked_email_integration: null,
                send_chat_transcript: false,
            },
        },
    })

    const mockActions = {
        updateOrCreateIntegration: mockUpdateOrCreateIntegration,
    }

    const renderComponent = (props: Record<string, unknown> = {}) => {
        return render(
            <GorgiasChatIntegrationPreferencesRevamp
                integration={mockIntegration}
                actions={mockActions}
                isAiAgentEnabled
                {...props}
            />,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockDispatch.mockResolvedValue(undefined)
        mockUpdateOrCreateIntegration.mockResolvedValue(undefined)
    })

    it('should render the save button', () => {
        renderComponent()

        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    describe('ChatAvailabilityCard', () => {
        it('should pass liveChatAvailability from integration preferences', () => {
            renderComponent()

            expect(mockChatAvailabilityCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    liveChatAvailability: 'auto-based-on-agent-availability',
                }),
            )
        })
    })

    describe('ChatVisibilityCard', () => {
        it('should pass displayChat as true when deactivated_datetime is null', () => {
            renderComponent()

            expect(mockChatVisibilityCard).toHaveBeenCalledWith(
                expect.objectContaining({ displayChat: true }),
            )
        })

        it('should pass displayChat as false when deactivated_datetime is set', () => {
            const deactivatedIntegration = mockIntegration.set(
                'deactivated_datetime',
                '2024-01-01T00:00:00Z',
            )
            renderComponent({ integration: deactivatedIntegration })

            expect(mockChatVisibilityCard).toHaveBeenCalledWith(
                expect.objectContaining({ displayChat: false }),
            )
        })

        it('should pass showOutsideBusinessHours as true when hide_outside_business_hours is false', () => {
            renderComponent()

            expect(mockChatVisibilityCard).toHaveBeenCalledWith(
                expect.objectContaining({ showOutsideBusinessHours: true }),
            )
        })
    })

    describe('ChatWaitTimeCard', () => {
        it('should pass autoResponderEnabled from integration preferences', () => {
            renderComponent()

            expect(mockChatWaitTimeCard).toHaveBeenCalledWith(
                expect.objectContaining({ autoResponderEnabled: true }),
            )
        })

        it('should pass autoResponderReply from integration preferences', () => {
            renderComponent()

            expect(mockChatWaitTimeCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    autoResponderReply: 'reply-dynamic',
                }),
            )
        })
    })

    describe('ChatAutomationCard', () => {
        it('should pass controlTicketVolume from integration preferences', () => {
            renderComponent()

            expect(mockChatAutomationCard).toHaveBeenCalledWith(
                expect.objectContaining({ controlTicketVolume: false }),
            )
        })
    })

    describe('ChatEmailCaptureCard', () => {
        it('should pass emailCaptureEnabled from integration preferences', () => {
            renderComponent()

            expect(mockChatEmailCaptureCard).toHaveBeenCalledWith(
                expect.objectContaining({ emailCaptureEnabled: true }),
            )
        })

        it('should pass emailCaptureEnforcement from integration preferences', () => {
            renderComponent()

            expect(mockChatEmailCaptureCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    emailCaptureEnforcement: 'optional',
                }),
            )
        })
    })

    describe('ChatShopperExperienceCard', () => {
        it('should pass sendChatTranscript from integration preferences', () => {
            renderComponent()

            expect(mockChatShopperExperienceCard).toHaveBeenCalledWith(
                expect.objectContaining({ sendChatTranscript: false }),
            )
        })

        it('should pass sendCsat from global surveys settings', () => {
            renderComponent()

            expect(mockChatShopperExperienceCard).toHaveBeenCalledWith(
                expect.objectContaining({ sendCsat: false }),
            )
        })
    })

    describe('Default form values when preferences are missing', () => {
        const integrationWithoutPreferences = fromJS({
            id: 1,
            name: 'Test Chat',
            type: IntegrationType.GorgiasChat,
            deactivated_datetime: null,
            meta: {},
        })

        it('should use defaults for all fields when preferences are not set', () => {
            renderComponent({ integration: integrationWithoutPreferences })

            expect(mockChatAvailabilityCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    liveChatAvailability: 'auto-based-on-agent-availability',
                }),
            )
            expect(mockChatVisibilityCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    displayChat: true,
                    showOutsideBusinessHours: true,
                    showOnMobile: true,
                    displayCampaignsWhenHidden: false,
                }),
            )
            expect(mockChatAutomationCard).toHaveBeenCalledWith(
                expect.objectContaining({ controlTicketVolume: false }),
            )
            expect(mockChatEmailCaptureCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    emailCaptureEnforcement: 'optional',
                }),
            )
            expect(mockChatShopperExperienceCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    linkedEmailIntegration: null,
                    sendChatTranscript: false,
                }),
            )
        })
    })

    describe('Form loading state', () => {
        it('should not reset form when integration is still loading', () => {
            renderComponent({ loading: fromJS({ integration: true }) })

            expect(mockChatAvailabilityCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    liveChatAvailability: 'auto-based-on-agent-availability',
                }),
            )
        })
    })

    describe('surveysSettings is null', () => {
        const mockUseAppSelector = jest.mocked(
            require('hooks/useAppSelector').default,
        )
        const defaultSurveysSettings = {
            id: 1,
            data: {
                send_survey_for_chat: false,
                send_survey_for_email: false,
                survey_email_html: '',
                survey_email_text: '',
                survey_interval: 24,
            },
        }

        beforeEach(() => {
            mockUseAppSelector.mockReturnValue(null)
        })

        afterEach(() => {
            mockUseAppSelector.mockReturnValue(defaultSurveysSettings)
        })

        it('should default sendCsat to false when surveysSettings is null', () => {
            renderComponent()

            expect(mockChatShopperExperienceCard).toHaveBeenCalledWith(
                expect.objectContaining({ sendCsat: false }),
            )
        })

        it('should not call submitSetting when surveysSettings is null even if sendCsat changes', async () => {
            const user = userEvent.setup()
            renderComponent()

            const { onSendCsatChange } =
                mockChatShopperExperienceCard.mock.calls[0][0]
            act(() => onSendCsatChange(true))

            await user.click(screen.getByRole('button', { name: 'Save' }))

            expect(mockSubmitSetting).not.toHaveBeenCalled()
        })
    })

    describe('Form field onChange callbacks', () => {
        it('should update liveChatAvailability via ChatAvailabilityCard onChange', async () => {
            const user = userEvent.setup()
            renderComponent()

            const { onChange } = mockChatAvailabilityCard.mock.calls[0][0]
            act(() => onChange('always-online'))

            await user.click(screen.getByRole('button', { name: 'Save' }))

            const payload =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(payload.meta.preferences.live_chat_availability).toBe(
                'always-online',
            )
        })

        it('should update displayChat via ChatVisibilityCard onDisplayChatChange', async () => {
            const user = userEvent.setup()
            renderComponent()

            const { onDisplayChatChange } =
                mockChatVisibilityCard.mock.calls[0][0]
            act(() => onDisplayChatChange(false))

            await user.click(screen.getByRole('button', { name: 'Save' }))

            const payload =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(payload.deactivated_datetime).not.toBeNull()
        })

        it('should preserve existing deactivated_datetime when disabling chat', async () => {
            const user = userEvent.setup()
            const existingDatetime = '2024-01-01T00:00:00Z'
            const deactivatedIntegration = mockIntegration.set(
                'deactivated_datetime',
                existingDatetime,
            )
            renderComponent({ integration: deactivatedIntegration })

            // displayChat defaults to false for a deactivated integration, so
            // change another field first to make the form dirty before saving
            const { onShowOutsideBusinessHoursChange } =
                mockChatVisibilityCard.mock.calls[0][0]
            act(() => onShowOutsideBusinessHoursChange(false))

            await user.click(screen.getByRole('button', { name: 'Save' }))

            const payload =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(payload.deactivated_datetime).toBe(existingDatetime)
        })

        it('should update showOutsideBusinessHours via ChatVisibilityCard onShowOutsideBusinessHoursChange', async () => {
            const user = userEvent.setup()
            renderComponent()

            const { onShowOutsideBusinessHoursChange } =
                mockChatVisibilityCard.mock.calls[0][0]
            act(() => onShowOutsideBusinessHoursChange(false))

            await user.click(screen.getByRole('button', { name: 'Save' }))

            const payload =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(payload.meta.preferences.hide_outside_business_hours).toBe(
                true,
            )
        })

        it('should update showOnMobile via ChatVisibilityCard onShowOnMobileChange', async () => {
            const user = userEvent.setup()
            renderComponent()

            const { onShowOnMobileChange } =
                mockChatVisibilityCard.mock.calls[0][0]
            act(() => onShowOnMobileChange(false))

            await user.click(screen.getByRole('button', { name: 'Save' }))

            const payload =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(payload.meta.preferences.hide_on_mobile).toBe(true)
        })

        it('should update displayCampaignsWhenHidden via ChatVisibilityCard onDisplayCampaignsWhenHiddenChange', async () => {
            const user = userEvent.setup()
            renderComponent()

            const { onDisplayCampaignsWhenHiddenChange } =
                mockChatVisibilityCard.mock.calls[0][0]
            act(() => onDisplayCampaignsWhenHiddenChange(true))

            await user.click(screen.getByRole('button', { name: 'Save' }))

            const payload =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(payload.meta.preferences.display_campaigns_hidden_chat).toBe(
                true,
            )
        })

        it('should update autoResponderEnabled via ChatWaitTimeCard onAutoResponderEnabledChange', async () => {
            const user = userEvent.setup()
            renderComponent()

            const { onAutoResponderEnabledChange } =
                mockChatWaitTimeCard.mock.calls[0][0]
            act(() => onAutoResponderEnabledChange(false))

            await user.click(screen.getByRole('button', { name: 'Save' }))

            const payload =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(payload.meta.preferences.auto_responder.enabled).toBe(false)
        })

        it('should update autoResponderReply via ChatWaitTimeCard onAutoResponderReplyChange', async () => {
            const user = userEvent.setup()
            renderComponent()

            const { onAutoResponderReplyChange } =
                mockChatWaitTimeCard.mock.calls[0][0]
            act(() => onAutoResponderReplyChange('reply-static'))

            await user.click(screen.getByRole('button', { name: 'Save' }))

            const payload =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(payload.meta.preferences.auto_responder.reply).toBe(
                'reply-static',
            )
        })

        it('should update controlTicketVolume via ChatAutomationCard onControlTicketVolumeChange', async () => {
            const user = userEvent.setup()
            renderComponent()

            const { onControlTicketVolumeChange } =
                mockChatAutomationCard.mock.calls[0][0]
            act(() => onControlTicketVolumeChange(true))

            await user.click(screen.getByRole('button', { name: 'Save' }))

            const payload =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(payload.meta.preferences.control_ticket_volume).toBe(true)
        })

        it('should update emailCaptureEnabled via ChatEmailCaptureCard onEmailCaptureEnabledChange', async () => {
            const user = userEvent.setup()
            renderComponent()

            const { onEmailCaptureEnabledChange } =
                mockChatEmailCaptureCard.mock.calls[0][0]
            act(() => onEmailCaptureEnabledChange(false))

            await user.click(screen.getByRole('button', { name: 'Save' }))

            const payload =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(payload.meta.preferences.email_capture_enabled).toBe(false)
        })

        it('should update emailCaptureEnforcement via ChatEmailCaptureCard onEmailCaptureEnforcementChange', async () => {
            const user = userEvent.setup()
            renderComponent()

            const { onEmailCaptureEnforcementChange } =
                mockChatEmailCaptureCard.mock.calls[0][0]
            act(() => onEmailCaptureEnforcementChange('required'))

            await user.click(screen.getByRole('button', { name: 'Save' }))

            const payload =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(payload.meta.preferences.email_capture_enforcement).toBe(
                'required',
            )
        })

        it('should update linkedEmailIntegration via ChatShopperExperienceCard onLinkedEmailIntegrationChange', async () => {
            const user = userEvent.setup()
            renderComponent()

            const { onLinkedEmailIntegrationChange } =
                mockChatShopperExperienceCard.mock.calls[0][0]
            act(() => onLinkedEmailIntegrationChange(42))

            await user.click(screen.getByRole('button', { name: 'Save' }))

            const payload =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(payload.meta.preferences.linked_email_integration).toBe(42)
        })

        it('should update sendChatTranscript via ChatShopperExperienceCard onSendChatTranscriptChange', async () => {
            const user = userEvent.setup()
            renderComponent()

            const { onSendChatTranscriptChange } =
                mockChatShopperExperienceCard.mock.calls[0][0]
            act(() => onSendChatTranscriptChange(true))

            await user.click(screen.getByRole('button', { name: 'Save' }))

            const payload =
                mockUpdateOrCreateIntegration.mock.calls[0][0].toJS()
            expect(payload.meta.preferences.send_chat_transcript).toBe(true)
        })
    })

    describe('AI Agent conditional rendering', () => {
        it('should render AI Agent cards when isAiAgentEnabled is true', () => {
            renderComponent({ isAiAgentEnabled: true })

            expect(mockChatAvailabilityCard).toHaveBeenCalled()
            expect(mockChatWaitTimeCard).toHaveBeenCalled()
            expect(mockChatAutomationCard).toHaveBeenCalled()
        })

        it('should not render AI Agent cards when isAiAgentEnabled is false', () => {
            renderComponent({ isAiAgentEnabled: false })

            expect(mockChatAvailabilityCard).not.toHaveBeenCalled()
            expect(mockChatWaitTimeCard).not.toHaveBeenCalled()
            expect(mockChatAutomationCard).not.toHaveBeenCalled()
        })

        it('should always render non-AI Agent cards regardless of isAiAgentEnabled', () => {
            renderComponent({ isAiAgentEnabled: false })

            expect(mockChatVisibilityCard).toHaveBeenCalled()
            expect(mockChatEmailCaptureCard).toHaveBeenCalled()
            expect(mockChatShopperExperienceCard).toHaveBeenCalled()
        })
    })

    describe('onSubmit', () => {
        it('should call updateOrCreateIntegration with the current form values when Save is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const { onChange } = mockChatAvailabilityCard.mock.calls[0][0]
            act(() => onChange('always-online'))

            await user.click(screen.getByRole('button', { name: 'Save' }))

            expect(mockUpdateOrCreateIntegration).toHaveBeenCalledWith(
                expect.objectContaining({
                    toJS: expect.any(Function),
                }),
            )
        })

        it('should not call submitSetting when sendCsat has not changed', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByRole('button', { name: 'Save' }))

            expect(mockSubmitSetting).not.toHaveBeenCalled()
        })

        it('should call submitSetting with updated send_survey_for_chat when sendCsat changes before save', async () => {
            const user = userEvent.setup()
            renderComponent()

            const { onSendCsatChange } =
                mockChatShopperExperienceCard.mock.calls[0][0]
            act(() => onSendCsatChange(true))

            await user.click(screen.getByRole('button', { name: 'Save' }))

            expect(mockSubmitSetting).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        send_survey_for_chat: true,
                    }),
                }),
            )
        })
    })

    describe('save button disabled state', () => {
        it('should be disabled by default', () => {
            renderComponent()

            expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
        })

        it('should become enabled after a field is changed', async () => {
            renderComponent()

            const { onChange } = mockChatAvailabilityCard.mock.calls[0][0]
            act(() => onChange('always-online'))

            expect(
                screen.getByRole('button', { name: 'Save' }),
            ).not.toBeDisabled()
        })
    })
})
