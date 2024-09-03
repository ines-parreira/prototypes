import React, {Dispatch, SetStateAction} from 'react'
import {
    AuthenticatorData,
    RecoveryCode,
} from '../../../../../models/twoFactorAuthentication/types'
import AppSetupStep from './ModalSteps/AppSetupStep/AppSetupStep'
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
            return <AppSetupStep />
        case 2:
            return (
                <QRCodeStep
                    authenticatorData={authenticatorData}
                    setVerificationCode={setVerificationCode}
                    setUserPassword={setUserPassword}
                    errorText={errorText}
                    setErrorText={setErrorText}
                    setIsLoading={setIsLoading}
                    hasPassword={userHasPassword}
                />
            )
        case 3:
            return (
                <RecoveryCodesStep
                    recoveryCodes={recoveryCodes}
                    setIsRecoveryCodesSaved={setIsRecoveryCodesSaved}
                />
            )
        default:
            return <></>
    }
}
