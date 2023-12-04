import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {
    toggleDrillDownModal,
    getDrillDownModalState,
    getDrillDownMetric,
} from 'state/ui/stats/drillDownSlice'
import {DrillDownTable} from './DrillDownTable'
import {DrillDownInfobar} from './DrillDownInfobar'

export const DrillDownModal = () => {
    const isOpen = useAppSelector(getDrillDownModalState)
    const {metricData} = useAppSelector(getDrillDownMetric)
    const dispatch = useAppDispatch()

    const hasAnalyticsDrillDown: boolean =
        useFlags()[FeatureFlagKey.AnalyticsDrillDown]

    return hasAnalyticsDrillDown && isOpen ? (
        <Modal
            size="huge"
            isOpen={isOpen}
            onClose={() => {
                dispatch(toggleDrillDownModal())
            }}
        >
            <ModalHeader title={metricData?.title} />
            <ModalBody className="p-0">
                {metricData !== null && (
                    <>
                        <DrillDownInfobar metricData={metricData} />
                        <DrillDownTable metricData={metricData} />
                    </>
                )}
            </ModalBody>
        </Modal>
    ) : null
}
