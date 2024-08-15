import React from 'react'
import classNames from 'classnames'

import css from './ProductRecommendationBanner.less'

type Props = {
    className?: string
}

export const ProductRecommendationBanner = ({className}: Props) => {
    return (
        <div className={classNames(css.bannerWrapper, className)}>
            <div className={css.icon}>
                <i className="material-icons">auto_awesome</i>
            </div>
            <div>
                Product recommendations will be personalized for each visitor,
                the product selection in the campaign preview is an example.
            </div>
        </div>
    )
}
