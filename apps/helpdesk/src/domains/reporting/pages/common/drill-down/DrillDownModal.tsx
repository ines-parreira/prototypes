import type { FunctionComponent } from 'react'
import React from 'react'

import cn from 'classnames'

import { Box, Button, Icon, Modal, ModalSize } from '@gorgias/axiom'

import { DrillDownInfoBar } from 'domains/reporting/pages/common/drill-down/DrillDownInfoBar'
import css from 'domains/reporting/pages/common/drill-down/DrillDownModal.less'
import { DrillDownTable } from 'domains/reporting/pages/common/drill-down/DrillDownTable'
import type { DrillDownHook } from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import {
    DomainsConfig,
    MetricsConfig,
} from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import { getDrillDownMetricColumn } from 'domains/reporting/pages/common/drill-down/helpers'
import { LegacyDrillDownInfoBar } from 'domains/reporting/pages/common/drill-down/LegacyDrillDownInfoBar'
import { LegacyDrillDownTable } from 'domains/reporting/pages/common/drill-down/LegacyDrillDownTable'
import type { ColumnConfig } from 'domains/reporting/pages/common/drill-down/types'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    closeDrillDownModal,
    getDrillDownMetric,
    getDrillDownModalState,
} from 'domains/reporting/state/ui/stats/drillDownSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import LegacyModal from 'pages/common/components/modal/Modal'
import LegacyModalBody from 'pages/common/components/modal/ModalBody'
import LegacyModalHeader from 'pages/common/components/modal/ModalHeader'

const getTableContent = (
    metricData: DrillDownMetric,
    isLegacy: boolean = true,
): FunctionComponent<{
    metricData: DrillDownMetric
    columnConfig: ColumnConfig
}> => {
    const domainConfig =
        DomainsConfig[MetricsConfig[metricData.metricName].domain]
    return isLegacy
        ? domainConfig.legacyTableComponent
        : domainConfig.tableComponent
}

export const getDrillDownHook = (metricData: DrillDownMetric): DrillDownHook =>
    DomainsConfig[MetricsConfig[metricData.metricName].domain].drillDownHook

export const getDrillDownConfig = (metricData: DrillDownMetric) =>
    DomainsConfig[MetricsConfig[metricData.metricName].domain]

interface DrillDownModalProps {
    isLegacy?: boolean
}

export const DrillDownModal = ({ isLegacy = true }: DrillDownModalProps) => {
    const isOpen = useAppSelector(getDrillDownModalState)
    const metricData = useAppSelector(getDrillDownMetric)
    const dispatch = useAppDispatch()

    if (!isOpen) return null

    if (isLegacy) {
        return (
            <LegacyModal
                size="huge"
                isOpen={isOpen}
                onClose={() => {
                    dispatch(closeDrillDownModal())
                }}
            >
                <LegacyModalHeader title={metricData?.title} />
                <LegacyModalBody className="p-0">
                    {metricData !== null && (
                        <>
                            <LegacyDrillDownInfoBar
                                metricData={metricData}
                                useDataHook={getDrillDownHook(metricData)}
                                domainConfig={getDrillDownConfig(metricData)}
                            />
                            <LegacyDrillDownTable
                                metricData={metricData}
                                useDataHook={getDrillDownHook(metricData)}
                                TableContent={getTableContent(metricData, true)}
                                columnConfig={getDrillDownMetricColumn(
                                    metricData,
                                    MetricsConfig[metricData.metricName]
                                        .showMetric,
                                )}
                            />
                        </>
                    )}
                </LegacyModalBody>
            </LegacyModal>
        )
    }

    return (
        <Modal
            size={ModalSize.Xl}
            isOpen={isOpen}
            onOpenChange={(isOpen: boolean) => {
                if (!isOpen) {
                    dispatch(closeDrillDownModal())
                }
            }}
        >
            {metricData !== null && (
                <>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        gap="md"
                        marginBottom="md"
                    >
                        <h1 className={cn('typography-heading-md', css.title)}>
                            {metricData.title}
                        </h1>
                        <Button
                            icon={<Icon name="close" />}
                            variant="tertiary"
                            size="md"
                            aria-label="Close modal"
                            onClick={() => dispatch(closeDrillDownModal())}
                        />
                    </Box>
                    <DrillDownInfoBar
                        metricData={metricData}
                        useDataHook={getDrillDownHook(metricData)}
                        domainConfig={getDrillDownConfig(metricData)}
                    />
                    <DrillDownTable
                        metricData={metricData}
                        TableContent={getTableContent(metricData, false)}
                        columnConfig={getDrillDownMetricColumn(
                            metricData,
                            MetricsConfig[metricData.metricName].showMetric,
                        )}
                    />
                </>
            )}
        </Modal>
    )
}
