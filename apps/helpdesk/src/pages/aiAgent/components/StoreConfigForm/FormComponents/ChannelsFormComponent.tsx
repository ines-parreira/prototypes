import { useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { InstallationStatusInjectedChatItem } from 'pages/aiAgent/components/ChatIntegrationListSelection/ChatIntegrationListSelection'
import { ConfigurationSection } from 'pages/aiAgent/components/ConfigurationSection/ConfigurationSection'
import { HandoverCustomizationChatSettingsComponent } from 'pages/aiAgent/components/HandoverCustomization/HandoverCustomizationChatSettingsComponent'
import { SettingsBannerType } from 'pages/aiAgent/components/StoreConfigForm/constants'
import { ChannelToggleInput } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/ChannelToggleInput'
import { ChatSettingsFormComponent } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/ChatSettingsFormComponent'
import { EmailFormComponent } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/EmailFormComponent'
import { SignatureFormComponent } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/SignatureFormComponent'
import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useFetchChatIntegrationsStatusData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchChatIntegrationsStatusData'
import { FormValues, UpdateValue } from 'pages/aiAgent/types'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import { SmsSettingsFormComponent } from './SmsSettingsFormComponent'

import css from '../StoreConfigForm.less'

type Props = {
    shopName: string
    shopType: string
    updateValue: UpdateValue<FormValues>

    monitoredChatIntegrations: number[] | null
    isChatChannelEnabled: boolean
    chatChannelDeactivatedDatetime: string | null | undefined
    updateChatChannelDeactivatedDatetime: (datetime: string | null) => void

    signature: string | null
    useEmailIntegrationSignature: boolean | null
    monitoredEmailIntegrations: { id: number; email: string }[] | null
    isEmailChannelEnabled: boolean
    emailChannelDeactivatedDatetime: string | null | undefined
    updateEmailChannelDeactivatedDatetime: (datetime: string | null) => void

    monitoredSmsIntegrations: number[] | null
    smsDisclaimer: string | null
    isSmsChannelEnabled: boolean
    smsChannelDeactivatedDatetime: string | null | undefined
    updateSmsChannelDeactivatedDatetime: (datetime: string | null) => void

    setIsFormDirty: (
        element: StoreConfigFormSection,
        isFormDirty: boolean,
    ) => void

    section?: 'chat' | 'email' | 'sms' | 'all'
}

export const ChannelsFormComponent = ({
    shopName,
    shopType,
    updateValue,

    monitoredChatIntegrations,
    isChatChannelEnabled,
    chatChannelDeactivatedDatetime,
    updateChatChannelDeactivatedDatetime,

    signature,
    useEmailIntegrationSignature,
    monitoredEmailIntegrations,
    isEmailChannelEnabled,
    emailChannelDeactivatedDatetime,
    updateEmailChannelDeactivatedDatetime,

    monitoredSmsIntegrations,
    smsDisclaimer,
    isSmsChannelEnabled,
    smsChannelDeactivatedDatetime,
    updateSmsChannelDeactivatedDatetime,

    setIsFormDirty,
    section = 'all',
}: Props) => {
    const isAiAgentChatEnabled = useFlag(FeatureFlagKey.AiAgentChat)
    const isAiAgentSmsEnabled = useFlag(FeatureFlagKey.AiAgentSmsChannel)
    const aiJourneyEnabled = useFlag(FeatureFlagKey.AiJourneyEnabled)
    const isAiAgentActivationEnabled = useFlag(FeatureFlagKey.AiAgentActivation)
    const hasAiAgentNewActivationXp = useFlag(
        FeatureFlagKey.AiAgentNewActivationXp,
    )
    const isStandalone = useFlag(FeatureFlagKey.StandaloneHandoverCapabilities)

    const showToggles = !isAiAgentActivationEnabled || hasAiAgentNewActivationXp

    const { hasAccess } = useAiAgentAccess(shopName)
    const chatChannels: InstallationStatusInjectedChatItem[] =
        useSelfServiceChatChannels(shopType, shopName)

    const { routes } = useAiAgentNavigation({ shopName })

    const chatIds = useMemo(() => {
        return chatChannels.map((chat) => chat.value.id)
    }, [chatChannels])

    const {
        data: chatIntegrationStatus,
        isLoading: isChatIntegrationsStatusLoading,
    } = useFetchChatIntegrationsStatusData({
        enabled: !!chatIds.length,
        chatIds,
    })

    const chatChannelsWithAvailableFlag = useMemo(() => {
        // Block selecting the chat channels that are not installed
        const chatIntegrationStatusMap = Object.fromEntries(
            chatIntegrationStatus?.map((status) => [status.chatId, status]) ??
                [],
        )

        const availableChatsSet = new Set(
            chatChannels
                .filter(
                    (chat) =>
                        !!chatIntegrationStatusMap?.[chat.value.id]?.installed,
                )
                .map((chat) => chat.value.id),
        )
        chatChannels.forEach((chatChannel) => {
            const isAvailable = availableChatsSet.has(chatChannel.value.id)
            chatChannel.value.isUninstalled =
                !isAvailable && !isChatIntegrationsStatusLoading
        })

        return [...chatChannels]
    }, [chatChannels, chatIntegrationStatus, isChatIntegrationsStatusLoading])

    return (
        <>
            {isAiAgentChatEnabled &&
                (section === 'all' || section === 'chat') && (
                    <ConfigurationSection
                        title={''}
                        isBeta={false}
                        data-candu-id="ai-agent-configuration-chat-settings"
                    >
                        {(!isAiAgentActivationEnabled ||
                            hasAiAgentNewActivationXp) && (
                            <div className={css.sectionBlock}>
                                <ChannelToggleInput
                                    isToggled={isChatChannelEnabled}
                                    onUpdate={(isToggled) =>
                                        updateChatChannelDeactivatedDatetime(
                                            isToggled
                                                ? null
                                                : new Date().toISOString(),
                                        )
                                    }
                                    channel="chat"
                                    isDisabled={!hasAccess}
                                    deactivatedDatetime={
                                        chatChannelDeactivatedDatetime
                                    }
                                    type={SettingsBannerType.Chat}
                                />
                            </div>
                        )}
                        <div className={css.settingsSectionBlock}>
                            <ChatSettingsFormComponent
                                monitoredChatIntegrations={
                                    monitoredChatIntegrations
                                }
                                isRequired={
                                    chatChannelDeactivatedDatetime === null
                                }
                                updateValue={updateValue}
                                chatChannels={chatChannelsWithAvailableFlag}
                                dropDownWithDisabledText
                                dropDownDisabledText="Chat not installed"
                            />
                        </div>

                        <HandoverCustomizationChatSettingsComponent
                            shopName={shopName}
                            shopType={shopType}
                            monitoredChatIntegrationIds={
                                monitoredChatIntegrations
                            }
                            setIsFormDirty={setIsFormDirty}
                        />
                    </ConfigurationSection>
                )}
            {!isStandalone && (section === 'all' || section === 'email') && (
                <ConfigurationSection
                    title={''}
                    data-candu-id="ai-agent-configuration-email-settings"
                >
                    {showToggles && (
                        <div className={css.sectionBlock}>
                            <ChannelToggleInput
                                isToggled={isEmailChannelEnabled}
                                onUpdate={(isToggled) => {
                                    updateEmailChannelDeactivatedDatetime(
                                        isToggled
                                            ? null
                                            : new Date().toISOString(),
                                    )
                                }}
                                channel="email"
                                isDisabled={!hasAccess}
                                deactivatedDatetime={
                                    emailChannelDeactivatedDatetime
                                }
                                type={SettingsBannerType.Email}
                                orderManagementRoute={
                                    routes.automationOrderManagement
                                }
                                flowsRoute={routes.automationFlows}
                            />
                        </div>
                    )}
                    <EmailFormComponent
                        updateValue={updateValue}
                        monitoredEmailIntegrations={monitoredEmailIntegrations}
                        isRequired={emailChannelDeactivatedDatetime === null}
                    />
                    <SignatureFormComponent
                        isRequired={emailChannelDeactivatedDatetime === null}
                        updateValue={updateValue}
                        signature={signature}
                        useEmailIntegrationSignature={
                            useEmailIntegrationSignature
                        }
                    />
                </ConfigurationSection>
            )}

            {isAiAgentSmsEnabled &&
                (section === 'sms' || section === 'all') && (
                    <ConfigurationSection
                        title={''}
                        data-candu-id="ai-agent-configuration-sms-settings"
                    >
                        {showToggles && (
                            <div className={css.sectionBlock}>
                                <ChannelToggleInput
                                    isToggled={isSmsChannelEnabled}
                                    warningText={
                                        aiJourneyEnabled
                                            ? 'Disabling AI Agent on SMS will deactivate AI Journey. Keep AI Agent on SMS enabled to avoid disruptions.'
                                            : undefined
                                    }
                                    onUpdate={(isToggled) => {
                                        updateSmsChannelDeactivatedDatetime(
                                            isToggled
                                                ? null
                                                : new Date().toISOString(),
                                        )
                                    }}
                                    channel="sms"
                                    isDisabled={!hasAccess}
                                    deactivatedDatetime={
                                        smsChannelDeactivatedDatetime
                                    }
                                    type={SettingsBannerType.Sms}
                                />
                            </div>
                        )}

                        <div className={css.settingsSectionBlock}>
                            <SmsSettingsFormComponent
                                updateValue={updateValue}
                                monitoredSmsIntegrations={
                                    monitoredSmsIntegrations
                                }
                                smsDisclaimer={smsDisclaimer}
                                isRequired={
                                    smsChannelDeactivatedDatetime === null
                                }
                            />
                        </div>
                    </ConfigurationSection>
                )}
        </>
    )
}
