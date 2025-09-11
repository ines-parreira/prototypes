import { PhoneIntegrationEvent } from 'constants/integrations/types/event'

import { VoiceCallEvent, VoiceCallSubject, VoiceCallSubjectType } from './types'

export type ProcessedEvent = {
    datetime: string
    action: string
    actor?: VoiceCallSubject | null
    target?: VoiceCallSubject | null
    happensDuringTransfer?: boolean
}

const getAgentSubjectFromUserId = (
    userId: number | null,
): VoiceCallSubject | null =>
    userId
        ? {
              type: VoiceCallSubjectType.Agent,
              id: userId,
          }
        : null

const getExternalSubjectFromCustomerMeta = (
    meta: Record<string, unknown>,
): VoiceCallSubject | null => {
    const customerMeta = meta.customer as {
        id: number | undefined
        name: string | undefined
        phone_number: string | undefined
    }
    if (!customerMeta) {
        return null
    }
    if (!customerMeta.phone_number) {
        return null
    }

    return {
        type: VoiceCallSubjectType.External,
        value: customerMeta.phone_number,
        customer: customerMeta.id
            ? {
                  id: customerMeta.id,
                  name: customerMeta.name,
              }
            : undefined,
    }
}

const getExternalSubject = (event: VoiceCallEvent): VoiceCallSubject | null => {
    const phoneNumber =
        (event.meta.external_phone_number as string | undefined) ||
        (event.meta.external_number as string | undefined)
    const customerId = event.meta.target_customer_id as number | undefined

    return phoneNumber
        ? {
              type: VoiceCallSubjectType.External,
              value: phoneNumber,
              customer: customerId
                  ? {
                        id: customerId,
                    }
                  : undefined,
          }
        : null
}

const getActorSubject = (event: VoiceCallEvent): VoiceCallSubject | null =>
    event.meta.external_forwarded === true
        ? getExternalSubject(event)
        : getAgentSubjectFromUserId(event.user_id)

const getTransferTarget = (event: VoiceCallEvent): VoiceCallSubject | null => {
    const targetType = event.meta.target_type as string | undefined

    if (!targetType || targetType === 'agent') {
        const targetAgentId = event.meta.target_agent_id as number | undefined
        return targetAgentId
            ? {
                  type: VoiceCallSubjectType.Agent,
                  id: targetAgentId,
              }
            : null
    }

    if (targetType === 'external') {
        const phoneNumber = event.meta.target_external_number as
            | string
            | undefined
        const customerId = event.meta.target_customer_id as number | undefined

        return phoneNumber
            ? {
                  type: VoiceCallSubjectType.External,
                  value: phoneNumber,
                  customer: customerId
                      ? {
                            id: customerId,
                        }
                      : undefined,
              }
            : null
    }

    if (targetType === 'queue') {
        const targetQueueId = event.meta.target_queue_id as number | undefined
        return targetQueueId
            ? {
                  type: VoiceCallSubjectType.Queue,
                  id: targetQueueId,
              }
            : null
    }

    return null
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

    const sameAgentCondition = (
        event1: VoiceCallEvent,
        event2: VoiceCallEvent,
    ) => event1.user_id === event2.user_id
    const sameExternalCondition = (
        event1: VoiceCallEvent,
        event2: VoiceCallEvent,
    ) =>
        event1.meta.external_phone_number ===
            event2.meta.external_phone_number ||
        event1.meta.target_customer_id === event2.meta.target_customer_id
    const sameSubjectCondition =
        event.meta.external_forwarded === true
            ? sameExternalCondition
            : sameAgentCondition

    const missedCallEvent = searchEvents.find(
        (e) =>
            sameSubjectCondition(e, event) &&
            e.type === PhoneIntegrationEvent.ChildCallNotAnswered,
    )
    if (missedCallEvent) {
        // if we find a corresponding not-answered event, we're sure it's a missed event
        // this is the case for round-robin calls
        return true
    }

    const answeredOrDeclinedEvent = searchEvents.find(
        (e) =>
            sameSubjectCondition(e, event) &&
            (e.type === PhoneIntegrationEvent.PhoneCallAnswered ||
                e.type === PhoneIntegrationEvent.DeclinedPhoneCall),
    )
    // if we instead don't find a not-answered event, check for answered or declined events
    // if we find one of them, it's not a missed event (we instead display the answered or declined event)
    // this is the case for broadcast calls
    return !answeredOrDeclinedEvent
}

export const processEvents = (events: VoiceCallEvent[]): ProcessedEvent[] => {
    const result: ProcessedEvent[] = []
    let isTransfer = false
    for (const [index, event] of events.entries()) {
        switch (event.type) {
            case PhoneIntegrationEvent.PhoneCallAnswered:
                result.push({
                    datetime: event.created_datetime,
                    action: 'answered',
                    actor: getActorSubject(event),
                    happensDuringTransfer: isTransfer,
                })
                isTransfer = false
                break
            case PhoneIntegrationEvent.DeclinedPhoneCall:
                result.push({
                    datetime: event.created_datetime,
                    action: 'declined',
                    actor: getActorSubject(event),
                    happensDuringTransfer: isTransfer,
                })
                isTransfer = false
                break
            case PhoneIntegrationEvent.PhoneCallRinging:
                const nextEvents = events.slice(index + 1)
                // we're skipping these events if the call is currently ringing due to a transfer
                const currentlyOngoingTransfer =
                    isTransfer && nextEvents.length === 0

                if (
                    !currentlyOngoingTransfer &&
                    isMissedEvent(event, nextEvents)
                ) {
                    result.push({
                        datetime: event.created_datetime,
                        action: 'missed',
                        actor: getActorSubject(event),
                        happensDuringTransfer: isTransfer,
                    })
                    isTransfer = false
                }
                break
            case PhoneIntegrationEvent.OutgoingPhoneCallConnected:
                // we emit PhoneCallAnswered events for outbound transfers
                // so no transfer-related logic here
                result.push({
                    datetime: event.created_datetime,
                    action: 'answered',
                    actor: getExternalSubjectFromCustomerMeta(event.meta),
                })
                break
            case PhoneIntegrationEvent.PhoneCallTransferInitiated:
                result.push({
                    datetime: event.created_datetime,
                    action: 'initiated',
                    actor: getAgentSubjectFromUserId(event.user_id),
                    target: getTransferTarget(event),
                    happensDuringTransfer: true,
                })
                if (event.meta.target_type !== 'queue') {
                    // transfer to queue makes the source agent leave the call
                    // so we don't consider the following events as part of a transfer
                    isTransfer = true
                }
                break
            case PhoneIntegrationEvent.PhoneCallTransferFailed:
                if (isTransfer) {
                    // we only want to show the transfer failed event
                    // if there's no other events after transfer initiated
                    result.push({
                        datetime: event.created_datetime,
                        action: 'failed',
                        target: getTransferTarget(event),
                        happensDuringTransfer: true,
                    })
                    isTransfer = false
                }
                break
            case PhoneIntegrationEvent.PhoneCallForwardedToExternalNumber:
                if (!isTransfer) {
                    result.push({
                        datetime: event.created_datetime,
                        action: 'forwarded',
                        target: getExternalSubject(event),
                    })
                }
                break
        }
    }
    return result
}
