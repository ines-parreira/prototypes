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
        case 0:
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
                    onClick={onFinish}
                    isLoading={isLoading}
                    isDisabled={hasError}
                >
                    I Have Saved My Codes
                </Button>
            )
        default:
            return <></>
    }
}
