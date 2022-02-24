import React, {Dispatch, SetStateAction} from 'react'
import QRCodeStep from './ModalSteps/QRCodeStep/QRCodeStep'

type OwnProps = {
    currentStep: number
    errorText: string
    setErrorText: Dispatch<SetStateAction<string>>
}

export default function ModalStep({
    currentStep,
    errorText,
    setErrorText,
}: OwnProps) {
    switch (currentStep) {
        case 1:
            return (
                <QRCodeStep errorText={errorText} setErrorText={setErrorText} />
            )
        case 2:
            return <>Validate authenticator code step</>
        case 3:
            return <>Recovery codes step</>
        default:
            return <></>
    }
}
