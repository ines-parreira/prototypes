import classNames from 'classnames'
import { ModalFooter, ModalHeader } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import ModalBody from 'pages/common/components/modal/ModalBody'

import ROICalculator from './ROICalculator/ROICalculator'

import css from './AutomateSubscriptionModal.less'

type Props = {
    handleOnClose: () => void
    onSelectPlanClick: () => void
}
const ROICalculatorModalStep = ({
    handleOnClose,
    onSelectPlanClick,
}: Props) => (
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
