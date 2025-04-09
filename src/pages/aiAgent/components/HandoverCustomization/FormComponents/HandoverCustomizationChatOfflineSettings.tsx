import React, { useCallback, useEffect } from 'react'

import cn from 'classnames'

import { Button, LoadingSpinner, ToggleField } from '@gorgias/merchant-ui-kit'

import { Label } from 'gorgias-design-system/Input/Label'
import { GorgiasChatIntegration } from 'models/integration/types'
import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useHandoverCustomizationChatOfflineSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOfflineSettingsForm'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'
import { formFieldsConfiguration } from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatOfflineSettingsForm.utils'
import Caption from 'pages/common/forms/Caption/Caption'
import TextArea from 'pages/common/forms/TextArea'

import css from './HandoverCustomizationChatOfflineSettings.less'

type Props = {
    integration: GorgiasChatIntegration
}

const HandoverCustomizationChatOfflineSettings = ({ integration }: Props) => {
    const {
        isLoading,
        hasChanges,
        formValues,
        updateValue,
        handleOnSave,
        handleOnCancel,
        isSaving,
    } = useHandoverCustomizationChatOfflineSettingsForm({
        integration,
    })

    const { setIsFormDirty, setActionCallback } = useAiAgentFormChangesContext()

    const onOfflineInstructionsChange = useCallback(
        (value: string) => {
            updateValue('offlineInstructions', value)
        },
        [updateValue],
    )

    const onBusinessHoursToggle = useCallback(
        (nextValue: boolean, event: React.MouseEvent<HTMLLabelElement>) => {
            event.preventDefault()
            updateValue('shareBusinessHours', nextValue)
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
            StoreConfigFormSection.handoverCustomizationOfflineSettings,
            hasChanges,
        )
    }, [hasChanges, setIsFormDirty])

    useEffect(() => {
        setActionCallback(
            StoreConfigFormSection.handoverCustomizationOfflineSettings,
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
            <div className={css.offlineInstructionsContainer}>
                <Label
                    htmlFor="handover-customization-offline-instructions"
                    label={'Offline instructions'}
                    className={`${css.offlineInstructionsTitle} mb-2`}
                >
                    Instructions
                </Label>
                <TextArea
                    id="handover-customization-offline-instructions"
                    rows={5}
                    name="handover-customization-offline-instructions"
                    aria-label="Offline instructions"
                    role="textbox"
                    maxLength={
                        formFieldsConfiguration.offlineInstructions.maxLength
                    }
                    placeholder={`Apologize and acknowledge the issue. Request the customers’ email address for our team to reach back.`}
                    onChange={onOfflineInstructionsChange}
                    value={formValues.offlineInstructions}
                    error={undefined}
                />
                <Caption className="caption-regular mt-1">
                    {`Write optional instructions for AI Agent to follow during handover. 
                    By default, AI Agent generates a message using your tone of voice.`}
                </Caption>
            </div>

            <div className="mb-5 d-flex align-items-center">
                <ToggleField
                    value={formValues.shareBusinessHours}
                    name="share-business-hours-toggle"
                    id="share-business-hours-toggle"
                    aria-label="Share business hours in handover message"
                    onChange={onBusinessHoursToggle}
                />

                <span className="body-semibold">
                    Share business hours in handover message
                </span>
                <a
                    href="/app/settings/business-hours"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(css.link, css.businessHoursLink)}
                >
                    View Business Hours
                </a>
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

export default HandoverCustomizationChatOfflineSettings
