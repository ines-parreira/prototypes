import { Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import CheckBox from 'pages/common/forms/CheckBox'
import TextArea from 'pages/common/forms/TextArea'

import { Reason } from './CancelAAOModal'

import css from './CancelAAOModal.less'

export type ReasonsAAOModalProps = {
    isOpen: boolean
    handleOnClose: () => void
    reasons: Reason[]
    message: string
    updateReasons: (index: number) => void
    setMessage: (message: string) => void
    periodEnd: string
    handleConfirmCancelation: () => void
}

const ReasonsAAOModal = ({
    isOpen,
    handleOnClose,
    reasons,
    message,
    updateReasons,
    setMessage,
    periodEnd,
    handleConfirmCancelation,
}: ReasonsAAOModalProps) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={handleOnClose}
            classNameDialog={css.container}
        >
            <ModalHeader title="Let us know why you're changing your subscription" />
            <ModalBody>
                <div className={css.ctaSelect}>
                    Select all reasons that apply
                    <span>*</span>
                </div>
                <div className={css.reasons}>
                    {reasons.map((reason, index) => (
                        <div className={css.reason} key={reason.label}>
                            <CheckBox
                                onChange={() => updateReasons(index)}
                                isChecked={reason.value}
                            >
                                {reason.label}
                            </CheckBox>
                        </div>
                    ))}
                </div>
                <div className={css.additionalDetails}>
                    <div className={css.ctaAdditionalDetails}>
                        Please share any additional details
                        <span>*</span>
                    </div>
                    <TextArea
                        placeholder="It didn't work out for me because..."
                        value={message}
                        rows={4}
                        onChange={setMessage}
                    />
                </div>
                <div className={css.disclaimer}>
                    To remove AI Agent from your subscription, you must click{' '}
                    <b>Update Subscription</b> on the following page. Once
                    updated, you will still have access to AI Agent features
                    until <b>{periodEnd}</b>.
                </div>
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={handleOnClose}>
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirmCancelation}
                    isDisabled={!message || !reasons.some((r) => r.value)}
                >
                    Submit
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default ReasonsAAOModal
