import classNames from 'classnames'

import { VoiceCallTerminationStatus } from '@gorgias/helpdesk-queries'
import { Skeleton } from '@gorgias/merchant-ui-kit'

import { DateAndTimeFormatting } from 'constants/datetime'
import { useListVoiceCallEvents } from 'models/voiceCall/queries'
import { processEvents } from 'models/voiceCall/utils'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'
import VoiceCallCustomerLabel from 'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import Timeline from './Timeline'
import TimelineItem from './TimelineItem'

import css from './TicketVoiceCallContainer.less'

type TicketVoiceCallEventsProps = {
    callId: number
    terminationStatus?: VoiceCallTerminationStatus
}

export default function TicketVoiceCallEvents({
    callId,
    terminationStatus,
}: TicketVoiceCallEventsProps) {
    const { data, isLoading, error } = useListVoiceCallEvents({
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

    if (!processedEvents.length) {
        if (
            terminationStatus === VoiceCallTerminationStatus.Abandoned ||
            terminationStatus === VoiceCallTerminationStatus.Cancelled
        ) {
            return (
                <Timeline>
                    <div className={css.noEventsInfo}>
                        No events. The caller ended the call while waiting,
                        before reaching an available agent.
                    </div>
                </Timeline>
            )
        }

        return (
            <Timeline>
                <div className={css.noEventsInfo}>
                    No events. This call was either made outside business hours
                    or ended due to no available agents.
                </div>
            </Timeline>
        )
    }

    return (
        <Timeline>
            {processedEvents.map((event, index) => (
                <TimelineItem key={`call-event-${index}`}>
                    <div
                        className={classNames(css.row, css.timelineItemContent)}
                    >
                        <div
                            className={classNames(
                                css.statusWrapper,
                                css.inbound,
                            )}
                        >
                            <div>{event.text}</div>
                            {event.userId && (
                                <VoiceCallAgentLabel agentId={event.userId} />
                            )}
                            {event.customerId && (
                                <VoiceCallCustomerLabel
                                    customerId={event.customerId}
                                    phoneNumber={'customer'}
                                />
                            )}
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
            ))}
        </Timeline>
    )
}
