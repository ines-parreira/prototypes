import { FeatureFlagKey } from '@repo/feature-flags'
import classNames from 'classnames'
import _capitalize from 'lodash/capitalize'

import { Skeleton } from '@gorgias/axiom'
import { VoiceCallTerminationStatus } from '@gorgias/helpdesk-queries'

import { DateAndTimeFormatting } from 'constants/datetime'
import { useFlag } from 'core/flags'
import { ProcessedEvent, processEvents } from 'models/voiceCall/processEvents'
import { useListVoiceCallEvents } from 'models/voiceCall/queries'
import VoiceCallSubjectLabel from 'pages/common/components/VoiceCallSubjectLabel/VoiceCallSubjectLabel'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import DEPRECATED_TicketVoiceCallEvents from 'pages/tickets/detail/components/TicketVoiceCall/DEPRECATED_TicketVoiceCallEvents'

import Timeline from './Timeline'
import TimelineItem from './TimelineItem'

import css from './TicketVoiceCallContainer.less'

type TicketVoiceCallEventsProps = {
    callId: number
    terminationStatus?: VoiceCallTerminationStatus
}

const TicketVoiceCallEvents = ({
    callId,
    terminationStatus,
}: TicketVoiceCallEventsProps) => {
    const isTransferToExternalNumberEnabled = useFlag(
        FeatureFlagKey.TransferCallToExternalNumber,
    )

    if (!isTransferToExternalNumberEnabled) {
        return (
            <DEPRECATED_TicketVoiceCallEvents
                callId={callId}
                terminationStatus={terminationStatus}
            />
        )
    }

    return (
        <NewTicketVoiceCallEvents
            callId={callId}
            terminationStatus={terminationStatus}
        />
    )
}

const NewTicketVoiceCallEvents = ({
    callId,
    terminationStatus,
}: TicketVoiceCallEventsProps) => {
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

    const getActionPrettyName = (event: ProcessedEvent) => {
        if (event.showTransferPrefix) {
            return `Transfer ${event.action}`
        }
        return _capitalize(event.action)
    }

    return (
        <Timeline useFullWidth>
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
                            <span>{getActionPrettyName(event)}</span>
                            {event.actor && (
                                <>
                                    <span> by </span>
                                    <VoiceCallSubjectLabel
                                        subject={event.actor}
                                    />
                                </>
                            )}
                            {event.target && (
                                <>
                                    <span> to </span>
                                    <VoiceCallSubjectLabel
                                        subject={event.target}
                                    />
                                </>
                            )}
                        </div>
                        <DatetimeLabel
                            dateTime={event.datetime}
                            className={classNames('text-faded', css.date)}
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

export default TicketVoiceCallEvents
