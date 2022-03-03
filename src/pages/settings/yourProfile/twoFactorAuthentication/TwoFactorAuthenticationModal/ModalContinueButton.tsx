import React from 'react'
import Button from '../../../../common/components/button/Button'

type OwnProps = {
    currentStep: number
    isLoading: boolean
    hasError: boolean
    onContinue: () => void
    onFinish: () => void
}

export default function ModalContinueButton({
    currentStep,
    isLoading,
    hasError,
    onContinue,
    onFinish,
}: OwnProps) {
    switch (currentStep) {
        case 1:
        case 2:
            return (
                <Button
                    onClick={onContinue}
                    isLoading={isLoading}
                    isDisabled={hasError}
                >
                    Continue
                </Button>
            )
        case 3:
            return (
                <Button
                    className="full-width"
                    onClick={onFinish}
                    isLoading={isLoading}
                    isDisabled={hasError}
                >
                    <span className="full-width">Continue</span>
                </Button>
            )
        default:
            return <></>
    }
}
