import { useCallback } from 'react'

import { usePrepareCallMonitoring } from '@gorgias/helpdesk-queries'

import { PhoneCallDirection, TwilioSocketEventType } from 'business/twilio'
import {
    gatherCallContext,
    handleCallEvents,
    sendTwilioSocketEvent,
} from 'hooks/integrations/phone/twilioCall.utils'
import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import {
    MONITORING_GENERIC_ERROR,
    MONITORING_SWITCH_ERROR,
} from 'models/voiceCall/constants'
import { TwilioMessageType } from 'models/voiceCall/twilioMessageTypes'
import type { MonitoringErrorCode } from 'models/voiceCall/types'

import useVoiceDevice from './useVoiceDevice'

type PrepareMonitoringErrorData = {
    error_code: MonitoringErrorCode
}

export type ExtraMonitoringParams = {
    integrationId: number | null
    customerId: number | null
    customerPhoneNumber: string
    inCallAgentId: number | null
}

type PrepareMonitoringResult =
    | { readyForMonitoring: true }
    | {
          readyForMonitoring: false
          errorType: 'error_code'
          errorCode: MonitoringErrorCode
      }
    | {
          readyForMonitoring: false
          errorType: 'error_message'
          errorMessage: string
      }

export function useMonitoringCall() {
    const dispatch = useAppDispatch()
    const { device, call: currentCall, actions } = useVoiceDevice()
    const { mutateAsync: prepareCallMonitoringMutation } =
        usePrepareCallMonitoring()

    const prepareMonitoringCall = useCallback(
        async (
            callSidToMonitor: string,
            endExisting: boolean = false,
        ): Promise<PrepareMonitoringResult> => {
            try {
                const result = await prepareCallMonitoringMutation({
                    data: {
                        main_call_sid: callSidToMonitor,
                        end_existing: endExisting,
                    },
                })
                if (endExisting && !result.data.has_ended_existing) {
                    return {
                        readyForMonitoring: false,
                        errorType: 'error_message',
                        errorMessage: MONITORING_SWITCH_ERROR,
                    }
                }
                return { readyForMonitoring: true }
            } catch (error) {
                if (isGorgiasApiError(error)) {
                    const errorData = error.response.data.error
                        .data as PrepareMonitoringErrorData
                    if (error.status === 400 && errorData?.error_code) {
                        return {
                            readyForMonitoring: false,
                            errorType: 'error_code',
                            errorCode: errorData.error_code,
                        }
                    }
                }
                return {
                    readyForMonitoring: false,
                    errorType: 'error_message',
                    errorMessage: MONITORING_GENERIC_ERROR,
                }
            }
        },
        [prepareCallMonitoringMutation],
    )

    const makeMonitoringCall = useCallback(
        async (
            callSidToMonitor: string,
            agentId: number,
            extraMonitoringParams: ExtraMonitoringParams,
            onMonitoringValidationFailed: (
                errorCode: MonitoringErrorCode,
            ) => void,
        ) => {
            // this is necessary to avoid race conditions when switching call from the same tab
            // sometimes the frontend stars the monitoring call before the backend hangs up the previous one
            if (
                currentCall &&
                currentCall.customParameters.get('is_monitoring') === 'true'
            ) {
                currentCall.disconnect()
            }

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
                    onMonitoringValidationFailed(message.data.error_code)
                }
            })

            actions.setCall(call)
        },
        [device, currentCall, dispatch, actions],
    )

    return { prepareMonitoringCall, makeMonitoringCall }
}
