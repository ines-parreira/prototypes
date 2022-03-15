import React, {Dispatch, SetStateAction} from 'react'
import {RecoveryCode} from '../../../../../models/twoFactorAuthentication/types'
import QRCodeStep from './ModalSteps/QRCodeStep/QRCodeStep'
import ValidateVerificationCodeStep from './ModalSteps/ValidateVerificationCodeStep/ValidateVerificationCodeStep'
import RecoveryCodesStep from './ModalSteps/RecoveryCodesStep/RecoveryCodesStep'

type OwnProps = {
    currentStep: number
    errorText?: string
    setErrorText: Dispatch<SetStateAction<string>>
    setVerificationCode: Dispatch<SetStateAction<string>>
    setIsLoading: Dispatch<SetStateAction<boolean>>
    recoveryCodes: RecoveryCode[]
    isRecoveryCodesSaved: boolean
    setIsRecoveryCodesSaved: Dispatch<SetStateAction<boolean>>
}

export default function ModalStep({
    currentStep,
    errorText,
    setErrorText,
    setVerificationCode,
    setIsLoading,
    recoveryCodes,
    isRecoveryCodesSaved,
    setIsRecoveryCodesSaved,
}: OwnProps) {
    switch (currentStep) {
        case 1:
            return (
                <QRCodeStep
                    errorText={errorText}
                    setErrorText={setErrorText}
                    setIsLoading={setIsLoading}
                />
            )
        case 2:
            return (
                <ValidateVerificationCodeStep
                    setVerificationCode={setVerificationCode}
                    setErrorText={setErrorText}
                />
            )
        case 3:
            return (
                <RecoveryCodesStep
                    recoveryCodes={recoveryCodes}
                    isRecoveryCodesSaved={isRecoveryCodesSaved}
                    setIsRecoveryCodesSaved={setIsRecoveryCodesSaved}
                />
            )
        default:
            return <></>
    }
}
