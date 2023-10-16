import React, {useState} from 'react'
import {Map} from 'immutable'
import {useHistory} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import AutomationSubscriptionButton from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionButton'
import AutomationSubscriptionModal from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionModal'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {TicketChannel} from 'business/types/ticket'

import css from './GorgiasChatIntegrationConnectedChannel.less'

type Props = {
    integration: Map<any, any>
}

const GorgiasChatIntegrationConnectedChannel = ({integration}: Props) => {
    const history = useHistory()
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const integrationId = integration.get('id') as string
    const shopName = integration.getIn(['meta', 'shop_name']) as string | null
    const shopType = integration.getIn(['meta', 'shop_type']) as string | null

    if (!hasAutomationAddOn) {
        return (
            <>
                <AutomationSubscriptionButton
                    className={css.automationSubscriptionButton}
                    fillStyle="ghost"
                    label="Get Automation Add-on Features"
                    onClick={() => {
                        setIsAutomationModalOpened(true)
                    }}
                />
                <AutomationSubscriptionModal
                    confirmLabel="Confirm"
                    isOpen={isAutomationModalOpened}
                    onClose={() => setIsAutomationModalOpened(false)}
                />
            </>
        )
    }

    if (!shopName || !shopType) {
        return (
            <Button
                fillStyle="ghost"
                intent="primary"
                onClick={() => {
                    history.push(
                        `/app/settings/channels/gorgias_chat/${integrationId}/installation`
                    )
                }}
            >
                <ButtonIconLabel
                    icon="warning"
                    className={css.connectStoreWarning}
                >
                    Connect store to enable automation
                </ButtonIconLabel>
            </Button>
        )
    }

    return (
        <Button
            fillStyle="ghost"
            intent="primary"
            onClick={() => {
                history.push(
                    `/app/automation/${shopType}/${shopName}/connected-channels?type=${TicketChannel.Chat}&id=${integrationId}`
                )
            }}
        >
            <ButtonIconLabel icon="bolt">
                Edit automation settings
            </ButtonIconLabel>
        </Button>
    )
}

export default GorgiasChatIntegrationConnectedChannel
