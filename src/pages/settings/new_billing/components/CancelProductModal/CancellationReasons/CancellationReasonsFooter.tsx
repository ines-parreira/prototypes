import React from 'react'
import Button from 'pages/common/components/button/Button'

type CancellationReasonsFooterProps = {
    onClose: () => void
    productType: string
    onContinue: () => void
    continueDisabled: boolean
}

const CancellationReasonsFooter = ({
    onClose,
    productType,
    onContinue,
    continueDisabled,
}: CancellationReasonsFooterProps) => {
    return (
        <>
            <Button intent="secondary" onClick={onClose}>
                Keep using {productType}
            </Button>
            <Button
                intent="destructive"
                fillStyle="ghost"
                isDisabled={continueDisabled}
                onClick={onContinue}
            >
                Continue cancelling
            </Button>
        </>
    )
}

export default CancellationReasonsFooter
