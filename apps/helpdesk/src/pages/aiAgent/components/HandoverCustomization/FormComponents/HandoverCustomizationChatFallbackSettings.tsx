import React, { useCallback, useEffect } from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import { GorgiasChatIntegration } from 'models/integration/types'
import { HandoverCustomizationChatFallbackSettingsFields } from 'pages/aiAgent/components/HandoverCustomization/FormComponents/HandoverCustomizationChatFallbackSettingsFields'
import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useHandoverCustomizationChatFallbackSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatFallbackSettingsForm'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'

type Props = {
    integration: GorgiasChatIntegration
}

const HandoverCustomizationChatFallbackSettings = ({ integration }: Props) => {
    const {
        formValues,
        updateValue,
        hasChanges,
        handleOnSave,
        handleOnCancel,
        isLoading,
        isSaving,
    } = useHandoverCustomizationChatFallbackSettingsForm({
        integration,
    })

    const { setIsFormDirty, setActionCallback } = useAiAgentFormChangesContext()

    const onFallbackMessageChange = useCallback(
        (value: string, selectedLanguageCode: string) => {
            updateValue('fallbackMessage', selectedLanguageCode, value)
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
            StoreConfigFormSection.handoverCustomizationFallbackSettings,
            hasChanges,
        )
    }, [hasChanges, setIsFormDirty])

    useEffect(() => {
        setActionCallback(
            StoreConfigFormSection.handoverCustomizationFallbackSettings,
            {
                onDiscard: handleOnCancel,
            },
        )
    }, [setActionCallback, handleOnCancel])

    return (
        <>
            <HandoverCustomizationChatFallbackSettingsFields
                values={formValues}
                isLoading={isLoading}
                integrationMeta={integration.meta}
                onFallbackMessageChange={onFallbackMessageChange}
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
        </>
    )
}

export default HandoverCustomizationChatFallbackSettings
