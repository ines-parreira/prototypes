import React from 'react'

import css from './PlanFeatureVectorIcon.less'

type Props = {
    url: string
}

export default function PlanFeatureVectorIcon({url}: Props) {
    return (
        <i
            className={css.icon}
            style={{
                mask: `url(${url}) 0 0/var(--feature-icon-size) no-repeat`,
                WebkitMask: `url(${url}) 0 0/var(--feature-icon-size) no-repeat`,
            }}
        />
    )
}
