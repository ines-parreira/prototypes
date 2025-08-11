import React, { FC } from 'react'

import { Skeleton } from '@gorgias/axiom'

import css from './SearchResultsLoadingContent.less'

export const SearchResultsLoadingContent: FC = () => {
    return (
        <div className={css['loading-content']}>
            <Skeleton />
        </div>
    )
}
