import moment from 'moment'
import {getMoment, stringToDatetime} from 'utils/date'
import {PhoneIntegrationEvent} from 'constants/integrations/types/event'
import {VoiceCall, VoiceCallEvent, VoiceCallStatus} from './types'

export const isFinalVoiceCallStatus = (status: VoiceCallStatus) => {
    return [
        VoiceCallStatus.Busy,
        VoiceCallStatus.Canceled,
        VoiceCallStatus.Completed,
        VoiceCallStatus.Failed,
        VoiceCallStatus.NoAnswer,
        VoiceCallStatus.Ending,
        VoiceCallStatus.Missed,
    ].includes(status)
}

export const getFormattedDurationEndedCall = (
    durationInSeconds: number
): string => {
    const duration = moment.duration(Number(durationInSeconds), 'seconds')
    const utcMoment = moment.utc(duration.asMilliseconds())

    if (duration.hours() > 0) {
        return utcMoment.format('H[h] m[m] s[s]')
    }

    if (duration.minutes() > 0) {
        return utcMoment.format('m[m] s[s]')
    }

    return utcMoment.format('s[s]')
}

export const getFormattedDurationOngoingCall = (
    startedDatetime: string
): string => {
    const startedMoment = stringToDatetime(startedDatetime)
    const now = getMoment()
    const durationInSeconds = now.diff(startedMoment, 'seconds')

    const duration = moment.duration(Number(durationInSeconds), 'seconds')
    const utcMoment = moment.utc(duration.asMilliseconds())

    if (duration.hours() > 0) {
        return utcMoment.format('hh:mm:ss')
    }

    if (duration.minutes() > 0) {
        return utcMoment.format('mm:ss')
    }

    return utcMoment.format('mm:ss')
}

const isMissedEvent = (event: VoiceCallEvent, nextEvents: VoiceCallEvent[]) => {
    // we should check if the call was missed/answered/declined before a transfer was initiated
    const checkEventsLimit = nextEvents.findIndex(
        (e) => e.type === PhoneIntegrationEvent.PhoneCallTransferInitiated
    )
    const searchEvents =
        checkEventsLimit > 0
            ? nextEvents.slice(0, checkEventsLimit)
            : nextEvents

    const missedCallEvent = searchEvents.find(
        (e) =>
            e.user_id === event.user_id &&
            e.type === PhoneIntegrationEvent.ChildCallNotAnswered
    )

    const answeredOrDeclinedEvent = missedCallEvent
        ? null
        : searchEvents.find(
              (e) =>
                  e.user_id === event.user_id &&
                  (e.type === PhoneIntegrationEvent.PhoneCallAnswered ||
                      e.type === PhoneIntegrationEvent.DeclinedPhoneCall)
          )
    return missedCallEvent || !answeredOrDeclinedEvent
}

export const processEvents = (
    events: VoiceCallEvent[]
): {
    text: string
    userId: number | null
    datetime: string
    customerId?: number
}[] => {
    const result = []
    const handled = events.filter((event) =>
        [
            PhoneIntegrationEvent.PhoneCallAnswered,
            PhoneIntegrationEvent.DeclinedPhoneCall,
            PhoneIntegrationEvent.PhoneCallRinging,
            PhoneIntegrationEvent.ChildCallNotAnswered,
            PhoneIntegrationEvent.OutgoingPhoneCallConnected,
            PhoneIntegrationEvent.PhoneCallTransferInitiated,
            PhoneIntegrationEvent.PhoneCallTransferFailed,
            PhoneIntegrationEvent.CompletedPhoneCall,
        ].includes(event.type)
    )

    let isTransfer = false
    for (const [index, event] of handled.entries()) {
        let newEvent

        if (event.type === PhoneIntegrationEvent.PhoneCallAnswered) {
            newEvent = {
                text: isTransfer ? 'Transfer answered by' : `Answered by`,
            }
        } else if (event.type === PhoneIntegrationEvent.DeclinedPhoneCall) {
            newEvent = {
                text: isTransfer ? 'Transfer declined by' : `Declined by`,
            }
        } else if (event.type === PhoneIntegrationEvent.PhoneCallRinging) {
            const nextEvents = handled.slice(index + 1)
            // we're skipping these events if the call is currently ringing due to a transfer
            const currentlyOngoingTransfer =
                isTransfer && nextEvents.length === 0

            if (!currentlyOngoingTransfer && isMissedEvent(event, nextEvents)) {
                newEvent = {
                    text: isTransfer ? 'Transfer missed by' : `Missed by`,
                }
            }
        } else if (
            event.type === PhoneIntegrationEvent.OutgoingPhoneCallConnected
        ) {
            // we don't have a transfer context for this event,
            // we will emit PhoneCallAnswered events for outbound transfers
            newEvent = {
                text: 'Answered by',
                customerId: event.customer_id,
            }
        } else if (
            event.type === PhoneIntegrationEvent.PhoneCallTransferInitiated
        ) {
            newEvent = {
                text: 'Transfer initiated by',
            }
        } else if (
            event.type === PhoneIntegrationEvent.PhoneCallTransferFailed &&
            isTransfer
        ) {
            // we only want to show the transfer failed event if there's no other events after transfer initiated
            newEvent = {
                text: 'Transfer failed to',
            }
        }

        if (newEvent) {
            result.push({
                ...newEvent,
                userId: event.user_id,
                datetime: event.created_datetime,
            })
            // If the current event is not a transfer initiated event,
            // then we're not in a transfer context anymore
            isTransfer =
                event.type === PhoneIntegrationEvent.PhoneCallTransferInitiated
        }
    }

    return result
}

export const isMissedInboundVoiceCall = (voiceCall: VoiceCall) => {
    return (
        voiceCall.direction === 'inbound' &&
        [VoiceCallStatus.Completed, VoiceCallStatus.Ending].includes(
            voiceCall.status
        ) &&
        !voiceCall.last_answered_by_agent_id
    )
}
