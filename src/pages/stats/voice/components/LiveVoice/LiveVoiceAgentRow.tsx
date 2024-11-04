import {
    LiveCallQueueAgent,
    LiveCallQueueAgentCallStatusesItemStatus,
} from '@gorgias/api-queries'
import {Tooltip} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import React, {useState} from 'react'

import useInterval from 'hooks/useInterval'
import {getFormattedDurationOngoingCall} from 'models/voiceCall/utils'
import AgentCard from 'pages/common/components/AgentCard/AgentCard'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

import css from './LiveVoiceAgentsList.less'
import {getOldestCall, isAgentAvailable, isAgentBusy} from './utils'

export type Props = {
    agent: LiveCallQueueAgent
}

export default function LiveVoiceAgentRow({agent}: Props) {
    const cardProps = getCardProps(agent)
    const forwardIconId = `tooltip-forward-${agent.id}`
    const shouldDisplayForwardIcon =
        !!agent.forward_calls && !!agent.forward_when_offline
    const [timer, setTimer] = useState('')

    useInterval(() => {
        if (!cardProps.isDescriptionTimestamp) {
            return
        }

        setTimer(getFormattedDurationOngoingCall(cardProps.description ?? ''))
    }, 1000)

    return (
        <>
            <AgentCard
                name={agent.name ?? 'Unknown agent'}
                url={agent.profile_picture_url}
                {...cardProps}
                description={
                    cardProps.isDescriptionTimestamp
                        ? timer
                        : cardProps.description
                }
            />
            {shouldDisplayForwardIcon && (
                <BodyCell>
                    <i
                        id={forwardIconId}
                        className={classNames(
                            'icon material-icons',
                            css.forwardIcon
                        )}
                    >
                        phone_forwarded
                    </i>
                    <Tooltip target={forwardIconId}>
                        Forward calls while offline enabled
                    </Tooltip>
                </BodyCell>
            )}
        </>
    )
}

const getCardProps = (agent: LiveCallQueueAgent) => {
    if (isAgentBusy(agent)) {
        const oldestCall = getOldestCall(agent)
        const isCallInProgress =
            oldestCall?.status ===
            LiveCallQueueAgentCallStatusesItemStatus.InProgress
        const description = isCallInProgress
            ? oldestCall.created_datetime
            : 'Ringing'
        return {
            badgeColor: 'var(--feedback-warning)',
            description,
            isDescriptionTimestamp: isCallInProgress,
        }
    }

    if (isAgentAvailable(agent)) {
        return agent.online
            ? {badgeColor: 'var(--feedback-success)'}
            : {
                  badgeColor: 'var(--neutral-grey-4)',
                  description: 'Available while offline',
              }
    }

    return agent.online
        ? {badgeColor: 'var(--feedback-error)'}
        : {badgeColor: 'var(--neutral-grey-4)'}
}
