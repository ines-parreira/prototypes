import { useEffect, useMemo } from 'react'

import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import moment from 'moment'
import type { FieldPath, PathValue } from 'react-hook-form'
import { useForm } from 'react-hook-form'

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
import { useGorgiasChatCreationWizardContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import SaveChangesPrompt from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatCreationWizard/components/SaveChangesPrompt'
import { ChatAutomationCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationPreferences/ChatAutomationCard/ChatAutomationCard'
import { ChatAvailabilityCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationPreferences/ChatAvailabilityCard/ChatAvailabilityCard'
import { ChatEmailCaptureCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationPreferences/ChatEmailCaptureCard/ChatEmailCaptureCard'
import { ChatShopperExperienceCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationPreferences/ChatShopperExperienceCard/ChatShopperExperienceCard'
import { ChatVisibilityCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationPreferences/ChatVisibilityCard/ChatVisibilityCard'
import { ChatWaitTimeCard } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationPreferences/ChatWaitTimeCard/ChatWaitTimeCard'
import { GorgiasChatRevampLayout } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatRevampLayout'
import { submitSetting } from 'state/currentAccount/actions'
import { getSurveysSettingsJS } from 'state/currentAccount/selectors'
import { AccountSettingType } from 'state/currentAccount/types'
import type { updateOrCreateIntegration } from 'state/integrations/actions'

import css from './components/GorgiasChatIntegrationPreferences/GorgiasChatIntegrationPreferences.less'

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
    const surveysSettings = useAppSelector(getSurveysSettingsJS)
    const sendCsatGlobal = surveysSettings?.data?.send_survey_for_chat ?? false

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

    const onSubmit = (data: PreferencesFormValues) => {
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

        void (actions.updateOrCreateIntegration(
            payload,
        ) as unknown as Promise<unknown>)

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

    const { resetPreview } = useGorgiasChatCreationWizardContext()

    const onSave = handleSubmit(onSubmit)

    return (
        <>
            <SaveChangesPrompt
                when={isDirty}
                onSave={onSave}
                onDiscard={resetPreview}
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
                        {isAiAgentEnabled && (
                            <ChatAvailabilityCard
                                liveChatAvailability={
                                    values.liveChatAvailability
                                }
                                onChange={(value) =>
                                    setFieldValue('liveChatAvailability', value)
                                }
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
                        {isAiAgentEnabled && (
                            <ChatWaitTimeCard
                                autoResponderEnabled={
                                    values.autoResponderEnabled
                                }
                                autoResponderReply={values.autoResponderReply}
                                onAutoResponderEnabledChange={(value) =>
                                    setFieldValue('autoResponderEnabled', value)
                                }
                                onAutoResponderReplyChange={(value) =>
                                    setFieldValue('autoResponderReply', value)
                                }
                            />
                        )}
                        {isAiAgentEnabled && (
                            <ChatAutomationCard
                                controlTicketVolume={values.controlTicketVolume}
                                onControlTicketVolumeChange={(value) =>
                                    setFieldValue('controlTicketVolume', value)
                                }
                            />
                        )}
                        <ChatEmailCaptureCard
                            emailCaptureEnabled={values.emailCaptureEnabled}
                            emailCaptureEnforcement={
                                values.emailCaptureEnforcement
                            }
                            onEmailCaptureEnabledChange={(value) =>
                                setFieldValue('emailCaptureEnabled', value)
                            }
                            onEmailCaptureEnforcementChange={(value) =>
                                setFieldValue('emailCaptureEnforcement', value)
                            }
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
