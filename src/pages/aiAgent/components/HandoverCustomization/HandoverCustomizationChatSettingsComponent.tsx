import { useState } from 'react'

import cn from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { GorgiasChatIntegration } from 'models/integration/types'
import { StoreConfigDrawer } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/StoreConfigDrawer'
import { useHandoverCustomizationChatFallbackSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatFallbackSettingsForm'
import { useHandoverCustomizationChatOfflineSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOfflineSettingsForm'
import { useHandoverCustomizationChatOnlineSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOnlineSettingsForm'
import {
    HandoverCustomizationFormType,
    useHandoverCustomizationChatSettings,
} from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatSettings'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import { SettingsFeatureRow } from 'pages/common/components/SettingsCard/SettingsFeatureRow'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import HandoverCustomizationChatFallbackSettings from './FormComponents/HandoverCustomizationChatFallbackSettings'
import { HandoverCustomizationChatFallbackSettingsFields } from './FormComponents/HandoverCustomizationChatFallbackSettingsFields'
import HandoverCustomizationChatOfflineSettings from './FormComponents/HandoverCustomizationChatOfflineSettings'
import { HandoverCustomizationChatOfflineSettingsFields } from './FormComponents/HandoverCustomizationChatOfflineSettingsFields'
import HandoverCustomizationChatOnlineSettings from './FormComponents/HandoverCustomizationChatOnlineSettings'
import { HandoverCustomizationChatOnlineSettingsFields } from './FormComponents/HandoverCustomizationChatOnlineSettingsFields'

import css from './HandoverCustomizationChatSettingsComponent.less'

type Props = {
    shopName: string
    shopType: string
    monitoredChatIntegrationIds: number[] | null
}

export const HandoverCustomizationChatSettingsComponent = ({
    shopName,
    shopType,
    monitoredChatIntegrationIds,
}: Props) => {
    const isSettingsRevampEnabled =
        useFlags()[FeatureFlagKey.AiAgentSettingsRevamp]

    const {
        activeSettingsSection,
        availableChats,
        selectedChat,
        onActiveSettingsSectionChange,
        onSelectedChatChange,
        isHandoverSectionDisabled,
    } = useHandoverCustomizationChatSettings({
        shopName,
        shopType,
        monitoredChatIntegrationIds,
    })

    const {
        isLoading: isLoadingOffline,
        isSaving: isSavingOffline,
        formValues: formValuesOffline,
        updateValue: updateValueOffline,
        handleOnSave: handleOnSaveOffline,
        handleOnCancel: handleOnCancelOffline,
    } = useHandoverCustomizationChatOfflineSettingsForm({
        integration: selectedChat?.value as GorgiasChatIntegration,
    })

    const {
        isLoading: isLoadingOnline,
        isSaving: isSavingOnline,
        formValues: formValuesOnline,
        updateValue: updateValueOnline,
        handleOnSave: handleOnSaveOnline,
        handleOnCancel: handleOnCancelOnline,
    } = useHandoverCustomizationChatOnlineSettingsForm({
        integration: selectedChat?.value as GorgiasChatIntegration,
    })

    const {
        isLoading: isLoadingFallback,
        isSaving: isSavingFallback,
        formValues: formValuesFallback,
        updateValue: updateValueFallback,
        handleOnSave: handleOnSaveFallback,
        handleOnCancel: handleOnCancelFallback,
    } = useHandoverCustomizationChatFallbackSettingsForm({
        integration: selectedChat?.value as GorgiasChatIntegration,
    })

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [activeDrawerContent, setActiveDrawerContent] = useState<
        'offline' | 'online' | 'error'
    >('offline')

    const onSaveDrawer = async () => {
        await drawerContent[activeDrawerContent].onSave().then(() => {
            setIsDrawerOpen(false)
        })
    }

    const onCloseDrawer = () => {
        drawerContent[activeDrawerContent].onClose()
        setIsDrawerOpen(false)
    }

    const drawerContent = {
        offline: {
            content: selectedChat && (
                <HandoverCustomizationChatOfflineSettingsFields
                    values={formValuesOffline}
                    onOfflineInstructionsChange={(value) =>
                        updateValueOffline('offlineInstructions', value)
                    }
                    onBusinessHoursChange={(value) =>
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
            content: selectedChat && (
                <HandoverCustomizationChatOnlineSettingsFields
                    values={formValuesOnline}
                    integrationId={selectedChat.value.id}
                    isLoading={isLoadingOnline}
                    onOnlineInstructionsChange={(value) =>
                        updateValueOnline('onlineInstructions', value)
                    }
                    onEmailCaptureEnabledChange={(value) =>
                        updateValueOnline('emailCaptureEnabled', value)
                    }
                    onEmailCaptureEnforcementChange={(value) =>
                        updateValueOnline('emailCaptureEnforcement', value)
                    }
                    onAutoResponderEnabledChange={(value) =>
                        updateValueOnline('autoResponderEnabled', value)
                    }
                    onAutoResponderReplyChange={(value) =>
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
            content: selectedChat && (
                <HandoverCustomizationChatFallbackSettingsFields
                    values={formValuesFallback}
                    isLoading={isLoadingFallback}
                    integrationMeta={selectedChat.value.meta}
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
        <div>
            {!isSettingsRevampEnabled && (
                <>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div
                            className={cn(
                                'body-semibold',
                                css.handoverInstructionsTitle,
                            )}
                        >
                            Handover instructions
                        </div>
                        {availableChats && availableChats.length > 1 && (
                            <SelectField
                                id="handover-customization-chat-selection"
                                options={availableChats.map((chat) => ({
                                    label: chat.value.name,
                                    text: chat.value.name,
                                    value: chat.value.id,
                                }))}
                                icon="forum"
                                aria-label="Select chat"
                                fixedWidth
                                value={selectedChat?.value.id}
                                onChange={onSelectedChatChange}
                            />
                        )}
                    </div>
                    <div
                        id="handover-customization-accordion"
                        className={cn({
                            [css.accordionWrapperDisabled]:
                                isHandoverSectionDisabled,
                        })}
                    >
                        <Tooltip
                            target="handover-customization-accordion"
                            placement="top"
                            disabled={!isHandoverSectionDisabled}
                        >
                            {`One or more chats must be selected
                in order to view handover settings.`}
                        </Tooltip>

                        <Accordion
                            onChange={onActiveSettingsSectionChange}
                            expandedItem={activeSettingsSection}
                        >
                            <AccordionItem
                                id={
                                    HandoverCustomizationFormType.OFFLINE_SETTINGS
                                }
                                isDisabled={isHandoverSectionDisabled}
                            >
                                <AccordionHeader>
                                    <span className="body-semibold">
                                        When Chat is offline
                                    </span>
                                    <IconTooltip
                                        className={css.icon}
                                        tooltipProps={{
                                            disabled: isHandoverSectionDisabled,
                                        }}
                                    >
                                        When you have set your Chat to be always
                                        offline or when Chat is outside of
                                        business hours
                                    </IconTooltip>
                                </AccordionHeader>
                                <AccordionBody>
                                    {selectedChat && (
                                        <HandoverCustomizationChatOfflineSettings
                                            integration={selectedChat.value}
                                        />
                                    )}
                                </AccordionBody>
                            </AccordionItem>
                            <AccordionItem
                                id={
                                    HandoverCustomizationFormType.ONLINE_SETTINGS
                                }
                                isDisabled={isHandoverSectionDisabled}
                            >
                                <AccordionHeader>
                                    <div
                                        className={cn(
                                            css['accordion-header'],
                                            'd-flex align-items-center',
                                        )}
                                    >
                                        <span className="body-semibold">
                                            When Chat is online
                                        </span>
                                        <IconTooltip
                                            className={css.icon}
                                            tooltipProps={{
                                                disabled:
                                                    isHandoverSectionDisabled,
                                            }}
                                        >
                                            When you have set your Chat to be
                                            live during business hours or live
                                            when agents are available
                                        </IconTooltip>
                                    </div>
                                </AccordionHeader>
                                <AccordionBody>
                                    {selectedChat && (
                                        <HandoverCustomizationChatOnlineSettings
                                            integration={selectedChat.value}
                                        />
                                    )}
                                </AccordionBody>
                            </AccordionItem>
                            <AccordionItem
                                id={
                                    HandoverCustomizationFormType.FALLBACK_SETTINGS
                                }
                                isDisabled={isHandoverSectionDisabled}
                            >
                                <AccordionHeader>
                                    <span className="body-semibold">
                                        When an error occurs
                                    </span>
                                </AccordionHeader>
                                <AccordionBody>
                                    {selectedChat && (
                                        <HandoverCustomizationChatFallbackSettings
                                            integration={selectedChat.value}
                                        />
                                    )}
                                </AccordionBody>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </>
            )}

            {isSettingsRevampEnabled && (
                <>
                    <SettingsCard>
                        <SettingsCardHeader>
                            <SettingsCardTitle>
                                Handover instructions
                            </SettingsCardTitle>
                            AI Agent automatically hands over ticket to your
                            team whenever it lacks confidence in an answer,
                            encounters a listed handover topic, or does not find
                            any relevant knowledge to answer the shopper&apos;s
                            question. Further customize your Chat&apos;s
                            handover behavior below.
                        </SettingsCardHeader>
                        <SettingsCardContent>
                            {availableChats && availableChats.length > 1 && (
                                <SelectField
                                    id="handover-customization-chat-selection"
                                    options={availableChats.map((chat) => ({
                                        label: chat.value.name,
                                        text: chat.value.name,
                                        value: chat.value.id,
                                    }))}
                                    icon="forum"
                                    aria-label="Select chat"
                                    fixedWidth
                                    value={selectedChat?.value.id}
                                    onChange={onSelectedChatChange}
                                />
                            )}

                            <SettingsFeatureRow
                                title="When Chat is offline"
                                onClick={() => {
                                    setActiveDrawerContent('offline')
                                    setIsDrawerOpen(true)
                                }}
                            />
                            <SettingsFeatureRow
                                title="When Chat is online"
                                onClick={() => {
                                    setActiveDrawerContent('online')
                                    setIsDrawerOpen(true)
                                }}
                            />
                            <SettingsFeatureRow
                                title="When an error occurs"
                                onClick={() => {
                                    setActiveDrawerContent('error')
                                    setIsDrawerOpen(true)
                                }}
                            />
                        </SettingsCardContent>
                    </SettingsCard>

                    <StoreConfigDrawer
                        title={drawerContent[activeDrawerContent].title}
                        open={isDrawerOpen}
                        onClose={() => onCloseDrawer()}
                        onSave={() => onSaveDrawer()}
                        isLoading={drawerContent[activeDrawerContent].isLoading}
                    >
                        {drawerContent[activeDrawerContent].content}
                    </StoreConfigDrawer>
                </>
            )}
        </div>
    )
}
