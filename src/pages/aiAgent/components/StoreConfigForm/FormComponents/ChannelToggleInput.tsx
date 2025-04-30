import { useFlags } from 'launchdarkly-react-client-sdk'
import _upperFirst from 'lodash/upperFirst'
import { Link } from 'react-router-dom'

import { ToggleField } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import useLocalStorage from 'hooks/useLocalStorage'
import {
    BannerText,
    SettingsBannerType,
} from 'pages/aiAgent/components/StoreConfigForm/constants'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import { SettingsFeatureRow } from 'pages/common/components/SettingsCard/SettingsFeatureRow'
import Tip from 'pages/common/components/tip/Tip'

type Props = {
    isToggled: boolean
    onUpdate: (value: boolean) => void
    channel: 'email' | 'chat'
    isDisabled?: boolean
    deactivatedDatetime?: string | null
    type: SettingsBannerType
    orderManagementRoute?: string
    flowsRoute?: string
}

export const ChannelToggleInput = ({
    isToggled,
    onUpdate,
    channel,
    isDisabled,
    deactivatedDatetime,
    type,
    orderManagementRoute,
    flowsRoute,
}: Props) => {
    const isSettingsRevampEnabled =
        useFlags()[FeatureFlagKey.AiAgentSettingsRevamp]
    const [bannerAcknowledged, setBannerAcknowledged] =
        useLocalStorage<boolean>(
            `ai-settings-${type}-banner-acknowledged`,
            false,
        )

    const handleClick = () => {
        onUpdate(!isToggled)

        if (isToggled) {
            const event =
                channel === 'chat'
                    ? SegmentEvent.AiAgentChatConfigurationDisabled
                    : SegmentEvent.AiAgentEmailConfigurationDisabled
            logEvent(event)
        }
    }

    const subtitle = {
        [SettingsBannerType.Chat]: (
            <p>
                When shoppers message in Chat, AI Agent automatically picks up
                the ticket to respond.
            </p>
        ),
        [SettingsBannerType.Email]: (
            <p>
                When enabled, AI Agent will also handle tickets created via{' '}
                {orderManagementRoute && flowsRoute ? (
                    <>
                        <Link to={orderManagementRoute}>
                            {'Order Management'}
                        </Link>{' '}
                        and <Link to={flowsRoute}>{'Flows'}</Link>.
                    </>
                ) : (
                    <>Order Management and Flows.</>
                )}
            </p>
        ),
    }

    return isSettingsRevampEnabled ? (
        <SettingsCard>
            <SettingsCardHeader>
                <SettingsCardTitle>
                    Enable AI Agent on {_upperFirst(type)}
                </SettingsCardTitle>
                {subtitle[type]}
            </SettingsCardHeader>
            <SettingsCardContent>
                {deactivatedDatetime && !bannerAcknowledged && (
                    <div>
                        <Tip
                            onClose={() => setBannerAcknowledged(true)}
                            icon={true}
                            actionLabel=""
                            storageKey={`ai-settings-${type}-banner-acknowledged`}
                        >
                            {BannerText[type]}
                        </Tip>
                    </div>
                )}
                <SettingsFeatureRow
                    title={`Enable AI Agent on ${_upperFirst(type)}`}
                    type="toggle"
                    isChecked={isToggled}
                    isDisabled={isDisabled}
                    onChange={handleClick}
                />
            </SettingsCardContent>
        </SettingsCard>
    ) : (
        <ToggleField
            value={isToggled}
            onChange={handleClick}
            name={`toggle-ai-agent-${channel}`}
            // Add new candu selectors after we define them
            dataCanduId={
                channel === 'email'
                    ? 'ai-agent-configuration-toggle'
                    : 'ai-agent-configuration-chat-toggle'
            }
            isDisabled={isDisabled}
            label="Enable AI Agent"
        />
    )
}
