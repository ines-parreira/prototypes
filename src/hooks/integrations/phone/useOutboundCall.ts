import {useCallback} from 'react'

import {PhoneCallDirection, TwilioSocketEventType} from 'business/twilio'
import {setCall, setIsDialing} from 'state/twilio/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {RootState} from 'state/types'
import {
    sendTwilioSocketEvent,
    gatherCallContext,
    handleCallEvents,
} from 'hooks/integrations/phone/utils'
import {connectCall} from 'hooks/integrations/phone/api'

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
    const {device} = useAppSelector((state: RootState) => state.twilio)

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

            handleCallEvents(call, dispatch)

            dispatch(setIsDialing(true))
            dispatch(setCall(call))
            await connectCall()
        },
        [device, dispatch]
    )
}
