import { Button } from '@gorgias/axiom'

type ProductFeaturesFOMOFooterProps = {
    onClose: () => void
    onContinue: () => void
    productType: string
}

const ProductFeaturesFOMOFooter = ({
    onClose,
    onContinue,
    productType,
}: ProductFeaturesFOMOFooterProps) => {
    return (
        <>
            <Button intent="secondary" onClick={onClose}>
                Keep using {productType}
            </Button>
            <Button intent="destructive" fillStyle="ghost" onClick={onContinue}>
                Continue cancelling
            </Button>
        </>
    )
}

export default ProductFeaturesFOMOFooter
