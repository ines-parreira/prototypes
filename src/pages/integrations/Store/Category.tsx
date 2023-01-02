import React from 'react'

import ArrowLink from 'pages/common/components/ArrowLink/ArrowLink'
import {Category as CategoryType} from 'models/integration/types/app'

import {CATEGORY_DATA} from './constants'

import css from './Category.less'

type Props = {
    category: CategoryType
    showCategoryLink?: boolean
}

export default function Category({category, showCategoryLink = false}: Props) {
    return (
        <>
            <div className={css.titleWrapper}>
                <h2 className={css.title}>{CATEGORY_DATA[category].title}</h2>
                {showCategoryLink && (
                    <ArrowLink
                        href={`?category=${encodeURIComponent(category)}`}
                    >
                        View All
                    </ArrowLink>
                )}
            </div>
            {CATEGORY_DATA[category].subtitle && (
                <p className={css.subtitle}>
                    {CATEGORY_DATA[category].subtitle}
                </p>
            )}
        </>
    )
}
