import React from 'react'

import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import css from './AutoQASkeleton.less'

export default function AutoQASkeleton() {
    return (
        <div className={css.container}>
            <Skeleton height={20} />
            <Skeleton height={20} />
            <Skeleton height={16} />
        </div>
    )
}
