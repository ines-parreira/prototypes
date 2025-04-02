import React, { useCallback, useEffect, useMemo } from 'react'

import cn from 'classnames'

import { Button, LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { Label } from 'gorgias-design-system/Input/Label'
import { GorgiasChatIntegration } from 'models/integration/types'
import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useHandoverCustomizationOnlineSettingsForm } from 'pages/aiAgent/hooks/useHandoverCustomizationOnlineSettingsForm'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'
import { formFieldsConfiguration } from 'pages/aiAgent/utils/handoverCustomizationOnlineSettingsForm.utils'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import Caption from 'pages/common/forms/Caption/Caption'
import TextArea from 'pages/common/forms/TextArea'

import ChatPreferencesAutoReplyWaitTimeSettings from './ChatPreferencesAutoReplyWaitTimeSettings'
import ChatPreferencesEmailCaptureSettings from './ChatPreferencesEmailCaptureSettings'

import css from './HandoverCustomizationOnlineSettings.less'

type Props = {
    integration: GorgiasChatIntegration
}

const HandoverCustomizationOnlineSettings = ({ integration }: Props) => {
    const {
        isLoading,
        isSaving,
        hasChanges,
        formValues,
        updateValue,
        handleOnSave,
        handleOnCancel,
    } = useHandoverCustomizationOnlineSettingsForm({
        integration,
    })

    const { setIsFormDirty } = useAiAgentFormChangesContext()

    const chatPreferencesLink = useMemo(
        () =>
            `/app/settings/channels/gorgias_chat/${integration.id}/preferences`,
        [integration],
    )

    const onOnlineInstructionsChange = useCallback(
        (value: string) => {
            updateValue('onlineInstructions', value)
        },
        [updateValue],
    )

    const onEmailCaptureEnabledChange = useCallback(
        (value: boolean) => {
            updateValue('emailCaptureEnabled', value)
        },
        [updateValue],
    )

    const onEmailCaptureEnforcementChange = useCallback(
        (value: string) => {
            updateValue('emailCaptureEnforcement', value)
        },
        [updateValue],
    )

    const onAutoResponderEnabledChange = useCallback(
        (value: boolean) => {
            updateValue('autoResponderEnabled', value)
        },
        [updateValue],
    )

    const onAutoResponderReplyChange = useCallback(
        (value: string) => {
            updateValue('autoResponderReply', value)
        },
        [updateValue],
    )

    const onSave = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()
            handleOnSave()
        },
        [handleOnSave],
    )

    const onCancel = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()
            handleOnCancel()
        },
        [handleOnCancel],
    )

    useEffect(() => {
        setIsFormDirty(
            StoreConfigFormSection.handoverCustomizationOnlineSettings,
            hasChanges,
        )
    }, [hasChanges, setIsFormDirty])

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
        <div>
            <div className={css.onlineInstructionsContainer}>
                <Label
                    htmlFor="handover-customization-online-instructions"
                    label={'Online instructions'}
                    className={`${css.onlineInstructionsTitle} mb-2`}
                >
                    Instructions
                </Label>
                <TextArea
                    id="handover-customization-online-instructions"
                    rows={5}
                    name="handover-customization-online-instructions"
                    placeholder={`Apologize and acknowledge the issue. Tell the customer that you’re connecting them with someone.`}
                    role="textbox"
                    aria-label="Online instructions"
                    value={formValues.onlineInstructions}
                    maxLength={
                        formFieldsConfiguration.onlineInstructions.maxLength
                    }
                    onChange={onOnlineInstructionsChange}
                    error={undefined}
                />
                <Caption className="caption-regular mt-1">
                    Write optional instructions for AI Agent to follow during
                    handover. AI Agent will match your tone of voice. By
                    default, it sends a fixed message based on your settings:
                    ie.{' '}
                    <i>
                        “Thanks for reaching out! We will be with you in 5
                        minutes.”
                    </i>
                </Caption>
            </div>
            <Alert type={AlertType.Info} icon="info" className="mb-4">
                Changes to the settings below will be reflected in your{' '}
                <a
                    href={chatPreferencesLink}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Chat preferences.
                </a>
            </Alert>
            <div className={css.emailCaptureSettingContainer}>
                <ChatPreferencesEmailCaptureSettings
                    isEnabled={formValues.emailCaptureEnabled}
                    emailCaptureEnforcement={formValues.emailCaptureEnforcement}
                    onToggleEnablement={onEmailCaptureEnabledChange}
                    onEmailCaptureEnforcementChange={
                        onEmailCaptureEnforcementChange
                    }
                />
            </div>
            <div className={css.autoReplyWaitTimeSettingsContainer}>
                <ChatPreferencesAutoReplyWaitTimeSettings
                    isEnabled={formValues.autoResponderEnabled}
                    autoResponderReply={formValues.autoResponderReply}
                    onToggleEnablement={onAutoResponderEnabledChange}
                    onAutoResponderReplyChange={onAutoResponderReplyChange}
                />
            </div>

            <section className="mb-0">
                <Button
                    type="submit"
                    color="primary"
                    className="mr-2"
                    size="small"
                    onClick={onSave}
                    isDisabled={isSaving}
                >
                    Save Changes
                </Button>

                <Button
                    intent="secondary"
                    color="secondary"
                    size="small"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            </section>
        </div>
    )
}

export default HandoverCustomizationOnlineSettings
