import {Button} from 'reactstrap'
import React, {Dispatch, SetStateAction, useCallback, useState} from 'react'
import Modal from '../../../../common/components/Modal'
import css from '../../../../common/components/PrivateReplyToFBComment/PrivateReplyModal/PrivateReplyModal.less'
import ModalContinueButton from './ModalContinueButton'
import ModalStep from './ModalStep'

type OwnProps = {
    isOpen: boolean
    setIsOpen: Dispatch<SetStateAction<boolean>>
    onCancel?: () => void
    onFinish?: () => void
}

export default function TwoFactorAuthenticationModal({
    isOpen,
    setIsOpen,
    onCancel,
    onFinish,
}: OwnProps) {
    const [step, setStep] = useState(1)

    const resetModalState = useCallback(() => {
        setStep(1)
    }, [setStep])

    const handleCancel = useCallback(() => {
        setIsOpen(false)
        resetModalState()

        if (onCancel) {
            onCancel()
        }
    }, [setIsOpen, resetModalState, onCancel])

    const handleFinish = useCallback(() => {
        setIsOpen(false)
        resetModalState()

        if (onFinish) {
            onFinish()
        }
    }, [setIsOpen, resetModalState, onFinish])

    const handleBack = useCallback(() => {
        if (step !== 2) {
            return
        }

        setStep(step - 1)
    }, [step, setStep])

    const handleContinue = useCallback(() => {
        if (step >= 3) {
            return
        }

        setStep(step + 1)
    }, [step, setStep])

    return (
        <Modal
            isOpen={isOpen}
            header="Setup 2FA"
            onClose={handleCancel}
            style={{maxWidth: '400px'}}
            footerClassName={css['modal-footer']}
            bodyClassName={css['modal-body']}
            footer={
                <>
                    {step === 1 && (
                        <Button onClick={handleCancel}>Cancel</Button>
                    )}
                    {step === 2 && <Button onClick={handleBack}>Back</Button>}
                    <ModalContinueButton
                        currentStep={step}
                        onContinue={handleContinue}
                        onFinish={handleFinish}
                    />
                </>
            }
            dismissible={false}
        >
            <ModalStep currentStep={step} />
        </Modal>
    )
}
