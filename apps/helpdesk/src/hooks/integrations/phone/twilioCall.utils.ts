import { reportError } from '@repo/logging'
import type { TwilioError } from '@twilio/voice-sdk'
import { Call } from '@twilio/voice-sdk'
import crypto from 'crypto'
import { pick } from 'lodash'

import { appQueryClient } from 'api/queryClient'
import type { TwilioSocketEvent } from 'business/twilio'
import { TwilioSocketEventType } from 'business/twilio'
import {
    acceptCall,
    cancelCall,
    disconnectCall,
} from 'hooks/integrations/phone/api'
import type { UseListVoiceCalls } from 'models/voiceCall/queries'
import { voiceCallsKeys } from 'models/voiceCall/queries'
import type { TwilioMessage } from 'models/voiceCall/twilioMessageTypes'
import type { ListVoiceCallsParams } from 'models/voiceCall/types'
import type { VoiceDeviceActions } from 'pages/integrations/integration/components/voice/types'
import { ActivityEvents, logActivityEvent } from 'services/activityTracker'
import socketManager from 'services/socketManager/socketManager'
import { SocketEventType } from 'services/socketManager/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { StoreDispatch } from 'state/types'

import * as twilioCallUtils from './twilioCall.utils'

export function handleCallEvents(
    call: Call,
    dispatch: StoreDispatch,
    actions: VoiceDeviceActions,
    onMessageReceived?: (twilioMessage: TwilioMessage) => void,
) {
    call.on('accept', () => {
        twilioCallUtils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallAccepted,
            data: twilioCallUtils.gatherCallContext(call),
        })

        actions.setIsRinging(false)
        actions.setIsDialing(false)

        // When two agents pick up simultaneously, they both receive an "accept" event. However, the call is
        // actually accepted by the first agent only. The second agent then receives a "cancel" event and the
        // call status changes to "closed". Here, we wait a bit and then double-check the status, to avoid
        // creating wrong events "Call answered by x". See issue APPC-795

        setTimeout(
            () => twilioCallUtils.handleAcceptedCallEvent(call, dispatch),
            1000,
        )
    })

    call.on('reject', () => {
        twilioCallUtils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallRejected,
            data: twilioCallUtils.gatherCallContext(call),
        })

        actions.setCall(null)
        actions.setIsRinging(false)
        actions.setWarning(null)
        actions.setIsDialing(false)
    })

    call.on('cancel', () => {
        twilioCallUtils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallCancelled,
            data: twilioCallUtils.gatherCallContext(call),
        })

        actions.setCall(null)
        actions.setIsRinging(false)
        actions.setWarning(null)
        actions.setIsDialing(false)

        void cancelCall(call)
    })

    call.on('disconnect', () => {
        twilioCallUtils.logCallEnd(call)

        twilioCallUtils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallDisconnected,
            data: twilioCallUtils.gatherCallContext(call),
        })

        actions.setCall(null)
        actions.setIsRinging(false)
        actions.setWarning(null)
        actions.setIsDialing(false)

        void disconnectCall()
    })

    call.on('reconnected', () => {
        twilioCallUtils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallReconnected,
            data: twilioCallUtils.gatherCallContext(call),
        })

        actions.setError(null)
    })

    call.on('error', (error: TwilioError.TwilioError) => {
        twilioCallUtils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallError,
            data: {
                ...twilioCallUtils.gatherCallContext(call),
                error,
            },
        })

        actions.setError(error)
        reportError(error)
    })

    call.on('warning', (metricName: string, warningData: any) => {
        twilioCallUtils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallWarningStarted,
            data: {
                ...twilioCallUtils.gatherCallContext(call),
                metric_name: metricName,
                warning_data: warningData,
            },
        })

        actions.setWarning(metricName)
    })

    call.on('warning-cleared', (metricName: string, warningData: any) => {
        twilioCallUtils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallWarningEnded,
            data: {
                ...twilioCallUtils.gatherCallContext(call),
                metric_name: metricName,
                warning_data: warningData,
            },
        })

        actions.setWarning(null)
    })

    if (onMessageReceived) {
        call.on('messageReceived', (message) => {
            const twilioMessage = message.content as TwilioMessage
            onMessageReceived(twilioMessage)
        })
    }
}

export function logCallEnd(call: Call) {
    let ticketId: string | number | undefined
    const phoneCallId = getCallSid(call)

    if (call.customParameters.get('ticket_id')) {
        ticketId = call.customParameters.get('ticket_id') as string
    } else {
        const ticketIdQueryKey = appQueryClient
            .getQueriesData<UseListVoiceCalls>(voiceCallsKeys.lists())
            .find(([, data]) => {
                return !!data?.data.find(
                    (call) => call.external_id === phoneCallId,
                )
            })?.[0]

        ticketId = (ticketIdQueryKey?.[2] as ListVoiceCallsParams)?.ticket_id
    }

    logActivityEvent(ActivityEvents.UserFinishedPhoneCall, {
        entityId: Number(ticketId),
        entityType: 'ticket',
    })
}

export function handleAcceptedCallEvent(call: Call, dispatch: StoreDispatch) {
    if (call.direction === Call.CallDirection.Outgoing) {
        return
    }

    if (call.status() === Call.State.Closed) {
        void dispatch(
            notify({
                status: NotificationStatus.Info,
                message: 'Another agent already accepted the call',
            }),
        )

        void cancelCall()
    } else {
        void acceptCall(call)
        const ticketId = parseInt(
            call.customParameters.get('ticket_id') as string,
        )
        logActivityEvent(ActivityEvents.UserStartedPhoneCall, {
            entityId: ticketId,
            entityType: 'ticket',
        })
    }
}

export function sendTwilioSocketEvent(event: TwilioSocketEvent) {
    if (
        event.type === TwilioSocketEventType.CallError ||
        event.type === TwilioSocketEventType.DeviceError
    ) {
        const error = pick(event.data.error, ['code', 'name', 'message'])
        socketManager.send(SocketEventType.TwilioEventTriggered, {
            ...event,
            data: {
                ...event.data,
                error,
            },
        })
    } else {
        socketManager.send(SocketEventType.TwilioEventTriggered, event)
    }
}

export function generateCallId(call: Call): string {
    const shasum = crypto.createHash('sha256')

    switch (call.direction) {
        case Call.CallDirection.Outgoing: {
            const from = call.customParameters.get('From')!
            const to = call.customParameters.get('To')!

            shasum.update(`${from}.${to}`)
            break
        }

        case Call.CallDirection.Incoming: {
            const from = call.parameters.From
            const to = call.customParameters.get('to')!

            shasum.update(`${from}.${to}`)
            break
        }
    }

    return shasum.digest('hex')
}

export function getCallSid(call: Call): string {
    switch (call.direction) {
        case Call.CallDirection.Outgoing: {
            return call.parameters.CallSid
        }
        case Call.CallDirection.Incoming: {
            return call.customParameters.get('call_sid') as string
        }
    }
}

export function gatherCallContext(call: Call): {
    id: string
    call_sid: Maybe<string>
} {
    return {
        id: generateCallId(call),
        call_sid: getCallSid(call),
    }
}
