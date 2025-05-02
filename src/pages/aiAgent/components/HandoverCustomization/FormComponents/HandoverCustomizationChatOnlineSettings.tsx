import React, { useCallback, useEffect, useMemo } from 'react'

import cn from 'classnames'

import { Button, LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { Label } from 'gorgias-design-system/Input/Label'
import { GorgiasChatIntegration } from 'models/integration/types'
import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useHandoverCustomizationChatOnlineSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOnlineSettingsForm'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'
import { formFieldsConfiguration } from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatOnlineSettingsForm.utils'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import Caption from 'pages/common/forms/Caption/Caption'
import TextArea from 'pages/common/forms/TextArea'

import ChatPreferencesAutoReplyWaitTimeSettings from './ChatPreferencesAutoReplyWaitTimeSettings'
import ChatPreferencesEmailCaptureSettings from './ChatPreferencesEmailCaptureSettings'

import commonCss from './HandoverCommonSettings.less'
import css from './HandoverCustomizationChatOnlineSettings.less'

type Props = {
    integration: GorgiasChatIntegration
}

const HandoverCustomizationChatOnlineSettings = ({ integration }: Props) => {
    const {
        isLoading,
        isSaving,
        hasChanges,
        formValues,
        updateValue,
        handleOnSave,
        handleOnCancel,
    } = useHandoverCustomizationChatOnlineSettingsForm({
        integration,
    })

    const { setIsFormDirty, setActionCallback } = useAiAgentFormChangesContext()

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

    useEffect(() => {
        setActionCallback(
            StoreConfigFormSection.handoverCustomizationOnlineSettings,
            {
                onDiscard: handleOnCancel,
            },
        )
    }, [setActionCallback, handleOnCancel])

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
            <div
                className={cn(commonCss.formContainer, css.onlineFormContainer)}
            >
                <div
                    className={cn(
                        commonCss.sectionContainer,
                        css.onlineInstructionsContainer,
                    )}
                >
                    <Label
                        htmlFor="handover-customization-online-instructions"
                        label={'Guidance'}
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
                        aria-label="Guidance"
                        value={formValues.onlineInstructions}
                        maxLength={
                            formFieldsConfiguration.onlineInstructions.maxLength
                        }
                        onChange={onOnlineInstructionsChange}
                        error={undefined}
                    />
                    <Caption className="caption-regular mt-1">
                        {`AI Agent will use these instructions to craft the handover message it sends to customers. If left blank, it will generate a generic message using your tone of voice.`}
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
                        isEnabled={formValues.emailCaptureEnabled}
                        emailCaptureEnforcement={
                            formValues.emailCaptureEnforcement
                        }
                        onToggleEnablement={onEmailCaptureEnabledChange}
                        onEmailCaptureEnforcementChange={
                            onEmailCaptureEnforcementChange
                        }
                    />
                </div>

                <div className={commonCss.sectionContainer}>
                    <ChatPreferencesAutoReplyWaitTimeSettings
                        isEnabled={formValues.autoResponderEnabled}
                        autoResponderReply={formValues.autoResponderReply}
                        onToggleEnablement={onAutoResponderEnabledChange}
                        onAutoResponderReplyChange={onAutoResponderReplyChange}
                    />
                </div>
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

export default HandoverCustomizationChatOnlineSettings
