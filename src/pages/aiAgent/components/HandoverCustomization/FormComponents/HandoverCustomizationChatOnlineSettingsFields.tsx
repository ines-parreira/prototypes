import { useMemo } from 'react'

import cn from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { Label } from 'gorgias-design-system/Input/Label'
import { GorgiasChatEmailCaptureType } from 'models/integration/types'
import { HandoverCustomizationChatOnlineSettingsFormValues } from 'pages/aiAgent/types'
import { formFieldsConfiguration } from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatOnlineSettingsForm.utils'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import Caption from 'pages/common/forms/Caption/Caption'
import TextArea from 'pages/common/forms/TextArea'

import ChatPreferencesAutoReplyWaitTimeSettings from './ChatPreferencesAutoReplyWaitTimeSettings'
import ChatPreferencesEmailCaptureSettings from './ChatPreferencesEmailCaptureSettings'

import commonCss from './HandoverCommonSettings.less'
import css from './HandoverCustomizationChatOnlineSettings.less'

type Props = {
    values: HandoverCustomizationChatOnlineSettingsFormValues
    integrationId: number
    isLoading: boolean
    onOnlineInstructionsChange: (value: string) => void
    onEmailCaptureEnabledChange: (value: boolean) => void
    onEmailCaptureEnforcementChange: (
        enforcement: GorgiasChatEmailCaptureType,
    ) => void
    onAutoResponderEnabledChange: (value: boolean) => void
    onAutoResponderReplyChange: (value: string) => void
}

export const HandoverCustomizationChatOnlineSettingsFields = ({
    values,
    integrationId,
    isLoading,
    onOnlineInstructionsChange,
    onEmailCaptureEnabledChange,
    onEmailCaptureEnforcementChange,
    onAutoResponderEnabledChange,
    onAutoResponderReplyChange,
}: Props) => {
    const isSettingsRevampEnabled =
        useFlags()[FeatureFlagKey.AiAgentSettingsRevamp]
    const chatPreferencesLink = useMemo(
        () =>
            `/app/settings/channels/gorgias_chat/${integrationId}/preferences`,
        [integrationId],
    )

    if (isLoading) {
        return (
            <div
                className={cn(css.spinner, css.loadingContainer)}
                aria-busy="true"
                aria-label="Loading"
            >
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className={cn(commonCss.formContainer, css.onlineFormContainer)}>
            <div
                className={cn(
                    commonCss.sectionContainer,
                    css.onlineInstructionsContainer,
                )}
            >
                <Label
                    htmlFor="handover-customization-online-instructions"
                    label={
                        isSettingsRevampEnabled ? 'Instructions' : 'Guidance'
                    }
                    className={`${css.onlineInstructionsTitle} mb-2`}
                >
                    {isSettingsRevampEnabled ? 'Guidance' : 'Instructions'}
                </Label>
                <TextArea
                    id="handover-customization-online-instructions"
                    rows={5}
                    name="handover-customization-online-instructions"
                    placeholder={`Apologize and acknowledge the issue. Tell the customer that you’re connecting them with someone.`}
                    role="textbox"
                    aria-label={
                        isSettingsRevampEnabled ? 'Instructions' : 'Guidance'
                    }
                    value={values.onlineInstructions}
                    maxLength={
                        formFieldsConfiguration.onlineInstructions.maxLength
                    }
                    onChange={onOnlineInstructionsChange}
                    error={undefined}
                />
                <Caption className="caption-regular mt-1">
                    {isSettingsRevampEnabled
                        ? `Write optional instructions for AI Agent to follow during handover.
           By default, AI Agent generates a message using your tone of voice.`
                        : `AI Agent will use these instructions to craft the handover message it sends to customers. If left blank, it will generate a generic message using your tone of voice.`}
                </Caption>
            </div>

            <Alert type={AlertType.Info} icon="info">
                Changes to the settings below will be reflected in your{' '}
                <a
                    href={chatPreferencesLink}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Chat preferences.
                </a>
            </Alert>

            <div className={commonCss.sectionContainer}>
                <ChatPreferencesEmailCaptureSettings
                    isEnabled={values.emailCaptureEnabled}
                    emailCaptureEnforcement={values.emailCaptureEnforcement}
                    onToggleEnablement={onEmailCaptureEnabledChange}
                    onEmailCaptureEnforcementChange={
                        onEmailCaptureEnforcementChange
                    }
                />
            </div>

            <div className={commonCss.sectionContainer}>
                <ChatPreferencesAutoReplyWaitTimeSettings
                    isEnabled={values.autoResponderEnabled}
                    autoResponderReply={values.autoResponderReply}
                    onToggleEnablement={onAutoResponderEnabledChange}
                    onAutoResponderReplyChange={onAutoResponderReplyChange}
                />
            </div>
        </div>
    )
}
