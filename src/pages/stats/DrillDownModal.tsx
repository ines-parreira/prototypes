import React, {FunctionComponent} from 'react'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {
    getDrillDownModalState,
    getDrillDownMetric,
    closeDrillDownModal,
    DrillDownMetric,
    setShouldUseNewFilterData,
} from 'state/ui/stats/drillDownSlice'
import {DrillDownInfoBar} from 'pages/stats/DrillDownInfoBar'
import {
    ConvertMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'state/ui/stats/types'
import {CampaignSalesDrillDownTableContent} from 'pages/stats/convert/components/CampaignSalesDrillDownTableContent'
import {TicketDrillDownTableContent} from 'pages/stats/TicketDrillDownTableContent'
import {getDrillDownHook} from 'pages/stats/DrillDownHookConfig'
import {DrillDownTable} from './DrillDownTable'
import VoiceCallDrillDownTableContent from './voice/components/VoiceCallTable/VoiceCallDrillDownTableContent'

const getTableContent = (
    metricData: DrillDownMetric
): FunctionComponent<{
    metricData: DrillDownMetric
}> => {
    switch (metricData.metricName) {
        case ConvertMetric.CampaignSalesCount:
            return CampaignSalesDrillDownTableContent
        case VoiceMetric.AverageWaitTime:
        case VoiceMetric.AverageTalkTime:
        case VoiceMetric.QueueAverageWaitTime:
        case VoiceMetric.QueueAverageTalkTime:
        case VoiceAgentsMetric.AgentTotalCalls:
        case VoiceAgentsMetric.AgentInboundAnsweredCalls:
        case VoiceAgentsMetric.AgentInboundMissedCalls:
        case VoiceAgentsMetric.AgentOutboundCalls:
        case VoiceAgentsMetric.AgentAverageTalkTime:
            return VoiceCallDrillDownTableContent
        default:
            return TicketDrillDownTableContent
    }
}

export const DrillDownModal = () => {
    const isOpen = useAppSelector(getDrillDownModalState)
    const metricData = useAppSelector(getDrillDownMetric)
    const dispatch = useAppDispatch()

    return isOpen ? (
        <Modal
            size="huge"
            isOpen={isOpen}
            onClose={() => {
                dispatch(closeDrillDownModal())
                dispatch(setShouldUseNewFilterData(false))
            }}
        >
            <ModalHeader title={metricData?.title} />
            <ModalBody className="p-0">
                {metricData !== null && (
                    <>
                        <DrillDownInfoBar
                            metricData={metricData}
                            useDataHook={getDrillDownHook(metricData)}
                        />
                        <DrillDownTable
                            metricData={metricData}
                            useDataHook={getDrillDownHook(metricData)}
                            TableContent={getTableContent(metricData)}
                        />
                    </>
                )}
            </ModalBody>
        </Modal>
    ) : null
}
