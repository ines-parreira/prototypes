import React from 'react'
import axios from 'axios'

import {useAgentDetails} from 'pages/tickets/detail/components/TicketVoiceCall/hooks'
import {formatPhoneNumberInternational} from 'pages/phoneNumbers/utils'

import {AgentLabel} from '../../utils/labels'
import css from './VoiceCallAgentLabel.less'

type AgentLabelProps = {
    agentId: number
    phoneNumber?: string
}

export default function VoiceCallAgentLabel({
    agentId,
    phoneNumber,
}: AgentLabelProps) {
    const {data: agent, error} = useAgentDetails(agentId)
    const formattedPhoneNumber = formatPhoneNumberInternational(phoneNumber)

    if (axios.isAxiosError(error) && error.response?.status === 404) {
        return (
            <AgentLabel
                name={`Deleted agent (${formattedPhoneNumber})`}
                className={css.agentLabel}
            />
        )
    }

    return (
        <AgentLabel
            name={agent?.name ?? formattedPhoneNumber}
            className={css.agentLabel}
            shouldDisplayAvatar={false}
        />
    )
}
