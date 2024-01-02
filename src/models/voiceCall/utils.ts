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
    voiceCall: VoiceCall
): string => {
    const startedMoment = stringToDatetime(voiceCall.started_datetime)
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

export const processEvents = (
    events: VoiceCallEvent[]
): {text: string; userId: number; datetime: string}[] => {
    const result = []
    const handled = events.filter((event) =>
        [
            PhoneIntegrationEvent.PhoneCallAnswered,
            PhoneIntegrationEvent.DeclinedPhoneCall,
            PhoneIntegrationEvent.PhoneCallRinging,
            PhoneIntegrationEvent.ChildCallNotAnswered,
        ].includes(event.type)
    )

    for (const event of handled) {
        let newEvent

        if (event.type === PhoneIntegrationEvent.PhoneCallAnswered) {
            newEvent = {
                text: `Answered by`,
            }
        } else if (event.type === PhoneIntegrationEvent.DeclinedPhoneCall) {
            newEvent = {
                text: `Declined by`,
            }
        } else if (event.type === PhoneIntegrationEvent.PhoneCallRinging) {
            const missedCallEvent = handled.find(
                (e) =>
                    e.user_id === event.user_id &&
                    e.type === PhoneIntegrationEvent.ChildCallNotAnswered
            )

            const answeredOrDeclinedEvent = missedCallEvent
                ? null
                : handled.find(
                      (e) =>
                          e.user_id === event.user_id &&
                          (e.type === PhoneIntegrationEvent.PhoneCallAnswered ||
                              e.type ===
                                  PhoneIntegrationEvent.DeclinedPhoneCall)
                  )

            if (missedCallEvent || !answeredOrDeclinedEvent) {
                newEvent = {
                    text: `Missed by`,
                }
            }
        }

        if (newEvent) {
            result.push({
                ...newEvent,
                userId: event.user_id,
                datetime: event.created_datetime,
            })
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
