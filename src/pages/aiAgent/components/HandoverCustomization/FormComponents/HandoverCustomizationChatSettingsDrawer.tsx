import {
    GorgiasChatEmailCaptureType,
    GorgiasChatIntegration,
} from 'models/integration/types'
import { HandoverCustomizationChatFallbackSettingsFields } from 'pages/aiAgent/components/HandoverCustomization/FormComponents/HandoverCustomizationChatFallbackSettingsFields'
import { HandoverCustomizationChatOfflineSettingsFields } from 'pages/aiAgent/components/HandoverCustomization/FormComponents/HandoverCustomizationChatOfflineSettingsFields'
import { HandoverCustomizationChatOnlineSettingsFields } from 'pages/aiAgent/components/HandoverCustomization/FormComponents/HandoverCustomizationChatOnlineSettingsFields'
import { StoreConfigDrawer } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/StoreConfigDrawer'
import { useHandoverCustomizationChatFallbackSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatFallbackSettingsForm'
import { useHandoverCustomizationChatOfflineSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOfflineSettingsForm'
import { useHandoverCustomizationChatOnlineSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOnlineSettingsForm'

export type HandoverCustomizationChatSettingsDrawerContent =
    | 'offline'
    | 'online'
    | 'error'
export type HandoverCustomizationChatSettingsDrawerProps = {
    integration: GorgiasChatIntegration
    activeContent: HandoverCustomizationChatSettingsDrawerContent
    open: boolean
    onClose: () => void
}

const HandoverCustomizationChatSettingsDrawer = ({
    integration,
    open,
    activeContent,
    onClose,
}: HandoverCustomizationChatSettingsDrawerProps) => {
    const {
        isLoading: isLoadingOffline,
        isSaving: isSavingOffline,
        formValues: formValuesOffline,
        updateValue: updateValueOffline,
        handleOnSave: handleOnSaveOffline,
        handleOnCancel: handleOnCancelOffline,
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
    } = useHandoverCustomizationChatFallbackSettingsForm({
        integration,
    })

    const onSaveDrawer = async () => {
        await drawerContent[activeContent].onSave().then(() => {
            onClose()
        })
    }

    const onCloseDrawer = () => {
        drawerContent[activeContent].onClose()
        onClose()
    }

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

    return (
        <StoreConfigDrawer
            title={drawerContent[activeContent].title}
            open={open}
            onClose={() => onCloseDrawer()}
            onSave={() => onSaveDrawer()}
            isLoading={drawerContent[activeContent].isLoading}
        >
            {drawerContent[activeContent].content}
        </StoreConfigDrawer>
    )
}

export default HandoverCustomizationChatSettingsDrawer
