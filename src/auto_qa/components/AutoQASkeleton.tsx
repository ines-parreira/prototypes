import {Skeleton} from '@gorgias/merchant-ui-kit'
import React from 'react'

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
