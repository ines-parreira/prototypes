import React, { useCallback, useEffect, useState } from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import { getPrimaryLanguageFromChatConfig } from 'config/integrations/gorgias_chat'
import useUpdateEffect from 'hooks/useUpdateEffect'
import { GorgiasChatIntegration } from 'models/integration/types'
import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useHandoverCustomizationChatFallbackSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatFallbackSettingsForm'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'

import { HandoverCustomizationChatFallbackSettingsFields } from './HandoverCustomizationChatFallbackSettingsFields'

type Props = {
    integration: GorgiasChatIntegration
}

const HandoverCustomizationChatFallbackSettings = ({ integration }: Props) => {
    const [selectedLanguageCode, setSelectedLanguageCode] = useState(
        getPrimaryLanguageFromChatConfig(integration.meta),
    )

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
        (value: string) => {
            updateValue('fallbackMessage', selectedLanguageCode, value)
        },
        [updateValue, selectedLanguageCode],
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

    useUpdateEffect(() => {
        setSelectedLanguageCode(
            getPrimaryLanguageFromChatConfig(integration.meta),
        )
    }, [integration])

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
