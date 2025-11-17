import moment from 'moment'

import { VoiceCallDirection, VoiceCallStatus } from '@gorgias/helpdesk-types'

import { PhoneIntegrationEvent } from 'constants/integrations/types/event'
import type { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { getMoment, stringToDatetime } from 'utils/date'

import type {
    VoiceCall,
    VoiceCallEvent,
    VoiceCallMonitoringStatus,
    VoiceCallSubject,
} from './types'
import { VoiceCallSubjectType } from './types'

export const isFinalVoiceCallStatus = (status: VoiceCallStatus) => {
    const finalStatuses: VoiceCallStatus[] = [
        VoiceCallStatus.Busy,
        VoiceCallStatus.Canceled,
        VoiceCallStatus.Completed,
        VoiceCallStatus.Failed,
        VoiceCallStatus.NoAnswer,
        VoiceCallStatus.Ending,
        VoiceCallStatus.Missed,
    ]

    return finalStatuses.includes(status)
}

export const getFormattedDurationEndedCall = (
    durationInSeconds: number,
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
    startedDatetime: string,
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

export const getFormattedDurationTranscriptionStart = (
    startedSecond: number,
) => {
    const duration = moment.duration(Number(startedSecond), 'seconds')
    const utcMoment = moment.utc(duration.asMilliseconds())
    return utcMoment.format('mm:ss')
}

const isMissedEvent = (event: VoiceCallEvent, nextEvents: VoiceCallEvent[]) => {
    // we should check if the call was missed/answered/declined before a transfer was initiated
    const checkEventsLimit = nextEvents.findIndex(
        (e) => e.type === PhoneIntegrationEvent.PhoneCallTransferInitiated,
    )
    const searchEvents =
        checkEventsLimit > 0
            ? nextEvents.slice(0, checkEventsLimit)
            : nextEvents

    const missedCallEvent = searchEvents.find(
        (e) =>
            e.user_id === event.user_id &&
            e.type === PhoneIntegrationEvent.ChildCallNotAnswered,
    )

    const answeredOrDeclinedEvent = missedCallEvent
        ? null
        : searchEvents.find(
              (e) =>
                  e.user_id === event.user_id &&
                  (e.type === PhoneIntegrationEvent.PhoneCallAnswered ||
                      e.type === PhoneIntegrationEvent.DeclinedPhoneCall),
          )
    return missedCallEvent || !answeredOrDeclinedEvent
}

type DEPRECATED_ProcessedEvent = {
    text: string
    userId: number | null
    datetime: string
    customerId?: number
}

export const DEPRECATED_processEvents = (
    events: VoiceCallEvent[],
): DEPRECATED_ProcessedEvent[] => {
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
        ].includes(event.type),
    )

    let isTransfer = false
    for (const [index, event] of handled.entries()) {
        const newEvent: DEPRECATED_ProcessedEvent = {
            datetime: event.created_datetime,
            userId: event.user_id,
            text: '',
        }

        switch (event.type) {
            case PhoneIntegrationEvent.PhoneCallAnswered:
                newEvent.text = isTransfer
                    ? 'Transfer answered by '
                    : `Answered by `
                break
            case PhoneIntegrationEvent.DeclinedPhoneCall:
                newEvent.text = isTransfer
                    ? 'Transfer declined by '
                    : `Declined by `
                break
            case PhoneIntegrationEvent.PhoneCallRinging: {
                const nextEvents = handled.slice(index + 1)
                // we're skipping these events if the call is currently ringing due to a transfer
                const currentlyOngoingTransfer =
                    isTransfer && nextEvents.length === 0

                if (
                    !currentlyOngoingTransfer &&
                    isMissedEvent(event, nextEvents)
                ) {
                    newEvent.text = isTransfer
                        ? 'Transfer missed by '
                        : `Missed by `
                }
                break
            }
            case PhoneIntegrationEvent.OutgoingPhoneCallConnected:
                // we don't have a transfer context for this event,
                // we will emit PhoneCallAnswered events for outbound transfers
                newEvent.text = 'Answered by '
                newEvent.customerId = event.customer_id
                newEvent.userId = null
                break
            case PhoneIntegrationEvent.PhoneCallTransferInitiated:
                newEvent.text = 'Transfer initiated by '
                break
            case PhoneIntegrationEvent.PhoneCallTransferFailed:
                if (isTransfer) {
                    // we only want to show the transfer failed event if there's no other events after transfer initiated
                    newEvent.text = 'Transfer failed to '
                }
                break
            default:
                break
        }

        if (newEvent.text) {
            result.push(newEvent)
            // If the current event is not a transfer initiated event,
            // then we're not in a transfer context anymore
            isTransfer =
                event.type === PhoneIntegrationEvent.PhoneCallTransferInitiated
        }
    }

    return result
}

export const isMissedInboundVoiceCall = (voiceCall: VoiceCall) => {
    const finalInboundCallStatuses: VoiceCallStatus[] = [
        VoiceCallStatus.Completed,
        VoiceCallStatus.Ending,
    ]

    return (
        voiceCall.direction === 'inbound' &&
        finalInboundCallStatuses.includes(voiceCall.status) &&
        !voiceCall.last_answered_by_agent_id
    )
}

export const getAnsweringVoiceSubject = (
    voiceCall: VoiceCall,
): VoiceCallSubject | null => {
    if (voiceCall.answered_by_external_number) {
        return {
            type: VoiceCallSubjectType.External,
            value: voiceCall.answered_by_external_number,
            customer: voiceCall.answered_by_external_customer_id
                ? {
                      id: voiceCall.answered_by_external_customer_id,
                  }
                : null,
        }
    }
    if (voiceCall.last_answered_by_agent_id) {
        return {
            type: VoiceCallSubjectType.Agent,
            id: voiceCall.last_answered_by_agent_id,
        }
    }
    return null
}

export const isCallTransfer = (voiceCall: VoiceCall) => {
    // we don't have a specific flag for transfers, so we're inferring it based on the answering subject
    // in short, if the call was answered at some point by an agent or external number, it was transferred
    if (voiceCall.direction === VoiceCallDirection.Inbound) {
        return (
            !!voiceCall.last_answered_by_agent_id ||
            !!voiceCall.answered_by_external_number
        )
    }

    if (voiceCall.direction === VoiceCallDirection.Outbound) {
        // for outbound calls, to also handle the transfer to queue, we need to check if the status is queued
        // the queued status only happens when a call in inside a queue for agents to pick it up
        // which usually happens during inbound calls, instead for outbound calls it means we're transferring to queue
        return (
            !!voiceCall.last_answered_by_agent_id ||
            !!voiceCall.answered_by_external_number ||
            voiceCall.status === VoiceCallStatus.Queued
        )
    }
}

export const getTransferTargetVoiceCallSubject = (
    voiceCall: VoiceCallSummary,
): VoiceCallSubject | null => {
    if (voiceCall.transferType === 'agent' && voiceCall.transferTargetAgentId) {
        return {
            type: VoiceCallSubjectType.Agent,
            id: voiceCall.transferTargetAgentId,
        }
    }
    if (
        voiceCall.transferType === 'external' &&
        voiceCall.transferTargetExternalNumber
    ) {
        return {
            type: VoiceCallSubjectType.External,
            value: voiceCall.transferTargetExternalNumber,
        }
    }
    if (voiceCall.transferType === 'queue' && voiceCall.transferTargetQueueId) {
        return {
            type: VoiceCallSubjectType.Queue,
            id: voiceCall.transferTargetQueueId,
        }
    }
    return null
}

export const isCallBeingTransferredToQueue = (
    voiceCall: VoiceCall | VoiceCallSummary,
): boolean => {
    const agentId =
        'last_answered_by_agent_id' in voiceCall
            ? voiceCall.last_answered_by_agent_id
            : voiceCall.agentId

    if (voiceCall.status === VoiceCallStatus.Queued && agentId) {
        // covers inbound calls being transferred to a queue
        return true
    }
    if (
        voiceCall.status === VoiceCallStatus.Queued &&
        voiceCall.direction === VoiceCallDirection.Outbound
    ) {
        // covers outbound calls being transferred to a queue
        return true
    }
    return false
}

export const isCallInProgress = (
    voiceCall: VoiceCall | VoiceCallSummary,
): boolean => {
    if (voiceCall.status === VoiceCallStatus.Answered) {
        // covers inbound + successfully transferred inbound/outbound calls
        return true
    }
    if (voiceCall.status === VoiceCallStatus.Connected) {
        // covers non-transferred outbound calls
        return true
    }
    if (isCallBeingTransferredToQueue(voiceCall)) {
        // when the call is being transferred to a queue, it is still considered in progress
        // even though the status in not answered or connected
        return true
    }

    return false
}

export const getInCallAgentId = (
    voiceCall: VoiceCall | VoiceCallSummary,
): number | null => {
    if ('agentId' in voiceCall) {
        return voiceCall.agentId
    }
    return (
        voiceCall.last_answered_by_agent_id ??
        voiceCall.initiated_by_agent_id ??
        null
    )
}

export const isCallAnsweredByExternalNumber = (
    voiceCall: VoiceCall | VoiceCallSummary,
): boolean => {
    if ('answered_by_external_number' in voiceCall) {
        return !!voiceCall.answered_by_external_number
    }
    // we remove calls answered by an external number from live voice view
    // for this reason, if we have VoiceCallSummary we can assume it's not answered by an external number
    return false
}

const getMonitoringData = (
    voiceCall: VoiceCall | VoiceCallSummary,
): {
    monitoringStatus: VoiceCallMonitoringStatus | null
    lastMonitoringAgentId: number | null
} => {
    if (
        'monitoring_status' in voiceCall &&
        'last_monitoring_agent_id' in voiceCall
    ) {
        return {
            monitoringStatus: voiceCall.monitoring_status ?? null,
            lastMonitoringAgentId: voiceCall.last_monitoring_agent_id ?? null,
        }
    }
    if (
        'monitoringStatus' in voiceCall &&
        'lastMonitoringAgentId' in voiceCall
    ) {
        return {
            monitoringStatus: voiceCall.monitoringStatus ?? null,
            lastMonitoringAgentId: voiceCall.lastMonitoringAgentId ?? null,
        }
    }
    return {
        monitoringStatus: null,
        lastMonitoringAgentId: null,
    }
}

export const isCallBeingMonitored = (
    voiceCall: VoiceCall | VoiceCallSummary,
    byAgentId?: number,
): boolean => {
    const { monitoringStatus, lastMonitoringAgentId } =
        getMonitoringData(voiceCall)

    if (monitoringStatus && monitoringStatus !== 'none') {
        if (byAgentId) {
            return lastMonitoringAgentId === byAgentId
        }
        return true
    }
    return false
}
