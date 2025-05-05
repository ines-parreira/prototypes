import React, { useCallback, useEffect } from 'react'

import cn from 'classnames'

import { Button, LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { GorgiasChatIntegration } from 'models/integration/types'
import { HandoverCustomizationChatOfflineSettingsFields } from 'pages/aiAgent/components/HandoverCustomization/FormComponents/HandoverCustomizationChatOfflineSettingsFields'
import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useHandoverCustomizationChatOfflineSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOfflineSettingsForm'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'

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
            <HandoverCustomizationChatOfflineSettingsFields
                values={formValues}
                onOfflineInstructionsChange={onOfflineInstructionsChange}
                onBusinessHoursChange={onBusinessHoursToggle}
                isLoading={isLoading || isSaving}
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

export default HandoverCustomizationChatOfflineSettings
