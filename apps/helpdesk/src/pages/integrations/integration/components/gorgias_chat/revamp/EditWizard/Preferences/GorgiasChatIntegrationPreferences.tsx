import { useCallback, useEffect, useMemo } from 'react'

import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import moment from 'moment'
import type { FieldPath, PathValue } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import { toast } from '@gorgias/axiom'

import {
    GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT,
} from 'config/integrations/gorgias_chat'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { GorgiasChatIntegration } from 'models/integration/types'
import type { GorgiasChatAutoResponderReply } from 'models/integration/types/gorgiasChat'
import { GorgiasChatEmailCaptureType } from 'models/integration/types/gorgiasChat'
import type { SimulateConversationMessage } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/ChatPreviewPanel'
import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { GorgiasChatRevampLayout } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/GorgiasChatRevampLayout'
import SaveChangesPrompt from 'pages/integrations/integration/components/gorgias_chat/revamp/CreationWizard/components/SaveChangesPrompt'
import { ChatAutomationCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Preferences/components/ChatAutomationCard/ChatAutomationCard'
import { ChatAvailabilityCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Preferences/components/ChatAvailabilityCard/ChatAvailabilityCard'
import { ChatEmailCaptureCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Preferences/components/ChatEmailCaptureCard/ChatEmailCaptureCard'
import { ChatShopperExperienceCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Preferences/components/ChatShopperExperienceCard/ChatShopperExperienceCard'
import { ChatVisibilityCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Preferences/components/ChatVisibilityCard/ChatVisibilityCard'
import { ChatWaitTimeCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Preferences/components/ChatWaitTimeCard/ChatWaitTimeCard'
import { getCurrentConvertPlan } from 'state/billing/selectors'
import { submitSetting } from 'state/currentAccount/actions'
import { getSurveysSettingsJS } from 'state/currentAccount/selectors'
import { AccountSettingType } from 'state/currentAccount/types'
import type { updateOrCreateIntegration } from 'state/integrations/actions'
import { errorToPlainText } from 'utils'

import css from './GorgiasChatIntegrationPreferences.less'

const DEFAULT_PREVIEW_CONVERSATION: SimulateConversationMessage[] = [
    {
        text: 'Hi! How can I help you today?',
        fromAgent: true,
        isBot: true,
    },
    {
        text: 'I have a question about my order.',
        fromAgent: false,
        isBot: false,
    },
]

type Props = {
    integration: Map<string, unknown>
    actions: {
        updateOrCreateIntegration: typeof updateOrCreateIntegration
    }
    loading?: Map<string, unknown>
    isAiAgentEnabled?: boolean
}

type PreferencesFormValues = {
    liveChatAvailability: string
    displayChat: boolean
    showOutsideBusinessHours: boolean
    showOnMobile: boolean
    displayCampaignsWhenHidden: boolean
    autoResponderEnabled: boolean
    autoResponderReply: string
    controlTicketVolume: boolean
    emailCaptureEnabled: boolean
    emailCaptureEnforcement: string
    linkedEmailIntegration: number | null
    sendChatTranscript: boolean
    sendCsat: boolean
}

const buildFormValues = (
    integration: GorgiasChatIntegration,
    sendCsat: boolean,
): PreferencesFormValues => ({
    liveChatAvailability:
        integration.meta.preferences?.live_chat_availability ??
        GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    displayChat: !integration.deactivated_datetime,
    showOutsideBusinessHours:
        !integration.meta.preferences?.hide_outside_business_hours,
    showOnMobile: !integration.meta.preferences?.hide_on_mobile,
    displayCampaignsWhenHidden:
        integration.meta.preferences?.display_campaigns_hidden_chat ?? false,
    autoResponderEnabled:
        integration.meta.preferences?.auto_responder?.enabled ??
        GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    autoResponderReply:
        integration.meta.preferences?.auto_responder?.reply ??
        GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    controlTicketVolume:
        integration.meta.preferences?.control_ticket_volume ?? false,
    emailCaptureEnabled:
        integration.meta.preferences?.email_capture_enabled ??
        GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT,
    emailCaptureEnforcement:
        integration.meta.preferences?.email_capture_enforcement ??
        GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
    linkedEmailIntegration:
        integration.meta.preferences?.linked_email_integration ?? null,
    sendChatTranscript:
        integration.meta.preferences?.send_chat_transcript ?? false,
    sendCsat,
})

export const GorgiasChatIntegrationPreferencesRevamp = ({
    integration: integrationMap,
    actions,
    loading = fromJS({}),
    isAiAgentEnabled = false,
}: Props) => {
    const dispatch = useAppDispatch()
    const {
        reloadPreview,
        updateEmailCaptureSettings,
        updateAutoResponderSettings,
        updateControlTicketVolume,
        setConversationMessages,
        simulateEmailCapture,
        openChat,
        onChatPreviewLoaded,
    } = useChatPreviewPanelContext()

    const surveysSettings = useAppSelector(getSurveysSettingsJS)
    const sendCsatGlobal = surveysSettings?.data?.send_survey_for_chat ?? false
    const hasConvert = Boolean(useAppSelector(getCurrentConvertPlan))

    const integration = useMemo(
        () => integrationMap.toJS() as GorgiasChatIntegration,
        [integrationMap],
    )

    const {
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { isDirty },
    } = useForm<PreferencesFormValues>({
        defaultValues: buildFormValues(integration, sendCsatGlobal),
    })

    useEffect(() => {
        if (loading.get('integration')) {
            return
        }
        reset(buildFormValues(integration, sendCsatGlobal))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [integration])

    const setFieldValue = <K extends FieldPath<PreferencesFormValues>>(
        name: K,
        value: PathValue<PreferencesFormValues, K>,
    ) => setValue(name, value, { shouldDirty: true })

    const values = watch()
    const isSubmitting = loading.get('updateIntegration') === integration.id

    // Drives the preview navigation for the current email-capture settings.
    // We navigate explicitly from every branch rather than relying on chat-side
    // route reactivity: only RequireEmailCaptureRoute (conversation →
    // require-email-capture, when Required and the AI Agent is off) remains, so
    // transitions off the require page must be driven from here.
    const syncEmailCapturePreview = useCallback(
        (
            emailCaptureEnabled: boolean,
            emailCaptureEnforcement: GorgiasChatEmailCaptureType,
        ) => {
            // Apply settings first so the chat-side route guard sees the right
            // state when it evaluates the page.
            updateEmailCaptureSettings({
                emailCaptureEnabled,
                emailCaptureEnforcement,
            })

            if (
                emailCaptureEnabled &&
                emailCaptureEnforcement === GorgiasChatEmailCaptureType.Optional
            ) {
                // Seeds the inline form message and navigates to the chat page.
                simulateEmailCapture()
            } else if (
                emailCaptureEnabled &&
                emailCaptureEnforcement ===
                    GorgiasChatEmailCaptureType.AlwaysRequired
            ) {
                // Clear any previously-seeded transcript (e.g. the Optional
                // inline form) and navigate to the chat page. When the AI Agent
                // is off the chat-side RequireEmailCaptureRoute redirects to the
                // dedicated require-email-capture page; when it is on it stays
                // on the (now empty) conversation, which is correct production
                // behavior since required email capture never gates the agent.
                setConversationMessages([])
            } else {
                // setConversationMessages navigates to the chat page itself.
                setConversationMessages(DEFAULT_PREVIEW_CONVERSATION)
            }
        },
        [
            updateEmailCaptureSettings,
            simulateEmailCapture,
            setConversationMessages,
        ],
    )

    useEffect(() => {
        return onChatPreviewLoaded(() => {
            updateAutoResponderSettings({
                enabled: values.autoResponderEnabled,
                reply: values.autoResponderReply as GorgiasChatAutoResponderReply,
            })
            openChat()
            syncEmailCapturePreview(
                values.emailCaptureEnabled,
                values.emailCaptureEnforcement as GorgiasChatEmailCaptureType,
            )
        }, true)
    }, [
        onChatPreviewLoaded,
        openChat,
        updateAutoResponderSettings,
        syncEmailCapturePreview,
        values.emailCaptureEnabled,
        values.emailCaptureEnforcement,
        values.autoResponderEnabled,
        values.autoResponderReply,
    ])

    useEffect(() => {
        return () => {
            reloadPreview()
        }
    }, [reloadPreview])

    const onSubmit = async (data: PreferencesFormValues) => {
        const payload = fromJS({
            id: integration.id,
            deactivated_datetime: !data.displayChat
                ? (integration.deactivated_datetime ?? moment().format())
                : null,
            meta: {
                ...integration.meta,
                preferences: {
                    ...integration.meta?.preferences,
                    live_chat_availability: data.liveChatAvailability,
                    hide_outside_business_hours: !data.showOutsideBusinessHours,
                    hide_on_mobile: !data.showOnMobile,
                    display_campaigns_hidden_chat:
                        data.displayCampaignsWhenHidden,
                    auto_responder: {
                        ...integration.meta?.preferences?.auto_responder,
                        enabled: data.autoResponderEnabled,
                        reply: data.autoResponderReply,
                    },
                    control_ticket_volume: data.controlTicketVolume,
                    email_capture_enabled: data.emailCaptureEnabled,
                    email_capture_enforcement: data.emailCaptureEnforcement,
                    linked_email_integration: data.linkedEmailIntegration,
                    send_chat_transcript: data.sendChatTranscript,
                },
            },
        })

        try {
            await (actions.updateOrCreateIntegration(
                payload,
                undefined,
                undefined,
                undefined,
                true,
                undefined,
                true,
            ) as unknown as Promise<unknown>)

            toast.success('Integration successfully updated')
        } catch (error) {
            toast.error(
                errorToPlainText(error) ?? 'Failed to update integration',
            )
            return
        }

        if (surveysSettings && data.sendCsat !== sendCsatGlobal) {
            void dispatch(
                submitSetting({
                    id: surveysSettings.id,
                    type: AccountSettingType.SatisfactionSurveys,
                    data: {
                        ...surveysSettings.data,
                        send_survey_for_chat: data.sendCsat,
                    },
                }),
            )
        }
    }

    const onSave = handleSubmit(onSubmit)

    useEffect(() => {
        return onChatPreviewLoaded(() => {
            updateControlTicketVolume(values.controlTicketVolume)
        }, true)
    }, [
        onChatPreviewLoaded,
        updateControlTicketVolume,
        values.controlTicketVolume,
    ])

    return (
        <>
            <SaveChangesPrompt
                when={isDirty}
                onSave={onSave}
                onDiscard={reloadPreview}
                shouldRedirectAfterSave
            />
            <GorgiasChatRevampLayout
                integration={integrationMap}
                onSave={onSave}
                isSaving={isSubmitting}
                isSaveDisabled={!isDirty}
            >
                <div className={css.preferencesTab}>
                    <div className={css.cardsWrapper}>
                        <ChatAvailabilityCard
                            liveChatAvailability={values.liveChatAvailability}
                            onChange={(value) =>
                                setFieldValue('liveChatAvailability', value)
                            }
                            isAiAgentEnabled={isAiAgentEnabled}
                        />
                        {!isAiAgentEnabled && (
                            <ChatAutomationCard
                                controlTicketVolume={values.controlTicketVolume}
                                onControlTicketVolumeChange={(value) => {
                                    setFieldValue('controlTicketVolume', value)
                                    updateControlTicketVolume(value)
                                }}
                            />
                        )}
                        <ChatVisibilityCard
                            displayChat={values.displayChat}
                            showOutsideBusinessHours={
                                values.showOutsideBusinessHours
                            }
                            showOnMobile={values.showOnMobile}
                            displayCampaignsWhenHidden={
                                values.displayCampaignsWhenHidden
                            }
                            hasConvert={hasConvert}
                            onDisplayChatChange={(value) =>
                                setFieldValue('displayChat', value)
                            }
                            onShowOutsideBusinessHoursChange={(value) =>
                                setFieldValue('showOutsideBusinessHours', value)
                            }
                            onShowOnMobileChange={(value) =>
                                setFieldValue('showOnMobile', value)
                            }
                            onDisplayCampaignsWhenHiddenChange={(value) =>
                                setFieldValue(
                                    'displayCampaignsWhenHidden',
                                    value,
                                )
                            }
                        />
                        <ChatWaitTimeCard
                            autoResponderEnabled={values.autoResponderEnabled}
                            autoResponderReply={values.autoResponderReply}
                            onAutoResponderEnabledChange={(value) => {
                                setFieldValue('autoResponderEnabled', value)
                                updateAutoResponderSettings({ enabled: value })
                            }}
                            onAutoResponderReplyChange={(value) => {
                                setFieldValue('autoResponderReply', value)
                                updateAutoResponderSettings({
                                    reply: value as GorgiasChatAutoResponderReply,
                                })
                            }}
                        />
                        <ChatEmailCaptureCard
                            emailCaptureEnabled={values.emailCaptureEnabled}
                            emailCaptureEnforcement={
                                values.emailCaptureEnforcement
                            }
                            onEmailCaptureEnabledChange={(value) => {
                                setFieldValue('emailCaptureEnabled', value)
                                syncEmailCapturePreview(
                                    value,
                                    values.emailCaptureEnforcement as GorgiasChatEmailCaptureType,
                                )
                            }}
                            onEmailCaptureEnforcementChange={(value) => {
                                setFieldValue('emailCaptureEnforcement', value)
                                syncEmailCapturePreview(
                                    values.emailCaptureEnabled,
                                    value as GorgiasChatEmailCaptureType,
                                )
                            }}
                            isAiAgentEnabled={isAiAgentEnabled}
                        />
                        <ChatShopperExperienceCard
                            linkedEmailIntegration={
                                values.linkedEmailIntegration
                            }
                            sendChatTranscript={values.sendChatTranscript}
                            sendCsat={values.sendCsat}
                            onLinkedEmailIntegrationChange={(value) =>
                                setFieldValue('linkedEmailIntegration', value)
                            }
                            onSendChatTranscriptChange={(value) =>
                                setFieldValue('sendChatTranscript', value)
                            }
                            onSendCsatChange={(value) =>
                                setFieldValue('sendCsat', value)
                            }
                        />
                    </div>
                </div>
            </GorgiasChatRevampLayout>
        </>
    )
}
