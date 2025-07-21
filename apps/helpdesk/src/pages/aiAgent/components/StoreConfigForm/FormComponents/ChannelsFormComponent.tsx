import { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
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
import { getHasAutomate } from 'state/billing/selectors'

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
    isSmsChannelEnabled: boolean
    smsChannelDeactivatedDatetime: string | null | undefined
    updateSmsChannelDeactivatedDatetime: (datetime: string | null) => void

    setIsFormDirty: (
        element: StoreConfigFormSection,
        isFormDirty: boolean,
    ) => void
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
    isSmsChannelEnabled,
    smsChannelDeactivatedDatetime,
    updateSmsChannelDeactivatedDatetime,

    setIsFormDirty,
}: Props) => {
    const isAiAgentChatEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentChat]
    const isAiAgentSmsEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentSms]

    const isAiAgentActivationEnabled =
        !!useFlags()[FeatureFlagKey.AiAgentActivation]
    const hasAiAgentNewActivationXp =
        !!useFlags()[FeatureFlagKey.AiAgentNewActivationXp]

    const showToggles = !isAiAgentActivationEnabled || hasAiAgentNewActivationXp

    const hasAutomate = useAppSelector(getHasAutomate)
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
            {isAiAgentChatEnabled && (
                <ConfigurationSection
                    title="Chat"
                    data-candu-id="ai-agent-configuration-chat-settings"
                    isBeta={true}
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
                                isDisabled={!hasAutomate}
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
                            isRequired={chatChannelDeactivatedDatetime === null}
                            updateValue={updateValue}
                            chatChannels={chatChannelsWithAvailableFlag}
                            dropDownWithDisabledText
                            dropDownDisabledText="Chat not installed"
                        />
                    </div>

                    <HandoverCustomizationChatSettingsComponent
                        shopName={shopName}
                        shopType={shopType}
                        monitoredChatIntegrationIds={monitoredChatIntegrations}
                        setIsFormDirty={setIsFormDirty}
                    />
                </ConfigurationSection>
            )}
            <ConfigurationSection
                title="Email"
                data-candu-id="ai-agent-configuration-email-settings"
            >
                {showToggles && (
                    <div className={css.sectionBlock}>
                        <ChannelToggleInput
                            isToggled={isEmailChannelEnabled}
                            onUpdate={(isToggled) => {
                                updateEmailChannelDeactivatedDatetime(
                                    isToggled ? null : new Date().toISOString(),
                                )
                            }}
                            channel="email"
                            isDisabled={!hasAutomate}
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
                    useEmailIntegrationSignature={useEmailIntegrationSignature}
                />
            </ConfigurationSection>
            {isAiAgentSmsEnabled && (
                <ConfigurationSection
                    title="Sms for AI Journey"
                    data-candu-id="ai-agent-configuration-sms-settings"
                >
                    {showToggles && (
                        <div className={css.sectionBlock}>
                            <ChannelToggleInput
                                isToggled={isSmsChannelEnabled}
                                onUpdate={(isToggled) => {
                                    updateSmsChannelDeactivatedDatetime(
                                        isToggled
                                            ? null
                                            : new Date().toISOString(),
                                    )
                                }}
                                channel="sms"
                                isDisabled={!hasAutomate}
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
                            monitoredSmsIntegrations={monitoredSmsIntegrations}
                            isRequired={smsChannelDeactivatedDatetime === null}
                        />
                    </div>
                </ConfigurationSection>
            )}
        </>
    )
}
