import { ProductType } from 'models/billing/types'

import Feature from '../UI/Feature'
import type { ProductFeature } from './types'

import css from './ProductFeaturesFOMO.less'

export type ProductFOMOProps = {
    periodEnd: string
    features: ProductFeature[]
    productType: ProductType
    productDisplayName: string
}

const ProductFeaturesFOMO = (props: ProductFOMOProps) => {
    const { periodEnd, features, productType, productDisplayName } = props

    const isHelpdesk = productType === ProductType.Helpdesk

    return (
        <>
            <div className="body-regular">
                {isHelpdesk ? (
                    <>
                        {`If you cancel now, your Helpdesk plan and all other active product plans won't renew after your current billing cycle ends on `}
                        <span className="body-semibold">{periodEnd}</span>
                        {`. Until then, you'll keep full access to your account.`}
                        <br />
                        <br />
                        {`After that date, you'll lose:`}
                    </>
                ) : (
                    <>
                        {`If you cancel now, your ${productDisplayName} plan won't renew after your current billing cycle ends on `}
                        <span className="body-semibold">{periodEnd}</span>
                        {`. Until then, you'll keep full access to all ${productDisplayName} features.`}
                        <br />
                        <br />
                        {`After that date, you'll lose:`}
                    </>
                )}
            </div>
            <div className={css.features}>
                {features.map((feature, index) => (
                    <Feature key={index} {...feature} />
                ))}
            </div>
        </>
    )
}

export default ProductFeaturesFOMO
