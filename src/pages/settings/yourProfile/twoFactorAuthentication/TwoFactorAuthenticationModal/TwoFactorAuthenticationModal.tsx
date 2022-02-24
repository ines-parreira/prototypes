import React, {Dispatch, SetStateAction, useCallback, useState} from 'react'
import {AxiosError} from 'axios'
import Modal from '../../../../common/components/Modal'
import css from '../../../../common/components/PrivateReplyToFBComment/PrivateReplyModal/PrivateReplyModal.less'
import {validateVerificationCode as validateVerificationCodeResource} from '../../../../../models/twoFactorAuthentication/resources'
import Button, {ButtonIntent} from '../../../../common/components/button/Button'
import ModalContinueButton from './ModalContinueButton'
import ModalStep from './ModalStep'
import ModalBanners from './ModalBanners'

export type OwnProps = {
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
    const [errorText, setErrorText] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const resetModalState = useCallback(() => {
        setStep(1)
        setErrorText('')
        setVerificationCode('')
    }, [])

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
        resetModalState()

        setStep(step - 1)
    }, [step, resetModalState])

    const validateVerificationCode = useCallback(async () => {
        try {
            setIsLoading(true)
            setErrorText('')

            await validateVerificationCodeResource(verificationCode)

            return true
        } catch (error) {
            const {response} = error as AxiosError<{error: {msg: string}}>
            if (response) {
                setErrorText(response.data.error.msg)
            }

            console.error(error)
            return
        } finally {
            setIsLoading(false)
        }
    }, [verificationCode])

    const handleContinue = useCallback(async () => {
        if (step > 2) {
            return
        }

        if (step === 2) {
            const isVerificationCodeValid = await validateVerificationCode()
            if (!isVerificationCodeValid) {
                return
            }
        }

        setStep(step + 1)
    }, [step, validateVerificationCode])

    return (
        <Modal
            isOpen={isOpen}
            header="Setup 2FA"
            onClose={handleCancel}
            style={{maxWidth: '600px'}}
            footerClassName={css['modal-footer']}
            bodyClassName={css['modal-body']}
            footer={
                <>
                    {step === 1 && (
                        <Button
                            type="button"
                            intent={ButtonIntent.Secondary}
                            onClick={handleCancel}
                            isLoading={isLoading}
                        >
                            Cancel
                        </Button>
                    )}
                    {step === 2 && (
                        <Button
                            type="button"
                            intent={ButtonIntent.Secondary}
                            onClick={handleBack}
                            isLoading={isLoading}
                        >
                            Back
                        </Button>
                    )}
                    <ModalContinueButton
                        currentStep={step}
                        isLoading={isLoading}
                        hasError={
                            !!errorText || (step === 2 && !verificationCode)
                        }
                        onContinue={handleContinue}
                        onFinish={handleFinish}
                    />
                </>
            }
            dismissible={false}
        >
            <ModalBanners currentStep={step} errorText={errorText} />
            <ModalStep
                currentStep={step}
                errorText={errorText}
                setErrorText={setErrorText}
                setVerificationCode={setVerificationCode}
                setIsLoading={setIsLoading}
            />
        </Modal>
    )
}
