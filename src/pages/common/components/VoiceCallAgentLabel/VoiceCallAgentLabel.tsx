import React from 'react'
import axios from 'axios'

import classNames from 'classnames'
import {useAgentDetails} from 'pages/tickets/detail/components/TicketVoiceCall/hooks'
import {formatPhoneNumberInternational} from 'pages/phoneNumbers/utils'

import {AgentLabel} from 'pages/common/utils/labels'
import css from './VoiceCallAgentLabel.less'

type AgentLabelProps = {
    agentId: number
    phoneNumber?: string
    className?: string
    semibold?: boolean
}

export default function VoiceCallAgentLabel({
    agentId,
    phoneNumber,
    className,
    semibold,
}: AgentLabelProps) {
    const {data: agent, error} = useAgentDetails(agentId)
    const formattedPhoneNumber = formatPhoneNumberInternational(phoneNumber)

    if (axios.isAxiosError(error) && error.response?.status === 404) {
        return (
            <AgentLabel
                name={`Deleted agent (${formattedPhoneNumber})`}
                className={classNames(css.agentLabel, className)}
            />
        )
    }

    return (
        <AgentLabel
            name={agent?.name ?? formattedPhoneNumber}
            className={classNames(css.agentLabel, className)}
            shouldDisplayAvatar={false}
            semibold={semibold}
        />
    )
}
