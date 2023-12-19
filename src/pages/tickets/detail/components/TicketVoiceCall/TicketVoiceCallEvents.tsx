import React from 'react'
import classNames from 'classnames'
import {useListVoiceCallEvents} from 'models/voiceCall/queries'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'
import {processEvents} from 'models/voiceCall/utils'
import {DatetimeLabel} from 'pages/common/utils/labels'
import {DateAndTimeFormatting} from 'constants/datetime'
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

    const processedEvents = processEvents(data.data.data)

    return (
        <Timeline>
            {!!processedEvents.length ? (
                processedEvents.map((event, index) => (
                    <TimelineItem key={`call-event-${index}`}>
                        <div
                            className={classNames(
                                css.row,
                                css.timelineItemContent
                            )}
                        >
                            <div
                                className={classNames(
                                    css.statusWrapper,
                                    css.inbound
                                )}
                            >
                                <div>{event.text}</div>
                                <VoiceCallAgentLabel agentId={event.userId} />
                            </div>
                            <DatetimeLabel
                                dateTime={event.datetime}
                                className={classNames('text-faded', css.date)}
                                breakDate
                                labelFormat={
                                    DateAndTimeFormatting.TimeDoubleDigitHour
                                }
                            />
                        </div>
                    </TimelineItem>
                ))
            ) : (
                <div className={css.noEventsInfo}>
                    <strong>No events:</strong> This call was either made
                    outside of business hours or there were no available agents
                    to respond
                </div>
            )}
        </Timeline>
    )
}
