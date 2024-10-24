import classNames from 'classnames'
import React from 'react'
import {ModalFooter, ModalHeader} from 'reactstrap'

import Button from 'pages/common/components/button/Button'
import ModalBody from 'pages/common/components/modal/ModalBody'

import css from './AutomateSubscriptionModal.less'
import ROICalculator from './ROICalculator/ROICalculator'

type Props = {
    handleOnClose: () => void
    onSelectPlanClick: () => void
}
const ROICalculatorModalStep = ({handleOnClose, onSelectPlanClick}: Props) => (
    <>
        <ModalHeader toggle={handleOnClose}>
            Calculate Potential ROI
        </ModalHeader>
        <ModalBody className={css.modalBody}>
            <ROICalculator />
        </ModalBody>
        <ModalFooter className={classNames(css.footer, css.footerSpaceBetween)}>
            <span className={css.step}>Step 1 of 2</span>
            <div className={css.ROIButtons}>
                <Button onClick={handleOnClose} intent="secondary">
                    Cancel
                </Button>
                <Button intent="primary" onClick={onSelectPlanClick}>
                    Select Plan
                </Button>
            </div>
        </ModalFooter>
    </>
)

export default ROICalculatorModalStep
