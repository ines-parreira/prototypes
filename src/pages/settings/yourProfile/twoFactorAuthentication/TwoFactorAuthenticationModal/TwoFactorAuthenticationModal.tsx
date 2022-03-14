import React, {
    Dispatch,
    SetStateAction,
    useCallback,
    useState,
    useEffect,
} from 'react'
import {AxiosError} from 'axios'
import Modal from '../../../../common/components/Modal'
import css from '../../../../common/components/PrivateReplyToFBComment/PrivateReplyModal/PrivateReplyModal.less'
import {
    saveTwoFASecret as saveTwoFASecretResource,
    validateVerificationCode as validateVerificationCodeResource,
} from '../../../../../models/twoFactorAuthentication/resources'
import Button from '../../../../common/components/button/Button'
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
    const [step, setStep] = useState(3)
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

        if (onCancel) {
            onCancel()
        }
    }, [setIsOpen, onCancel])

    const handleFinish = useCallback(() => {
        setIsOpen(false)

        if (onFinish) {
            onFinish()
        }
    }, [setIsOpen, onFinish])

    const handleBack = useCallback(() => {
        if (step !== 2) {
            return
        }
        resetModalState()

        setStep(step - 1)
    }, [step, resetModalState])

    const validateVerificationCode = useCallback(async () => {
        try {
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
        }
    }, [verificationCode])

    const saveTwoFASecret = useCallback(async () => {
        try {
            setErrorText('')
            await saveTwoFASecretResource()

            return true
        } catch (error) {
            const {response} = error as AxiosError<{error: {msg: string}}>
            if (response) {
                setErrorText(response.data.error.msg)
            }

            console.error(error)
            return
        }
    }, [])

    const handleContinue = useCallback(async () => {
        if (step > 2) {
            return
        }

        if (step === 2) {
            setIsLoading(true)
            const isVerificationCodeValid = await validateVerificationCode()
            if (!isVerificationCodeValid) {
                setIsLoading(false)
                return
            }

            const isTwoFASecretSaved = await saveTwoFASecret()
            if (!isTwoFASecretSaved) {
                setIsLoading(false)
                return
            }

            setIsLoading(false)
        }

        setStep(step + 1)
    }, [step, validateVerificationCode, saveTwoFASecret])

    useEffect(() => {
        resetModalState()
    }, [])

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
                            intent="secondary"
                            onClick={handleCancel}
                            isLoading={isLoading}
                        >
                            Cancel
                        </Button>
                    )}
                    {step === 2 && (
                        <Button
                            intent="secondary"
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
