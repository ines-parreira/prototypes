import { Text } from '@gorgias/axiom'

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
    let content = null
    switch (productType) {
        case ProductType.Helpdesk:
            content = (
                <>
                    {`If you cancel now, your Helpdesk plan and all other active product plans won't renew after your current billing cycle ends on `}
                    <Text variant="medium">{periodEnd}</Text>
                    {`. Until then, you'll keep full access to your account.`}
                    <br />
                    <br />
                    {`After that date, you'll lose:`}
                </>
            )
            break
        case ProductType.Voice:
            content = (
                <>
                    {`Cancelling your Voice plan will permanently delete your current integration settings and call flows. Your phone numbers will remain active and available.`}
                    <br />
                    {`Your plan will not renew after your current billing cycle ends on `}
                    <Text variant="medium">{periodEnd}</Text>
                    {`. Until then, you'll keep full access to all Voice features.`}
                    <br />
                    <br />
                    {`After that date, you'll lose:`}
                </>
            )
            break
        case ProductType.SMS:
            content = (
                <>
                    {`Cancelling your SMS plan will permanently delete your current integration settings. Your phone numbers will remain active and available.`}
                    <br />
                    {`Your plan will not renew after your current billing cycle ends on `}
                    <Text variant="medium">{periodEnd}</Text>
                    {`. Until then, you'll keep full access to all SMS features.`}
                    <br />
                    <br />
                    {`After that date, you'll lose:`}
                </>
            )
            break
        default:
            content = (
                <>
                    {`If you cancel now, your ${productDisplayName} plan won't renew after your current billing cycle ends on `}
                    <Text variant="medium">{periodEnd}</Text>
                    {`. Until then, you'll keep full access to all ${productDisplayName} features.`}
                    <br />
                    <br />
                    {`After that date, you'll lose:`}
                </>
            )
    }

    return (
        <>
            <div className="body-regular">{content}</div>
            <div className={css.features}>
                {features.map((feature, index) => (
                    <Feature key={index} {...feature} />
                ))}
            </div>
        </>
    )
}

export default ProductFeaturesFOMO
