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
): {text: string; user_id: number}[] => {
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
        if (event.type === PhoneIntegrationEvent.PhoneCallAnswered) {
            result.push({text: `Answered by`, user_id: event.user_id})
        } else if (event.type === PhoneIntegrationEvent.DeclinedPhoneCall) {
            result.push({text: `Declined by`, user_id: event.user_id})
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
                result.push({text: `Missed by`, user_id: event.user_id})
            }
        }
    }

    return result
}
