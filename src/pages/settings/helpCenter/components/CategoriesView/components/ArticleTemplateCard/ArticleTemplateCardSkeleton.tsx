import {Skeleton} from '@gorgias/merchant-ui-kit'
import React from 'react'

import css from './ArticleTemplateCard.less'

const ArticleTemplateCardSkeleton = () => {
    return (
        <div className={css.container}>
            <div className={css.header}>
                <Skeleton width={130} height={24} />
                <Skeleton width={60} height={24} />
            </div>
            <div>
                <div className={css.title}>
                    <Skeleton width={245} height={28} />
                </div>
                <div className={css.description}>
                    <Skeleton height={40} />
                </div>
            </div>
        </div>
    )
}

export default ArticleTemplateCardSkeleton
