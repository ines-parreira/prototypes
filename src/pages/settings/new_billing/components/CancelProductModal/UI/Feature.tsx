import React from 'react'

import css from './Feature.less'

export type ProductFeatureProps = {
    title: string
    description: string
    icon: string
}
const Feature = ({title, description, icon}: ProductFeatureProps) => {
    return (
        <div className={css.feature}>
            <div className={css.icon}>
                <i className="material-icons">{icon}</i>
            </div>
            <div className={css.content}>
                <div className="body-semibold">{title}</div>
                <div>{description}</div>
            </div>
        </div>
    )
}

export default Feature
