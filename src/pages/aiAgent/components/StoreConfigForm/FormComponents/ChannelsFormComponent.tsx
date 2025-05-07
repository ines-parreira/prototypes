import { Fragment } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { Link } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { ConfigurationSection } from 'pages/aiAgent/components/ConfigurationSection/ConfigurationSection'
import { HandoverCustomizationChatSettingsComponent } from 'pages/aiAgent/components/HandoverCustomization/HandoverCustomizationChatSettingsComponent'
import { SettingsBannerType } from 'pages/aiAgent/components/StoreConfigForm/constants'
import { ChannelToggleInput } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/ChannelToggleInput'
import { ChatSettingsFormComponent } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/ChatSettingsFormComponent'
import { EmailFormComponent } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/EmailFormComponent'
import { SettingsBanner } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/SettingsBanner'
import { SignatureFormComponent } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/SignatureFormComponent'
import { StoreConfigFormSection } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { FormValues, UpdateValue } from 'pages/aiAgent/types'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { getHasAutomate } from 'state/billing/selectors'

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
    monitoredEmailIntegrations: { id: number; email: string }[] | null
    isEmailChannelEnabled: boolean
    emailChannelDeactivatedDatetime: string | null | undefined
    updateEmailChannelDeactivatedDatetime: (datetime: string | null) => void

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
    monitoredEmailIntegrations,
    isEmailChannelEnabled,
    emailChannelDeactivatedDatetime,
    updateEmailChannelDeactivatedDatetime,

    setIsFormDirty,
}: Props) => {
    const isAiAgentChatEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentChat]

    const isAiAgentActivationEnabled =
        useFlags()[FeatureFlagKey.AiAgentActivation]

    const isSettingsRevampEnabled =
        useFlags()[FeatureFlagKey.AiAgentSettingsRevamp]

    const hasAutomate = useAppSelector(getHasAutomate)
    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const { routes } = useAiAgentNavigation({ shopName })

    return (
        <>
            {isAiAgentChatEnabled && (
                <ConfigurationSection
                    title={isSettingsRevampEnabled ? 'Chat' : 'Chat settings'}
                    data-candu-id="ai-agent-configuration-chat-settings"
                    isBeta={true}
                >
                    {!isSettingsRevampEnabled && (
                        <SettingsBanner
                            type={SettingsBannerType.Chat}
                            deactivatedDatetime={chatChannelDeactivatedDatetime}
                        />
                    )}
                    {!isAiAgentActivationEnabled && (
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
                            chatChannels={chatChannels}
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
                title={isSettingsRevampEnabled ? 'Email' : 'Email settings'}
                subtitle={
                    !isSettingsRevampEnabled && (
                        <Fragment>
                            When enabled, AI Agent will also handle tickets
                            created via{' '}
                            <Link to={routes.automationOrderManagement}>
                                {'Order Management'}
                            </Link>{' '}
                            and{' '}
                            <Link to={routes.automationFlows}>{'Flows'}</Link>
                        </Fragment>
                    )
                }
                data-candu-id="ai-agent-configuration-email-settings"
            >
                {!isSettingsRevampEnabled && (
                    <SettingsBanner
                        type={SettingsBannerType.Email}
                        deactivatedDatetime={emailChannelDeactivatedDatetime}
                    />
                )}
                {!isAiAgentActivationEnabled && (
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
                />
            </ConfigurationSection>
        </>
    )
}
