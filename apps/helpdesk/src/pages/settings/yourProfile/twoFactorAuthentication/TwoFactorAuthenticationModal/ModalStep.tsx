import type { Dispatch, SetStateAction } from 'react'
import React from 'react'

import type {
    AuthenticatorData,
    RecoveryCode,
} from '../../../../../models/twoFactorAuthentication/types'
import AppSetupStep from './ModalSteps/AppSetupStep/AppSetupStep'
import QRCodeStep from './ModalSteps/QRCodeStep/QRCodeStep'
import RecoveryCodesStep from './ModalSteps/RecoveryCodesStep/RecoveryCodesStep'
import ValidateVerificationCodeStep from './ModalSteps/ValidateVerificationCodeStep/ValidateVerificationCodeStep'

type OwnProps = {
    currentStep: number
    authenticatorData: AuthenticatorData
    errorText?: string
    setErrorText: Dispatch<SetStateAction<string>>
    setVerificationCode: Dispatch<SetStateAction<string>>
    setIsLoading: Dispatch<SetStateAction<boolean>>
    recoveryCodes: RecoveryCode[]
    setIsRecoveryCodesSaved: Dispatch<SetStateAction<boolean>>
}

export default function ModalStep({
    currentStep,
    authenticatorData,
    errorText,
    setErrorText,
    setVerificationCode,
    setIsLoading,
    recoveryCodes,
    setIsRecoveryCodesSaved,
}: OwnProps) {
    switch (currentStep) {
        case 0:
            return (
                <ValidateVerificationCodeStep
                    setVerificationCode={setVerificationCode}
                    setErrorText={setErrorText}
                    isUpdate={true}
                />
            )
        case 1:
            return <AppSetupStep />
        case 2:
            return (
                <QRCodeStep
                    authenticatorData={authenticatorData}
                    setVerificationCode={setVerificationCode}
                    errorText={errorText}
                    setErrorText={setErrorText}
                    setIsLoading={setIsLoading}
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
