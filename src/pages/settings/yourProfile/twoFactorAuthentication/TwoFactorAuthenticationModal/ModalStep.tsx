import React, {Dispatch, SetStateAction} from 'react'
import {
    AuthenticatorData,
    RecoveryCode,
} from '../../../../../models/twoFactorAuthentication/types'
import QRCodeStep from './ModalSteps/QRCodeStep/QRCodeStep'
import ValidateVerificationCodeStep from './ModalSteps/ValidateVerificationCodeStep/ValidateVerificationCodeStep'
import RecoveryCodesStep from './ModalSteps/RecoveryCodesStep/RecoveryCodesStep'

type OwnProps = {
    currentStep: number
    authenticatorData: AuthenticatorData
    errorText?: string
    setErrorText: Dispatch<SetStateAction<string>>
    setVerificationCode: Dispatch<SetStateAction<string>>
    setUserPassword: Dispatch<SetStateAction<string>>
    setIsLoading: Dispatch<SetStateAction<boolean>>
    recoveryCodes: RecoveryCode[]
    isRecoveryCodesSaved: boolean
    userHasPassword: boolean
    setIsRecoveryCodesSaved: Dispatch<SetStateAction<boolean>>
}

export default function ModalStep({
    currentStep,
    authenticatorData,
    errorText,
    setErrorText,
    setVerificationCode,
    setUserPassword,
    setIsLoading,
    recoveryCodes,
    isRecoveryCodesSaved,
    userHasPassword,
    setIsRecoveryCodesSaved,
}: OwnProps) {
    switch (currentStep) {
        case 0:
            return (
                <ValidateVerificationCodeStep
                    setVerificationCode={setVerificationCode}
                    setUserPassword={setUserPassword}
                    setErrorText={setErrorText}
                    isUpdate={true}
                    hasPassword={userHasPassword}
                />
            )
        case 1:
            return (
                <QRCodeStep
                    authenticatorData={authenticatorData}
                    errorText={errorText}
                    setErrorText={setErrorText}
                    setIsLoading={setIsLoading}
                />
            )
        case 2:
            return (
                <ValidateVerificationCodeStep
                    setVerificationCode={setVerificationCode}
                    setUserPassword={setUserPassword}
                    setErrorText={setErrorText}
                    hasPassword={userHasPassword}
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
