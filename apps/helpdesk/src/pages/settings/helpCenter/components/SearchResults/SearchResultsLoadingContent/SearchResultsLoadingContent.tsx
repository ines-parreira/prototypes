import React, { FC } from 'react'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import css from './SearchResultsLoadingContent.less'

export const SearchResultsLoadingContent: FC = () => {
    return (
        <div className={css['loading-content']}>
            <Skeleton />
        </div>
    )
}
