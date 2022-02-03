import {Button} from 'reactstrap'
import React from 'react'

type OwnProps = {
    currentStep: number
    onContinue: () => void
    onFinish: () => void
}

export default function ModalContinueButton({
    currentStep,
    onContinue,
    onFinish,
}: OwnProps) {
    switch (currentStep) {
        case 1:
        case 2:
            return (
                <Button color="primary" onClick={onContinue}>
                    Continue
                </Button>
            )
        case 3:
            return (
                <Button
                    color="primary"
                    className="full-width"
                    onClick={onFinish}
                >
                    Continue
                </Button>
            )
        default:
            return <></>
    }
}
