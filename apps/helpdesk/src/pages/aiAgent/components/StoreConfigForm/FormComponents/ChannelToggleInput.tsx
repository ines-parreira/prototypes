import { useMemo } from 'react'

import { useLocalStorage } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import _upperFirst from 'lodash/upperFirst'
import { Link } from 'react-router-dom'

import { LegacyBanner as Banner } from '@gorgias/axiom'

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
    channel: 'email' | 'chat' | 'sms'
    isDisabled?: boolean
    deactivatedDatetime?: string | null
    type: SettingsBannerType
    orderManagementRoute?: string
    flowsRoute?: string
    warningText?: string
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
    warningText,
}: Props) => {
    const [bannerAcknowledged, setBannerAcknowledged] =
        useLocalStorage<boolean>(
            `ai-settings-${type}-banner-acknowledged`,
            false,
        )

    const handleClick = () => {
        onUpdate(!isToggled)

        if (isToggled) {
            switch (channel) {
                case 'chat':
                    logEvent(SegmentEvent.AiAgentChatConfigurationDisabled)
                    break
                case 'email':
                    logEvent(SegmentEvent.AiAgentEmailConfigurationDisabled)
                    break
                case 'sms':
                    logEvent(SegmentEvent.AiAgentSmsConfigurationDisabled)
                    break
            }
        }
    }

    const subtitle = {
        [SettingsBannerType.Chat]: (
            <p>
                When shoppers message in Chat, AI Agent automatically picks up
                the ticket to respond.
            </p>
        ),
        [SettingsBannerType.Sms]: (
            <p>
                When shoppers message via SMS, AI Agent automatically picks up
                the tickets to respond.
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

    const channelName = useMemo(() => {
        return type === SettingsBannerType.Sms ? 'SMS' : _upperFirst(type)
    }, [type])

    return (
        <SettingsCard>
            <SettingsCardHeader>
                <SettingsCardTitle>
                    Enable AI Agent on {channelName}
                </SettingsCardTitle>
                {subtitle[type]}
            </SettingsCardHeader>
            <SettingsCardContent>
                {deactivatedDatetime &&
                    !bannerAcknowledged &&
                    BannerText[type] && (
                        <div data-testid="info-banner">
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

                {warningText && (
                    <div>
                        <Banner
                            variant="inline"
                            fillStyle="fill"
                            type="warning"
                        >
                            {warningText}
                        </Banner>
                    </div>
                )}
                <SettingsFeatureRow
                    title={`Enable AI Agent on ${channelName}`}
                    type="toggle"
                    isChecked={isToggled}
                    isDisabled={isDisabled}
                    onChange={handleClick}
                    toggleName={`toggle-ai-agent-${type}`}
                ></SettingsFeatureRow>
            </SettingsCardContent>
        </SettingsCard>
    )
}
