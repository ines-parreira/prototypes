import { LegacyButton as Button } from '@gorgias/axiom'

type ProductFeaturesFOMOFooterProps = {
    onClose: () => void
    onContinue: () => void
    productDisplayName: string
}

const ProductFeaturesFOMOFooter = ({
    onClose,
    onContinue,
    productDisplayName: productType,
}: ProductFeaturesFOMOFooterProps) => {
    return (
        <>
            <Button intent="destructive" fillStyle="ghost" onClick={onContinue}>
                Continue To Cancel
            </Button>
            <Button intent="primary" onClick={onClose}>
                Keep My {productType} Plan
            </Button>
        </>
    )
}

export default ProductFeaturesFOMOFooter
