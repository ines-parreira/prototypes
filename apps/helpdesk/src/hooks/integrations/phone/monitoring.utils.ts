import { Call } from '@twilio/voice-sdk'
import { Map } from 'immutable'

import { VoiceCallDirection } from '@gorgias/helpdesk-types'

import { User, UserRole } from 'config/types/user'
import { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { MONITORING_RESTRICTION_REASONS } from 'models/voiceCall/constants'
import { VoiceCall } from 'models/voiceCall/types'
import {
    isCallAnsweredByExternalNumber,
    isCallBeingMonitored,
    isCallBeingTransferredToQueue,
    isCallInProgress,
} from 'models/voiceCall/utils'
import { hasRole } from 'utils'

export function canMonitorCall(user: Map<any, any>) {
    return hasRole(user, UserRole.Admin) || hasRole(user, UserRole.Agent)
}

export function getCallMonitorability(
    voiceCall: VoiceCall | VoiceCallSummary,
    currentAgentId: number,
    inCallAgent: User | undefined,
): {
    isMonitorable: boolean
    reason?: string
} {
    if (!isCallInProgress(voiceCall)) {
        return {
            isMonitorable: false,
            reason:
                voiceCall.direction === 'inbound'
                    ? MONITORING_RESTRICTION_REASONS.NOT_IN_PROGRESS
                    : MONITORING_RESTRICTION_REASONS.NOT_YET_CONNECTED,
        }
    }

    if (isCallBeingTransferredToQueue(voiceCall)) {
        return {
            isMonitorable: false,
            reason: MONITORING_RESTRICTION_REASONS.TRANSFERRING_TO_QUEUE,
        }
    }

    if (isCallAnsweredByExternalNumber(voiceCall)) {
        return {
            isMonitorable: false,
            reason: MONITORING_RESTRICTION_REASONS.ANSWERED_BY_EXTERNAL_NUMBER,
        }
    }

    if (inCallAgent?.id === currentAgentId) {
        return {
            isMonitorable: false,
            reason: MONITORING_RESTRICTION_REASONS.HANDLING_CALL,
        }
    }

    if (inCallAgent?.role?.name === UserRole.Admin) {
        return {
            isMonitorable: false,
            reason: MONITORING_RESTRICTION_REASONS.CALL_HANDLED_BY_ADMIN,
        }
    }

    if (isCallBeingMonitored(voiceCall)) {
        return {
            isMonitorable: false,
            reason: MONITORING_RESTRICTION_REASONS.ALREADY_MONITORED,
        }
    }

    return { isMonitorable: true }
}

function parseCustomParameterAsInt(
    call: Call,
    parameterName: string,
): number | null {
    const paramValue = call.customParameters.get(parameterName) as string
    return paramValue && paramValue !== 'null' ? parseInt(paramValue, 10) : null
}

export function extractMonitoringCallParams(call: Call): {
    integrationId: number | null
    inCallAgentId: number | null
    customerId: number | null
    customerPhoneNumber: string
} {
    return {
        integrationId: parseCustomParameterAsInt(call, 'integration_id'),
        inCallAgentId: parseCustomParameterAsInt(call, 'in_call_agent_id'),
        customerId: parseCustomParameterAsInt(call, 'customer_id'),
        customerPhoneNumber: call.customParameters.get(
            'customer_phone_number',
        ) as string,
    }
}

const isVoiceCall = (
    voiceCall: VoiceCall | VoiceCallSummary,
): voiceCall is VoiceCall => {
    return 'external_id' in voiceCall
}

export function getMonitoringParameters(
    voiceCallToMonitor: VoiceCall | VoiceCallSummary,
): {
    callSidToMonitor: string
    monitoringExtraParams: {
        integrationId: number | null
        customerId: number | null
        customerPhoneNumber: string
        inCallAgentId: number | null
    }
} {
    const callSidToMonitor = isVoiceCall(voiceCallToMonitor)
        ? voiceCallToMonitor.external_id
        : voiceCallToMonitor.callSid
    const monitoringExtraParams = isVoiceCall(voiceCallToMonitor)
        ? {
              integrationId: voiceCallToMonitor.integration_id,
              customerId: voiceCallToMonitor.customer_id,
              customerPhoneNumber:
                  voiceCallToMonitor.direction === VoiceCallDirection.Inbound
                      ? voiceCallToMonitor.phone_number_source
                      : voiceCallToMonitor.phone_number_destination,
              inCallAgentId:
                  voiceCallToMonitor.last_answered_by_agent_id ??
                  voiceCallToMonitor.initiated_by_agent_id ??
                  null,
          }
        : {
              integrationId: voiceCallToMonitor.integrationId ?? null,
              customerId: voiceCallToMonitor.customerId ?? null,
              customerPhoneNumber:
                  voiceCallToMonitor.direction === VoiceCallDirection.Inbound
                      ? voiceCallToMonitor.phoneNumberSource
                      : voiceCallToMonitor.phoneNumberDestination,
              inCallAgentId: voiceCallToMonitor.agentId ?? null,
          }

    return { callSidToMonitor, monitoringExtraParams }
}
