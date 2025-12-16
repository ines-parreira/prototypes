import { LegacyButton as Button } from '@gorgias/axiom'

type CancellationReasonsFooterProps = {
    onClose: () => void
    productDisplayName: string
    onContinue: () => void
    continueDisabled: boolean
}

const CancellationReasonsFooter = ({
    onClose,
    productDisplayName,
    onContinue,
    continueDisabled,
}: CancellationReasonsFooterProps) => {
    return (
        <>
            <Button
                intent="destructive"
                fillStyle="ghost"
                isDisabled={continueDisabled}
                onClick={onContinue}
            >
                Continue To Cancel
            </Button>
            <Button intent="primary" onClick={onClose}>
                Keep My {productDisplayName} Plan
            </Button>
        </>
    )
}

export default CancellationReasonsFooter
