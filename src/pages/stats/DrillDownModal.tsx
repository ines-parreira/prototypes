import React from 'react'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {
    getDrillDownModalState,
    getDrillDownMetric,
    closeDrillDownModal,
} from 'state/ui/stats/drillDownSlice'
import {DrillDownInfoBar} from 'pages/stats/DrillDownInfoBar'
import {DrillDownTable} from './DrillDownTable'

export const DrillDownModal = () => {
    const isOpen = useAppSelector(getDrillDownModalState)
    const {metricData} = useAppSelector(getDrillDownMetric)
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
                        <DrillDownInfoBar metricData={metricData} />
                        <DrillDownTable metricData={metricData} />
                    </>
                )}
            </ModalBody>
        </Modal>
    ) : null
}
