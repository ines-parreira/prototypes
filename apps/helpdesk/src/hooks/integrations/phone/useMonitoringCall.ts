import { useCallback } from 'react'

import { VoiceCallDirection } from '@gorgias/helpdesk-types'

import { PhoneCallDirection, TwilioSocketEventType } from 'business/twilio'
import {
    gatherCallContext,
    handleCallEvents,
    sendTwilioSocketEvent,
} from 'hooks/integrations/phone/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import { VoiceCall } from 'models/voiceCall/types'

import useVoiceDevice from './useVoiceDevice'

export function useMonitoringCall() {
    const dispatch = useAppDispatch()
    const { device, actions } = useVoiceDevice()

    const makeMonitoringCall = useCallback(
        async (voiceCall: VoiceCall, agentId: number) => {
            const customerPhoneNumber =
                voiceCall.direction === VoiceCallDirection.Inbound
                    ? voiceCall.phone_number_source
                    : voiceCall.phone_number_destination
            const inCallAgentId =
                voiceCall.last_answered_by_agent_id ??
                voiceCall.initiated_by_agent_id ??
                0

            const params: Record<string, string> = {
                Direction: PhoneCallDirection.OutboundDial,

                // Custom parameters:
                is_monitoring: 'true',
                main_call_sid: voiceCall.external_id,
                agent_id: agentId.toString(),
                original_path: window.location.pathname,
                tab_id: window.CLIENT_ID,
                // needed for display on call bar
                integration_id: voiceCall.integration_id.toString(),
                in_call_agent_id: inCallAgentId.toString(),
                customer_id: voiceCall.customer_id.toString(),
                customer_phone_number: customerPhoneNumber,
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

    return { makeMonitoringCall }
}
