import React, { ReactNode, useCallback, useState } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useDashboardActions } from 'domains/reporting/hooks/dashboards/useDashboardActions'
import { useDashboardNameValidation } from 'domains/reporting/hooks/dashboards/useDashboardNameValidation'
import css from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu.less'
import {
    DashboardName,
    DashboardNameValue,
} from 'domains/reporting/pages/dashboards/DashboardName'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

export const CREATE_DASHBOARD = 'Create Dashboard'

export const getModalTitle = (chartName: ReactNode) =>
    `Add ${chartName?.toString()} to new Dashboard`
export const DASHBOARD_NAME = 'Dashboard Name'

export const AddChartToDashboardModal = ({
    closeModal,
    chartName,
    chartId,
}: {
    closeModal: () => void
    chartName: ReactNode
    chartId: string
}) => {
    const [dashboard, setDashboard] = useState<DashboardNameValue>({
        name: '',
        emoji: '',
    })

    const { error, isValid } = useDashboardNameValidation(dashboard.name)

    const { createDashboardHandler } = useDashboardActions()

    const handleCreateDashboard = useCallback(() => {
        if (isValid) {
            createDashboardHandler({
                dashboard,
                chartIds: [chartId],
                onSuccess: closeModal,
            })
        }
    }, [isValid, createDashboardHandler, dashboard, chartId, closeModal])

    return (
        <Modal isOpen onClose={closeModal} size="medium" isClosable={false}>
            <ModalHeader title={getModalTitle(chartName)} />
            <ModalBody>
                <p className={css.dashboardName}>{DASHBOARD_NAME}</p>
                <DashboardName
                    value={dashboard}
                    onChange={setDashboard}
                    error={error}
                    autoFocus
                />
            </ModalBody>
            <ModalActionsFooter>
                <Button onClick={closeModal} intent="secondary">
                    Cancel
                </Button>
                <Button onClick={handleCreateDashboard}>
                    {CREATE_DASHBOARD}
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
