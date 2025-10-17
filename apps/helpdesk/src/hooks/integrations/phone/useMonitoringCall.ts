import { useCallback } from 'react'

import { PhoneCallDirection, TwilioSocketEventType } from 'business/twilio'
import {
    gatherCallContext,
    handleCallEvents,
    sendTwilioSocketEvent,
} from 'hooks/integrations/phone/utils'
import useAppDispatch from 'hooks/useAppDispatch'

import useVoiceDevice from './useVoiceDevice'

type Options = {
    mainCallSid: string
    agentId: number
}

export function useMonitoringCall(): (options: Options) => void {
    const dispatch = useAppDispatch()
    const { device, actions } = useVoiceDevice()

    return useCallback(
        async ({ mainCallSid, agentId }: Options) => {
            const params: Record<string, string> = {
                Direction: PhoneCallDirection.OutboundDial,

                // Custom parameters:
                is_monitoring: 'true',
                main_call_sid: mainCallSid,
                agent_id: agentId.toString(),
                original_path: window.location.pathname,
                tab_id: window.CLIENT_ID,
            }

            const call = await device?.connect({ params: params })
            if (!call) {
                return
            }

            sendTwilioSocketEvent({
                type: TwilioSocketEventType.CallOutgoing,
                data: gatherCallContext(call),
            })

            handleCallEvents(call, dispatch, actions)

            actions.setCall(call)
        },
        [device, dispatch, actions],
    )
}
