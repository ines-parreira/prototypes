import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {Fragment} from 'react'
import {Link} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'

import useAppSelector from 'hooks/useAppSelector'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import {getHasAutomate} from 'state/billing/selectors'

import {FormValues, UpdateValue} from '../../../types'
import {ConfigurationSection} from '../../ConfigurationSection/ConfigurationSection'
import {SettingsBannerType} from '../constants'
import css from '../StoreConfigForm.less'
import {ChannelToggleInput} from './ChannelToggleInput'
import {ChatSettingsFormComponent} from './ChatSettingsFormComponent'
import {EmailFormComponent} from './EmailFormComponent'
import {SettingsBanner} from './SettingsBanner'
import {SignatureFormComponent} from './SignatureFormComponent'

type Props = {
    shopName: string
    shopType: string
    updateValue: UpdateValue<FormValues>

    monitoredChatIntegrations: number[] | null
    isChatChannelEnabled: boolean
    chatChannelDeactivatedDatetime: string | null | undefined
    updateChatChannelDeactivatedDatetime: (datetime: string | null) => void

    signature: string | null
    monitoredEmailIntegrations: {id: number; email: string}[] | null
    isEmailChannelEnabled: boolean
    emailChannelDeactivatedDatetime: string | null | undefined
    updateEmailChannelDeactivatedDatetime: (datetime: string | null) => void
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
}: Props) => {
    const isAiAgentChatEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentChat]

    const hasAutomate = useAppSelector(getHasAutomate)
    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const {routes} = useAiAgentNavigation({shopName})

    return (
        <>
            {isAiAgentChatEnabled && (
                <ConfigurationSection
                    title="Chat settings"
                    data-candu-id="ai-agent-configuration-chat-settings"
                    isBeta={true}
                >
                    <SettingsBanner
                        type={SettingsBannerType.Chat}
                        deactivatedDatetime={chatChannelDeactivatedDatetime}
                    />
                    <div className={css.sectionBlock}>
                        <ChannelToggleInput
                            isToggled={isChatChannelEnabled}
                            onUpdate={(isToggled) =>
                                updateChatChannelDeactivatedDatetime(
                                    isToggled ? null : new Date().toISOString()
                                )
                            }
                            channel="chat"
                            isDisabled={!hasAutomate}
                        />
                    </div>

                    <ChatSettingsFormComponent
                        monitoredChatIntegrations={monitoredChatIntegrations}
                        isRequired={chatChannelDeactivatedDatetime === null}
                        updateValue={updateValue}
                        chatChannels={chatChannels}
                    />
                </ConfigurationSection>
            )}
            <ConfigurationSection
                title="Email settings"
                subtitle={
                    <Fragment>
                        When enabled, AI Agent will also handle tickets created
                        via{' '}
                        <Link to={routes.automationOrderManagement}>
                            {'Order Management'}
                        </Link>{' '}
                        and <Link to={routes.automationFlows}>{'Flows'}</Link>
                    </Fragment>
                }
                data-candu-id="ai-agent-configuration-email-settings"
            >
                <SettingsBanner
                    type={SettingsBannerType.Email}
                    deactivatedDatetime={emailChannelDeactivatedDatetime}
                />
                <div className={css.sectionBlock}>
                    <ChannelToggleInput
                        isToggled={isEmailChannelEnabled}
                        onUpdate={(isToggled) => {
                            updateEmailChannelDeactivatedDatetime(
                                isToggled ? null : new Date().toISOString()
                            )
                        }}
                        channel="email"
                        isDisabled={!hasAutomate}
                    />
                </div>

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
