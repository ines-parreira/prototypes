import { DateAndTimeFormatting } from '@repo/utils'
import classNames from 'classnames'
import _capitalize from 'lodash/capitalize'

import type { ProcessedEvent } from 'models/voiceCall/processEvents'
import VoiceCallSubjectLabel from 'pages/common/components/VoiceCallSubjectLabel/VoiceCallSubjectLabel'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import TimelineItem from './TimelineItem'

import css from './TicketVoiceCallContainer.less'

type TicketVoiceCallEventProps = {
    event: ProcessedEvent
}

const TicketVoiceCallEvent = ({ event }: TicketVoiceCallEventProps) => {
    const getActionPrettyName = (event: ProcessedEvent) => {
        if (event.showTransferPrefix) {
            return `Transfer ${event.action}`
        }
        return _capitalize(event.action)
    }

    return (
        <TimelineItem>
            <div className={classNames(css.row, css.timelineItemContent)}>
                <div className={classNames(css.statusWrapper, css.inbound)}>
                    <span>{getActionPrettyName(event)}</span>
                    {event.actor && (
                        <>
                            <span> by </span>
                            <VoiceCallSubjectLabel subject={event.actor} />
                        </>
                    )}
                    {event.target && (
                        <>
                            <span>{event.connector || ' to '}</span>
                            <VoiceCallSubjectLabel subject={event.target} />
                        </>
                    )}
                    {event.extra && <span> ({event.extra})</span>}
                </div>
                <DatetimeLabel
                    dateTime={event.datetime}
                    className={classNames('text-faded', css.date)}
                    labelFormat={DateAndTimeFormatting.TimeDoubleDigitHour}
                />
            </div>
        </TimelineItem>
    )
}

export default TicketVoiceCallEvent
