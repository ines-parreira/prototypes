import { useCallback, useRef, useState } from 'react'

import { Button, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import {
    getMonitoringParameters,
    getMonitoringRestrictionReason,
} from 'hooks/integrations/phone/monitoring.utils'
import { useMonitoringCall } from 'hooks/integrations/phone/useMonitoringCall'
import { useNotify } from 'hooks/useNotify'
import { MonitoringErrorCode, VoiceCall } from 'models/voiceCall/types'
import { getInCallAgentId, isCallBeingMonitored } from 'models/voiceCall/utils'
import MonitoringCallSwitchModal from 'pages/common/components/MonitoringCallSwitchModal/MonitoringCallSwitchModal'

type MonitorCallButtonProps = {
    voiceCallToMonitor: VoiceCall | VoiceCallSummary
    agentId: number
    isMonitorable?: boolean
    reason?: string
}

export default function MonitorCallButton({
    voiceCallToMonitor,
    agentId,
    isMonitorable = true,
    reason,
}: MonitorCallButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false)
    const notify = useNotify()

    const { prepareMonitoringCall, makeMonitoringCall } = useMonitoringCall()

    const showMonitoringError = useCallback(
        (errorCode: MonitoringErrorCode) => {
            notify.error(
                getMonitoringRestrictionReason(
                    errorCode,
                    voiceCallToMonitor.direction,
                ),
            )
        },
        [notify, voiceCallToMonitor.direction],
    )

    if (isCallBeingMonitored(voiceCallToMonitor, agentId)) {
        return <span>Listening...</span>
    }

    const { callSidToMonitor, monitoringExtraParams } =
        getMonitoringParameters(voiceCallToMonitor)

    const handleListenPress = async () => {
        const result = await prepareMonitoringCall(callSidToMonitor)

        if (result.readyForMonitoring) {
            makeMonitoringCall(
                callSidToMonitor,
                agentId,
                monitoringExtraParams,
                showMonitoringError,
            )
            return
        }

        if (
            result.errorType === 'error_code' &&
            result.errorCode === MonitoringErrorCode.ALREADY_MONITORING_CALL
        ) {
            setIsSwitchModalOpen(true)
            return
        }

        if (result.errorType === 'error_code') {
            showMonitoringError(result.errorCode)
        } else if (result.errorType === 'error_message') {
            notify.error(result.errorMessage)
        }
    }

    const handleConfirmSwitch = async () => {
        setIsSwitchModalOpen(false)
        const result = await prepareMonitoringCall(callSidToMonitor, true)

        if (result.readyForMonitoring) {
            makeMonitoringCall(
                callSidToMonitor,
                agentId,
                monitoringExtraParams,
                showMonitoringError,
            )
            return
        }

        if (result.errorType === 'error_code') {
            showMonitoringError(result.errorCode)
        } else if (result.errorType === 'error_message') {
            notify.error(result.errorMessage)
        }
    }

    return (
        <>
            <Button
                ref={buttonRef}
                variant="tertiary"
                size="sm"
                leadingSlot="headset_mic"
                isDisabled={!isMonitorable}
                onPress={handleListenPress}
            >
                Listen
            </Button>
            {reason && <Tooltip target={buttonRef}>{reason}</Tooltip>}
            <MonitoringCallSwitchModal
                isOpen={isSwitchModalOpen}
                onClose={() => setIsSwitchModalOpen(false)}
                onConfirm={handleConfirmSwitch}
                newMonitoredAgentId={getInCallAgentId(voiceCallToMonitor)}
            />
        </>
    )
}
