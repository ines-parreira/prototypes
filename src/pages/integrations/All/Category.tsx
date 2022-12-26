import React, {ReactNode} from 'react'

import ArrowLink from 'pages/common/components/ArrowLink/ArrowLink'
import {Category as CategoryType} from 'models/integration/types/app'

import {CATEGORY_DATA} from './constants'

import css from './Category.less'

type Props = {
    category: CategoryType
    showCategoryLink?: boolean
    children?: ReactNode
}

export default function Category({
    category,
    showCategoryLink = false,
    children,
}: Props) {
    return (
        <section className={css.section}>
            <header className={css.header}>
                <div className={css.titleWrapper}>
                    <h2 className={css.title}>
                        {CATEGORY_DATA[category].title}
                    </h2>
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
            </header>
            {React.Children.count(children) > 0 && (
                <ul className={css.cardWrapper}>{children}</ul>
            )}
        </section>
    )
}
