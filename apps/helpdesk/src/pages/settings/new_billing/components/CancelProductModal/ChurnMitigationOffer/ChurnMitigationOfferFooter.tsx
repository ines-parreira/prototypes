import { LegacyButton as Button } from '@gorgias/axiom'

type ChurnMitigationOfferFooterProps = {
    onAccept: () => void
    onContinue: () => void
    isLoading: boolean
}
const ChurnMitigationOfferFooter = ({
    onAccept,
    onContinue,
    isLoading,
}: ChurnMitigationOfferFooterProps) => {
    return (
        <>
            <Button
                intent="destructive"
                fillStyle="ghost"
                isDisabled={isLoading}
                onClick={onContinue}
            >
                Continue To Cancel
            </Button>
            <Button intent="primary" onClick={onAccept} isLoading={isLoading}>
                Get My Offer
            </Button>
        </>
    )
}

export default ChurnMitigationOfferFooter
