import { useId } from '@repo/hooks'
import { isAxiosError } from 'axios'
import classNames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { AgentLabel } from 'pages/common/utils/labels'
import { formatPhoneNumberInternational } from 'pages/phoneNumbers/utils'
import { useAgentDetails } from 'pages/tickets/detail/components/TicketVoiceCall/hooks'

import css from './VoiceCallAgentLabel.less'

type AgentLabelProps = {
    agentId: number
    phoneNumber?: string
    className?: string
    semibold?: boolean
    withTooltip?: boolean
    interactable?: boolean
}

export default function VoiceCallAgentLabel({
    agentId,
    phoneNumber,
    className,
    semibold,
    withTooltip = false,
    interactable = false,
}: AgentLabelProps) {
    const { data: agent, error } = useAgentDetails(agentId)
    const formattedPhoneNumber = formatPhoneNumberInternational(phoneNumber)
    const generatedId = useId()
    const id = `voice-call-agent-label-${generatedId}`

    if (isAxiosError(error) && error.response?.status === 404) {
        return (
            <>
                {withTooltip && (
                    <Tooltip target={id}>
                        Deleted agent ({formattedPhoneNumber})
                    </Tooltip>
                )}
                <AgentLabel
                    id={id}
                    name={`Deleted agent (${formattedPhoneNumber})`}
                    className={classNames(css.agentLabel, className)}
                />
            </>
        )
    }

    const displayedValue = agent?.name ?? formattedPhoneNumber

    return (
        <>
            {withTooltip && <Tooltip target={id}>{displayedValue}</Tooltip>}
            <AgentLabel
                id={id}
                name={displayedValue}
                className={classNames(
                    { [css.interactable]: interactable },
                    className,
                )}
                shouldDisplayAvatar={false}
                semibold={semibold}
            />
        </>
    )
}
