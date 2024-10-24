import {Map} from 'immutable'

import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useState} from 'react'
import {useHistory} from 'react-router-dom'

import {TicketChannel} from 'business/types/ticket'

import {SegmentEvent, logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import AutomateSubscriptionButton from 'pages/settings/billing/automate/AutomateSubscriptionButton'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'
import {getHasAutomate} from 'state/billing/selectors'

import css from './GorgiasChatIntegrationConnectedChannel.less'

type Props = {
    integration: Map<any, any>
}

const GorgiasChatIntegrationConnectedChannel = ({integration}: Props) => {
    const history = useHistory()
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    const hasAutomate = useAppSelector(getHasAutomate)
    const integrationId = integration.get('id') as string
    const shopName = integration.getIn(['meta', 'shop_name']) as string | null
    const shopType = integration.getIn(['meta', 'shop_type']) as string | null

    const newChannelsView = useFlags()[FeatureFlagKey.NewChannelsView]
    const changeAutomateSettingButtomPosition =
        useFlags()[FeatureFlagKey.ChangeAutomateSettingButtomPosition]

    const logChatEvent = (version: string) => {
        if (!changeAutomateSettingButtomPosition) return
        logEvent(SegmentEvent.AutomateSettingButtonClicked, {
            channel: TicketChannel.Chat,
            version,
        })
    }

    if (!hasAutomate) {
        return (
            <>
                <AutomateSubscriptionButton
                    className={css.automationSubscriptionButton}
                    fillStyle="ghost"
                    label={
                        changeAutomateSettingButtomPosition
                            ? 'Upgrade to Automate'
                            : 'Upgrade your chat with automate'
                    }
                    onClick={() => {
                        logChatEvent('Upsell')
                        setIsAutomationModalOpened(true)
                    }}
                />
                <AutomateSubscriptionModal
                    confirmLabel="Subscribe"
                    isOpen={isAutomationModalOpened}
                    onClose={() => {
                        setIsAutomationModalOpened(false)
                    }}
                />
            </>
        )
    }
    if (newChannelsView) return null

    if (!shopName || !shopType) {
        return (
            <Button
                fillStyle="ghost"
                intent="primary"
                onClick={() => {
                    logChatEvent('Store'),
                        history.push(
                            `/app/settings/channels/gorgias_chat/${integrationId}/installation`
                        )
                }}
            >
                <ButtonIconLabel
                    icon="warning"
                    className={css.connectStoreWarning}
                >
                    {changeAutomateSettingButtomPosition
                        ? 'Connect Store'
                        : 'Connect store to enable Automate'}
                </ButtonIconLabel>
            </Button>
        )
    }

    return (
        <Button
            fillStyle="ghost"
            intent="primary"
            onClick={() => {
                logChatEvent('Setting')
                history.push(
                    `/app/automation/${shopType}/${shopName}/connected-channels?type=${TicketChannel.Chat}&id=${integrationId}`,
                    {from: 'chat-integration'}
                )
            }}
        >
            <ButtonIconLabel icon="bolt">
                {changeAutomateSettingButtomPosition
                    ? 'Automate Settings'
                    : 'Go to Automate settings'}
            </ButtonIconLabel>
        </Button>
    )
}

export default GorgiasChatIntegrationConnectedChannel
