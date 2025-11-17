import type { FunctionComponent } from 'react'
import React from 'react'

import { DrillDownInfoBar } from 'domains/reporting/pages/common/drill-down/DrillDownInfoBar'
import { DrillDownTable } from 'domains/reporting/pages/common/drill-down/DrillDownTable'
import type { DrillDownHook } from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import {
    DomainsConfig,
    MetricsConfig,
} from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import { getDrillDownMetricColumn } from 'domains/reporting/pages/common/drill-down/helpers'
import type { ColumnConfig } from 'domains/reporting/pages/common/drill-down/types'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    closeDrillDownModal,
    getDrillDownMetric,
    getDrillDownModalState,
} from 'domains/reporting/state/ui/stats/drillDownSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

const getTableContent = (
    metricData: DrillDownMetric,
): FunctionComponent<{
    metricData: DrillDownMetric
    columnConfig: ColumnConfig
}> => DomainsConfig[MetricsConfig[metricData.metricName].domain].tableComponent

export const getDrillDownHook = (metricData: DrillDownMetric): DrillDownHook =>
    DomainsConfig[MetricsConfig[metricData.metricName].domain].drillDownHook

export const getDrillDownConfig = (metricData: DrillDownMetric) =>
    DomainsConfig[MetricsConfig[metricData.metricName].domain]

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
                            domainConfig={getDrillDownConfig(metricData)}
                        />
                        <DrillDownTable
                            metricData={metricData}
                            useDataHook={getDrillDownHook(metricData)}
                            TableContent={getTableContent(metricData)}
                            columnConfig={getDrillDownMetricColumn(
                                metricData,
                                MetricsConfig[metricData.metricName].showMetric,
                            )}
                        />
                    </>
                )}
            </ModalBody>
        </Modal>
    ) : null
}
