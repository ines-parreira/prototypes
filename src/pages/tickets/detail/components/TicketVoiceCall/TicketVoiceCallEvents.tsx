import React from 'react'
import classNames from 'classnames'
import {useListVoiceCallEvents} from 'models/voiceCall/queries'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'
import {processEvents} from 'models/voiceCall/utils'
import Timeline from './Timeline'
import TimelineItem from './TimelineItem'

import css from './TicketVoiceCallContainer.less'

type TicketVoiceCallEventsProps = {
    callId: number
}

export default function TicketVoiceCallEvents({
    callId,
}: TicketVoiceCallEventsProps) {
    const {data, isLoading, error} = useListVoiceCallEvents({
        call_id: callId,
    })

    if (isLoading) {
        return <Skeleton height={100} />
    }

    if (!data || error) {
        return (
            <div className={css.errorStatus}>
                <strong>Failed:</strong> Call events are not available.
            </div>
        )
    }

    return (
        <Timeline>
            {processEvents(data.data.data).map((event, index) => (
                <TimelineItem key={`call-event-${index}`}>
                    <div className={classNames(css.statusWrapper, css.inbound)}>
                        <div>{event.text}</div>
                        <VoiceCallAgentLabel agentId={event.user_id} />
                    </div>
                </TimelineItem>
            ))}
        </Timeline>
    )
}
