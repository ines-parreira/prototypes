import {useCallback} from 'react'
import {TwilioError} from '@twilio/voice-sdk'

import {
    PhoneCallDirection,
    TwilioErrorCode,
    TwilioSocketEventType,
} from 'business/twilio'
import {setCall, setIsDialing} from 'state/twilio/actions'
import client from 'models/api/resources'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {RootState} from 'state/types'
import {
    sendTwilioSocketEvent,
    gatherCallContext,
} from 'hooks/integrations/phone/utils'

import {usePhoneError} from './usePhoneError'

type Options = {
    fromAddress: string
    toAddress: string
    integrationId: number
    customerName: string
    ticketId: Maybe<number>
    agentId: number
}

export function useOutboundCall(): (options: Options) => void {
    const dispatch = useAppDispatch()
    const device = useAppSelector((state: RootState) => state.twilio.device)

    const {onError, onTwilioError} = usePhoneError({
        // Twilio throws this error when the customer doesn't pick up the call
        ignoredErrorCodes: [TwilioErrorCode.GeneralConnection],
    })

    return useCallback(
        async ({
            fromAddress,
            toAddress,
            integrationId,
            customerName,
            ticketId,
            agentId,
        }: Options) => {
            const params: Record<string, string> = {
                Direction: PhoneCallDirection.OutboundDial,
                Caller: fromAddress,
                Called: toAddress,
                From: fromAddress,
                To: toAddress,

                // Custom parameters:
                integration_id: integrationId.toString(),
                customer_name: customerName,
                agent_id: agentId.toString(),
                original_path: window.location.pathname,
            }

            if (!!ticketId) {
                params.original_ticket_id = ticketId.toString()
            }

            const call = await device?.connect({params: params})
            if (!call) {
                return
            }

            sendTwilioSocketEvent({
                type: TwilioSocketEventType.CallOutgoing,
                data: gatherCallContext(call),
            })

            call.on('accept', () => {
                dispatch(setIsDialing(false))
                sendTwilioSocketEvent({
                    type: TwilioSocketEventType.CallAccepted,
                    data: gatherCallContext(call),
                })
            })

            call.on('cancel', () => {
                dispatch(setIsDialing(false))
                dispatch(setCall(null))
                void onDisconnect(onError)
                sendTwilioSocketEvent({
                    type: TwilioSocketEventType.CallCancelled,
                    data: gatherCallContext(call),
                })
            })

            call.on('disconnect', () => {
                dispatch(setIsDialing(false))
                dispatch(setCall(null))
                void onDisconnect(onError)
                sendTwilioSocketEvent({
                    type: TwilioSocketEventType.CallDisconnected,
                    data: gatherCallContext(call),
                })
            })

            call.on('reconnected', () => {
                sendTwilioSocketEvent({
                    type: TwilioSocketEventType.CallReconnected,
                    data: gatherCallContext(call),
                })
            })

            call.on('error', (error: TwilioError.TwilioError) => {
                onTwilioError(error, 'Outgoing phone call error')
                sendTwilioSocketEvent({
                    type: TwilioSocketEventType.CallError,
                    data: {
                        ...gatherCallContext(call),
                        error,
                    },
                })
            })

            call.on('warning', (metricName: string) => {
                sendTwilioSocketEvent({
                    type: TwilioSocketEventType.CallWarningStarted,
                    data: {
                        ...gatherCallContext(call),
                        metric_name: metricName,
                    },
                })
            })

            call.on('warning-ended', (metricName: string) => {
                sendTwilioSocketEvent({
                    type: TwilioSocketEventType.CallWarningEnded,
                    data: {
                        ...gatherCallContext(call),
                        metric_name: metricName,
                    },
                })
            })

            dispatch(setIsDialing(true))
            dispatch(setCall(call))
            await onConnect(onError)
        },
        [device, dispatch, onError, onTwilioError]
    )
}

async function onConnect(onError: (error: Error, title?: string) => void) {
    try {
        await client.post('/integrations/phone/call/connected')
    } catch (error) {
        const message = "Couldn't mark phone call as connected"
        error instanceof Error
            ? onError(error, message)
            : onError(new Error(message), message)
    }
}

async function onDisconnect(onError: (error: Error, title?: string) => void) {
    try {
        await client.post('/integrations/phone/call/disconnected')
    } catch (error) {
        const message = "Couldn't mark phone call as disconnected"
        error instanceof Error
            ? onError(error, message)
            : onError(new Error(message), message)
    }
}
