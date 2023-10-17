import moment from 'moment'
import {getMoment, stringToDatetime} from 'utils/date'
import {VoiceCall, VoiceCallStatus} from './types'

export const isFinalVoiceCallStatus = (status: VoiceCallStatus) => {
    return [
        VoiceCallStatus.Busy,
        VoiceCallStatus.Canceled,
        VoiceCallStatus.Completed,
        VoiceCallStatus.Failed,
        VoiceCallStatus.NoAnswer,
    ].includes(status)
}

export const getFormattedDurationEndedCall = (
    durationInSeconds: number
): string => {
    const duration = moment.duration(Number(durationInSeconds), 'seconds')
    const utcMoment = moment.utc(duration.asMilliseconds())

    if (duration.hours() > 0) {
        return utcMoment.format('H[H] m[M] s[S]')
    }

    if (duration.minutes() > 0) {
        return utcMoment.format('m[M] s[S]')
    }

    return utcMoment.format('s[S]')
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
