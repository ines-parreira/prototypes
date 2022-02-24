import React, {Dispatch, SetStateAction} from 'react'
import QRCodeStep from './ModalSteps/QRCodeStep/QRCodeStep'
import ValidateVerificationCodeStep from './ModalSteps/ValidateVerificationCodeStep/ValidateVerificationCodeStep'

type OwnProps = {
    currentStep: number
    errorText?: string
    setErrorText: Dispatch<SetStateAction<string>>
    setVerificationCode: Dispatch<SetStateAction<string>>
    setIsLoading: Dispatch<SetStateAction<boolean>>
}

export default function ModalStep({
    currentStep,
    errorText,
    setErrorText,
    setVerificationCode,
    setIsLoading,
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
            return <>Recovery codes step</>
        default:
            return <></>
    }
}
