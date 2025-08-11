import { useMemo } from 'react'

import cn from 'classnames'

import { LoadingSpinner } from '@gorgias/axiom'

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
                    label="Instructions"
                    className={`${css.onlineInstructionsTitle} mb-2`}
                >
                    Guidance
                </Label>
                <TextArea
                    id="handover-customization-online-instructions"
                    rows={5}
                    name="handover-customization-online-instructions"
                    placeholder={`Apologize and acknowledge the issue. Tell the customer that you’re connecting them with someone.`}
                    role="textbox"
                    aria-label="Instructions"
                    value={values.onlineInstructions}
                    maxLength={
                        formFieldsConfiguration.onlineInstructions.maxLength
                    }
                    onChange={onOnlineInstructionsChange}
                    error={undefined}
                />
                <Caption className="caption-regular mt-1">
                    Write optional instructions for AI Agent to follow during
                    handover. By default, AI Agent generates a message using
                    your tone of voice.
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
