import React from 'react'

import Feature from '../UI/Feature'
import css from './ProductFeaturesFOMO.less'
import {ProductFeature} from './types'

export type ProductFOMOProps = {
    periodEnd: string
    features: ProductFeature[]
}

const ProductFeaturesFOMO = (props: ProductFOMOProps) => {
    const {periodEnd, features} = props

    return (
        <>
            <div className="body-regular">
                Please be aware that by opting out of Helpdesk's auto-renewal,
                you're also discontinuing it for any other products you're
                currently using. You'll continue to have full access to all your
                active products until the end of your billing cycle on{' '}
                <span className="body-semibold">{periodEnd}</span>. Here's what
                you'll lose after that date:
            </div>
            <div className={css.features}>
                {features.map((feature, index) => (
                    <Feature
                        key={index}
                        title={feature.title}
                        description={feature.description}
                        icon={feature.icon}
                    />
                ))}
            </div>
        </>
    )
}

export default ProductFeaturesFOMO
