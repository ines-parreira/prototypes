import { useCallback, useEffect, useRef, useState } from 'react'

import { Button, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import type { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import {
    getMonitoringParameters,
    getMonitoringRestrictionReason,
} from 'hooks/integrations/phone/monitoring.utils'
import { useMonitoringCall } from 'hooks/integrations/phone/useMonitoringCall'
import { useNotify } from 'hooks/useNotify'
import type { VoiceCall } from 'models/voiceCall/types'
import { MonitoringErrorCode } from 'models/voiceCall/types'
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
    const [isLoading, setIsLoading] = useState(false)
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
            setIsLoading(false)
        },
        [notify, voiceCallToMonitor.direction],
    )

    const isCurrentlyMonitoring = isCallBeingMonitored(
        voiceCallToMonitor,
        agentId,
    )

    useEffect(() => {
        if (isCurrentlyMonitoring) {
            setIsLoading(false)
            setIsSwitchModalOpen(false)
        }
    }, [isCurrentlyMonitoring])

    const { callSidToMonitor, monitoringExtraParams } =
        getMonitoringParameters(voiceCallToMonitor)

    const prepareAndMakeMonitoringCall = async (
        offerSwitch: boolean = false,
    ) => {
        setIsLoading(true)
        const result = await prepareMonitoringCall(
            callSidToMonitor,
            !offerSwitch,
        )

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
            offerSwitch &&
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
        setIsLoading(false)
    }

    const handleListenPress = () => {
        prepareAndMakeMonitoringCall(true)
    }

    const handleConfirmSwitch = () => {
        setIsSwitchModalOpen(false)
        prepareAndMakeMonitoringCall(false)
    }

    const handleCancelSwitch = () => {
        setIsSwitchModalOpen(false)
        setIsLoading(false)
    }

    if (isCurrentlyMonitoring) {
        return <span>Listening...</span>
    }

    return (
        <>
            <Button
                ref={buttonRef}
                variant="tertiary"
                size="sm"
                leadingSlot="headset"
                isDisabled={!isMonitorable}
                isLoading={isLoading}
                onClick={handleListenPress}
            >
                Listen
            </Button>
            {reason && <Tooltip target={buttonRef}>{reason}</Tooltip>}
            <MonitoringCallSwitchModal
                isOpen={isSwitchModalOpen}
                onClose={handleCancelSwitch}
                onConfirm={handleConfirmSwitch}
                newMonitoredAgentId={getInCallAgentId(voiceCallToMonitor)}
            />
        </>
    )
}
