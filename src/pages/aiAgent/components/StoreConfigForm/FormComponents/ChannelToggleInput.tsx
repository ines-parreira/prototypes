import { useMemo } from 'react'

import _upperFirst from 'lodash/upperFirst'
import { Link } from 'react-router-dom'

import { Banner } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import useLocalStorage from 'hooks/useLocalStorage'
import {
    BannerText,
    SettingsBannerType,
} from 'pages/aiAgent/components/StoreConfigForm/constants'
import { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
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
    chatIntegrations?: SelfServiceChatChannel[]
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
    chatIntegrations,
}: Props) => {
    const warningBannerData = useMemo(() => {
        if (
            type === SettingsBannerType.Chat &&
            chatIntegrations !== undefined
        ) {
            const noChatAvailable =
                chatIntegrations.every(
                    (integration) => integration.value.isDisabled,
                ) || chatIntegrations.length === 0

            if (noChatAvailable) {
                const firstUnavailableChatId = chatIntegrations[0].value.id

                return {
                    showBanner: true,
                    warning:
                        'A chat integration must be installed for this store.',
                    actionLink: `/app/settings/channels/gorgias_chat/${firstUnavailableChatId}/installation`,
                    cta: 'Install Chat',
                }
            }
        }

        return {
            showBanner: false,
            warning: '',
            actionLink: '',
            cta: '',
        }
    }, [chatIntegrations, type])

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

    return (
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
                {warningBannerData.showBanner && (
                    <div>
                        <Banner variant="inline" type="error">
                            <small>{warningBannerData.warning}</small>{' '}
                            <Link to={warningBannerData.actionLink}>
                                <small>{warningBannerData.cta}</small>{' '}
                                <i className={'warningLinkIcon material-icons'}>
                                    open_in_new
                                </i>
                            </Link>
                        </Banner>
                    </div>
                )}
                <SettingsFeatureRow
                    title={`Enable AI Agent on ${_upperFirst(type)}`}
                    type="toggle"
                    isChecked={isToggled && !warningBannerData.showBanner}
                    isDisabled={isDisabled || warningBannerData.showBanner}
                    onChange={handleClick}
                    toggleName={`toggle-ai-agent-${type}`}
                ></SettingsFeatureRow>
            </SettingsCardContent>
        </SettingsCard>
    )
}
