import Button from '../../../../../common/components/button/Button'

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
            <Button intent="secondary" onClick={onAccept} isLoading={isLoading}>
                Accept offer
            </Button>
            <Button
                intent="destructive"
                fillStyle="ghost"
                isDisabled={isLoading}
                onClick={onContinue}
            >
                Continue cancelling
            </Button>
        </>
    )
}

export default ChurnMitigationOfferFooter
