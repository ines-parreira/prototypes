import { useCallback } from 'react'

import { VoiceCallDirection } from '@gorgias/helpdesk-types'

import { PhoneCallDirection, TwilioSocketEventType } from 'business/twilio'
import { getMonitoringRestrictionReason } from 'hooks/integrations/phone/monitoring.utils'
import {
    gatherCallContext,
    handleCallEvents,
    sendTwilioSocketEvent,
} from 'hooks/integrations/phone/twilioCall.utils'
import useAppDispatch from 'hooks/useAppDispatch'
import { TwilioMessageType } from 'models/voiceCall/twilioMessageTypes'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import useVoiceDevice from './useVoiceDevice'

export type ExtraMonitoringParams = {
    integrationId: number | null
    customerId: number | null
    customerPhoneNumber: string
    inCallAgentId: number | null
}

export function useMonitoringCall(voiceCallDirection: VoiceCallDirection) {
    const dispatch = useAppDispatch()
    const { device, actions } = useVoiceDevice()

    const makeMonitoringCall = useCallback(
        async (
            callSidToMonitor: string,
            agentId: number,
            extraMonitoringParams: ExtraMonitoringParams,
        ) => {
            const params: Record<string, string> = {
                Direction: PhoneCallDirection.OutboundDial,

                // Custom parameters:
                is_monitoring: 'true',
                main_call_sid: callSidToMonitor,
                agent_id: agentId.toString(),
                original_path: window.location.pathname,
                tab_id: window.CLIENT_ID,
                // needed for display on call bar
                integration_id:
                    extraMonitoringParams.integrationId?.toString() ?? 'null',
                customer_id:
                    extraMonitoringParams.customerId?.toString() ?? 'null',
                customer_phone_number:
                    extraMonitoringParams.customerPhoneNumber,
                in_call_agent_id:
                    extraMonitoringParams.inCallAgentId?.toString() ?? 'null',
            }

            const call = await device?.connect({ params: params })
            if (!call) {
                return
            }

            sendTwilioSocketEvent({
                type: TwilioSocketEventType.CallOutgoing,
                data: gatherCallContext(call),
            })

            handleCallEvents(call, dispatch, actions, (message) => {
                if (
                    message.type ===
                    TwilioMessageType.MonitoringValidationFailed
                ) {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: getMonitoringRestrictionReason(
                                message.data.error_code,
                                voiceCallDirection,
                            ),
                        }),
                    )
                }
            })

            actions.setCall(call)
        },
        [device, dispatch, actions, voiceCallDirection],
    )

    return { makeMonitoringCall }
}
