import React, { FunctionComponent } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import { DrillDownInfoBar } from 'pages/stats/common/drill-down/DrillDownInfoBar'
import { DrillDownTable } from 'pages/stats/common/drill-down/DrillDownTable'
import {
    DomainsConfig,
    DrillDownHook,
    MetricsConfig,
} from 'pages/stats/common/drill-down/DrillDownTableConfig'
import {
    closeDrillDownModal,
    DrillDownMetric,
    getDrillDownMetric,
    getDrillDownModalState,
} from 'state/ui/stats/drillDownSlice'

const getTableContent = (
    metricData: DrillDownMetric,
): FunctionComponent<{
    metricData: DrillDownMetric
}> => DomainsConfig[MetricsConfig[metricData.metricName].domain].tableComponent

export const getDrillDownHook = (metricData: DrillDownMetric): DrillDownHook =>
    DomainsConfig[MetricsConfig[metricData.metricName].domain].drillDownHook

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
