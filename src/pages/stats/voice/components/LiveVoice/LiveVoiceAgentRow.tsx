import { useState } from 'react'

import classNames from 'classnames'

import { LiveCallQueueAgent } from '@gorgias/api-queries'
import { Tooltip } from '@gorgias/merchant-ui-kit'

import useInterval from 'hooks/useInterval'
import { getFormattedDurationOngoingCall } from 'models/voiceCall/utils'
import AgentCard from 'pages/common/components/AgentCard/AgentCard'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

import { isAgentAvailable, isAgentBusy, mapBusyAgentStatus } from './utils'

import css from './LiveVoiceAgentsList.less'

type Props = {
    agent: LiveCallQueueAgent
}

export default function LiveVoiceAgentRow({ agent }: Props) {
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
                            css.forwardIcon,
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
        const mappedStatus = mapBusyAgentStatus(agent)

        return {
            badgeColor: 'var(--feedback-warning)',
            description: mappedStatus.description,
            isDescriptionTimestamp: mappedStatus.isDescriptionTimestamp,
        }
    }

    if (isAgentAvailable(agent)) {
        return agent.online
            ? { badgeColor: 'var(--feedback-success)' }
            : {
                  badgeColor: 'var(--neutral-grey-4)',
                  description: 'Available while offline',
              }
    }

    return agent.online
        ? { badgeColor: 'var(--feedback-error)' }
        : { badgeColor: 'var(--neutral-grey-4)' }
}
