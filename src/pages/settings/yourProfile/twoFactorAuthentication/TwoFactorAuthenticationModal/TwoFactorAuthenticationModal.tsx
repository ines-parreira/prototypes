import React, {
    Dispatch,
    SetStateAction,
    useCallback,
    useState,
    useEffect,
} from 'react'
import {AxiosError} from 'axios'
import Modal from 'pages/common/components/Modal'
import {
    saveTwoFASecret as saveTwoFASecretResource,
    validateVerificationCode as validateVerificationCodeResource,
    createRecoveryCodes as createRecoveryCodesResource,
    renewRecoveryCodes as renewRecoveryCodesResource,
    fetchAuthenticatorData as fetchAuthenticatorDataResource,
    fetchAuthenticatorDataRenewed as fetchAuthenticatorDataRenewedResource,
} from 'models/twoFactorAuthentication/resources'
import Button from 'pages/common/components/button/Button'
import useAppDispatch from 'hooks/useAppDispatch'
import {update2FAEnabled} from 'state/currentUser/actions'
import {
    AuthenticatorData,
    RecoveryCode,
} from 'models/twoFactorAuthentication/types'
import useAppSelector from 'hooks/useAppSelector'
import {has2FaEnabled as has2FaEnabledSelector} from 'state/currentUser/selectors'
import css from './TwoFactorAuthenticationModal.less'
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
    const dispatch = useAppDispatch()
    const has2FaEnabled = useAppSelector(has2FaEnabledSelector)

    const [step, setStep] = useState(1)
    const [authenticatorData, setAuthenticatorData] = useState(
        {} as AuthenticatorData
    )
    const [isEnforced, setIsEnforced] = useState(false)
    const [errorText, setErrorText] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [recoveryCodes, setRecoveryCodes] = useState([] as RecoveryCode[])
    const [isRecoveryCodesSaved, setIsRecoveryCodesSaved] = useState(false)

    const resetModalState = useCallback(() => {
        setStep(1)
        setIsEnforced(false) // TODO(@ionut): fetch this from api when adding enforcing mechanism
        setErrorText('')
        setVerificationCode('')
        setIsLoading(false)
        setRecoveryCodes([] as RecoveryCode[])
        setIsRecoveryCodesSaved(false)
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

    const createRecoveryCodes = useCallback(async () => {
        try {
            setErrorText('')

            if (has2FaEnabled) {
                setRecoveryCodes(await renewRecoveryCodesResource())
            } else {
                setRecoveryCodes(await createRecoveryCodesResource())
            }

            return true
        } catch (error) {
            const {response} = error as AxiosError<{error: {msg: string}}>
            if (response) {
                setErrorText(response.data.error.msg)
            }

            console.error(error)
            return
        }
    }, [has2FaEnabled])

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

            const isRecoveryCodesCreated = await createRecoveryCodes()
            if (!isRecoveryCodesCreated) {
                setIsLoading(false)
                return
            }

            void dispatch(update2FAEnabled(true))
            setIsLoading(false)
        }

        setStep(step + 1)
    }, [
        dispatch,
        step,
        validateVerificationCode,
        saveTwoFASecret,
        createRecoveryCodes,
    ])

    useEffect(() => {
        async function init() {
            setIsLoading(true)
            setErrorText('')

            if (has2FaEnabled) {
                setAuthenticatorData(
                    await fetchAuthenticatorDataRenewedResource()
                )
            } else {
                setAuthenticatorData(await fetchAuthenticatorDataResource())
            }
        }

        init()
            .catch((error: Error) => {
                setErrorText('Failed to fetch the QR code. Please try again.')
                console.error(error)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [has2FaEnabled, resetModalState])

    return (
        <Modal
            isOpen={isOpen}
            header="Setup 2FA"
            headerClassName={isEnforced ? css.hideCloseButton : ''}
            onClose={handleCancel}
            dismissible={!isEnforced}
            backdrop="static"
            style={{maxWidth: '600px'}}
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
                            !!errorText ||
                            (step === 2 && !verificationCode) ||
                            (step === 3 && !isRecoveryCodesSaved)
                        }
                        onContinue={handleContinue}
                        onFinish={handleFinish}
                    />
                </>
            }
        >
            <ModalBanners
                currentStep={step}
                errorText={errorText}
                isEnforced={isEnforced}
            />
            <ModalStep
                authenticatorData={authenticatorData}
                currentStep={step}
                errorText={errorText}
                setErrorText={setErrorText}
                setVerificationCode={setVerificationCode}
                setIsLoading={setIsLoading}
                recoveryCodes={recoveryCodes}
                isRecoveryCodesSaved={isRecoveryCodesSaved}
                setIsRecoveryCodesSaved={setIsRecoveryCodesSaved}
            />
        </Modal>
    )
}
