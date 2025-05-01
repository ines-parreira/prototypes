import React, { useCallback, useEffect } from 'react'

import cn from 'classnames'

import { Button, LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { GorgiasChatIntegration } from 'models/integration/types'
import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useHandoverCustomizationChatOnlineSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOnlineSettingsForm'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'

import { HandoverCustomizationChatOnlineSettingsFields } from './HandoverCustomizationChatOnlineSettingsFields'

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
            <HandoverCustomizationChatOnlineSettingsFields
                values={formValues}
                integrationId={integration.id}
                isLoading={isLoading}
                onOnlineInstructionsChange={onOnlineInstructionsChange}
                onEmailCaptureEnabledChange={onEmailCaptureEnabledChange}
                onEmailCaptureEnforcementChange={
                    onEmailCaptureEnforcementChange
                }
                onAutoResponderEnabledChange={onAutoResponderEnabledChange}
                onAutoResponderReplyChange={onAutoResponderReplyChange}
            />

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
