import { useState } from 'react'

import type {
    GorgiasChatEmailCaptureType,
    GorgiasChatIntegration,
} from 'models/integration/types'
import { HandoverCustomizationChatFallbackSettingsFields } from 'pages/aiAgent/components/HandoverCustomization/FormComponents/HandoverCustomizationChatFallbackSettingsFields'
import { HandoverCustomizationChatOfflineSettingsFields } from 'pages/aiAgent/components/HandoverCustomization/FormComponents/HandoverCustomizationChatOfflineSettingsFields'
import { HandoverCustomizationChatOnlineSettingsFields } from 'pages/aiAgent/components/HandoverCustomization/FormComponents/HandoverCustomizationChatOnlineSettingsFields'
import { StoreConfigDrawer } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/StoreConfigDrawer'
import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useHandoverCustomizationChatFallbackSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatFallbackSettingsForm'
import { useHandoverCustomizationChatOfflineSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOfflineSettingsForm'
import { useHandoverCustomizationChatOnlineSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOnlineSettingsForm'
import UnsavedChangesModal from 'pages/common/components/UnsavedChangesModal'

export type HandoverCustomizationChatSettingsDrawerContent =
    | 'offline'
    | 'online'
    | 'error'
export type HandoverCustomizationChatSettingsDrawerProps = {
    integration: GorgiasChatIntegration
    activeContent: HandoverCustomizationChatSettingsDrawerContent
    open: boolean
    onClose: () => void
    setIsFormDirty: (
        element: StoreConfigFormSection,
        isFormDirty: boolean,
    ) => void
}

const HandoverCustomizationChatSettingsDrawer = ({
    integration,
    open,
    activeContent,
    onClose,
    setIsFormDirty,
}: HandoverCustomizationChatSettingsDrawerProps) => {
    const {
        isLoading: isLoadingOffline,
        isSaving: isSavingOffline,
        formValues: formValuesOffline,
        updateValue: updateValueOffline,
        handleOnSave: handleOnSaveOffline,
        handleOnCancel: handleOnCancelOffline,
        hasChanges: hasChangesOffline,
    } = useHandoverCustomizationChatOfflineSettingsForm({
        integration,
    })

    const {
        isLoading: isLoadingOnline,
        isSaving: isSavingOnline,
        formValues: formValuesOnline,
        updateValue: updateValueOnline,
        handleOnSave: handleOnSaveOnline,
        handleOnCancel: handleOnCancelOnline,
        hasChanges: hasChangesOnline,
    } = useHandoverCustomizationChatOnlineSettingsForm({
        integration,
    })

    const {
        isLoading: isLoadingFallback,
        isSaving: isSavingFallback,
        formValues: formValuesFallback,
        updateValue: updateValueFallback,
        handleOnSave: handleOnSaveFallback,
        handleOnCancel: handleOnCancelFallback,
        hasChanges: hasChangesFallback,
    } = useHandoverCustomizationChatFallbackSettingsForm({
        integration,
    })

    const drawerContent = {
        offline: {
            content: integration && (
                <HandoverCustomizationChatOfflineSettingsFields
                    values={formValuesOffline}
                    onOfflineInstructionsChange={(value: string) =>
                        updateValueOffline('offlineInstructions', value)
                    }
                    onBusinessHoursChange={(value: boolean) =>
                        updateValueOffline('shareBusinessHours', value)
                    }
                    isLoading={isLoadingOffline}
                />
            ),
            title: 'When Chat is offline',
            onClose: handleOnCancelOffline,
            onSave: handleOnSaveOffline,
            isLoading: isLoadingOffline || isSavingOffline,
        },
        online: {
            content: integration && (
                <HandoverCustomizationChatOnlineSettingsFields
                    values={formValuesOnline}
                    integrationId={integration.id}
                    isLoading={isLoadingOnline}
                    onOnlineInstructionsChange={(value: string) =>
                        updateValueOnline('onlineInstructions', value)
                    }
                    onEmailCaptureEnabledChange={(value: boolean) =>
                        updateValueOnline('emailCaptureEnabled', value)
                    }
                    onEmailCaptureEnforcementChange={(
                        value: GorgiasChatEmailCaptureType,
                    ) => updateValueOnline('emailCaptureEnforcement', value)}
                    onAutoResponderEnabledChange={(value: boolean) =>
                        updateValueOnline('autoResponderEnabled', value)
                    }
                    onAutoResponderReplyChange={(value: string) =>
                        updateValueOnline('autoResponderReply', value)
                    }
                />
            ),
            title: 'When Chat is online',
            onClose: handleOnCancelOnline,
            onSave: handleOnSaveOnline,
            isLoading: isLoadingOnline || isSavingOnline,
        },
        error: {
            content: integration && (
                <HandoverCustomizationChatFallbackSettingsFields
                    values={formValuesFallback}
                    isLoading={isLoadingFallback}
                    integrationMeta={integration.meta}
                    onFallbackMessageChange={(
                        value: string,
                        language: string,
                    ) =>
                        updateValueFallback('fallbackMessage', language, value)
                    }
                />
            ),
            title: 'When an error occurs',
            onClose: handleOnCancelFallback,
            onSave: handleOnSaveFallback,
            isLoading: isLoadingFallback || isSavingFallback,
        },
    }

    const [isDrawerDirty, setIsDrawerDirty] = useState(false)

    const onSaveDrawer = async () => {
        try {
            await drawerContent[activeContent].onSave()
            setIsDrawerDirty(false)
            setIsFormDirty(StoreConfigFormSection.channelSettings, false)
            onClose()
        } catch {}
    }

    const onCloseDrawer = () => {
        let hasChanges = false

        switch (activeContent) {
            case 'offline':
                if (hasChangesOffline) {
                    hasChanges = true
                }
                break
            case 'online':
                if (hasChangesOnline) {
                    hasChanges = true
                }
                break
            case 'error':
                if (hasChangesFallback) {
                    hasChanges = true
                }
                break
        }

        if (hasChanges) {
            setIsDrawerDirty(true)
        } else {
            drawerContent[activeContent].onClose()
            onClose()
        }
    }

    const onHandleDiscardUnsavedChanges = () => {
        setIsDrawerDirty(false)
        setIsFormDirty(StoreConfigFormSection.channelSettings, false)
        onClose()

        switch (activeContent) {
            case 'online':
                handleOnCancelOnline()
                break
            case 'offline':
                handleOnCancelOffline()
                break
            case 'error':
                handleOnCancelFallback()
                break
        }
    }

    return (
        <>
            <StoreConfigDrawer
                title={drawerContent[activeContent].title}
                open={open}
                onClose={onHandleDiscardUnsavedChanges}
                onSave={onSaveDrawer}
                onBackdropClick={onCloseDrawer}
                isLoading={drawerContent[activeContent].isLoading}
            >
                {drawerContent[activeContent].content}
            </StoreConfigDrawer>
            <UnsavedChangesModal
                onDiscard={onHandleDiscardUnsavedChanges}
                isOpen={isDrawerDirty}
                onClose={() => setIsDrawerDirty(false)}
                onSave={onSaveDrawer}
            />
        </>
    )
}

export default HandoverCustomizationChatSettingsDrawer
