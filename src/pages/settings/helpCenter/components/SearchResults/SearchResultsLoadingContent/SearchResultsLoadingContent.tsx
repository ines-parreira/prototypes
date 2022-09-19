import React, {FC} from 'react'
import Skeleton from 'react-loading-skeleton'

import css from './SearchResultsLoadingContent.less'

export const SearchResultsLoadingContent: FC = () => {
    return (
        <div className={css['loading-content']}>
            <Skeleton></Skeleton>
        </div>
    )
}
