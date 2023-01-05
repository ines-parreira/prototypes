import React from 'react'
import classnames from 'classnames'
import {Link} from 'react-router-dom'

import useSearch from 'hooks/useSearch'
import useAppSelector from 'hooks/useAppSelector'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import ArrowLink from 'pages/common/components/ArrowLink/ArrowLink'
import {Category} from 'models/integration/types/app'

import {
    CATEGORY_DATA,
    CATEGORY_URL_PARAM,
    ORDERED_CATEGORIES,
} from './constants'
import css from './CategoryFilter.less'

export default function CategoryFilter() {
    const domain = useAppSelector(getCurrentAccountState).get('domain')
    const search = useSearch<{[CATEGORY_URL_PARAM]: string}>()
    const activeCategory = search[CATEGORY_URL_PARAM]

    return (
        <div className={css.container}>
            <nav>
                <ul className={css.list}>
                    <li className={css.item}>
                        <Link
                            to="?"
                            className={classnames(css.link, {
                                [css.active]: !activeCategory,
                            })}
                        >
                            All Categories
                        </Link>
                    </li>
                    <li className={`${css.delimiter} ${css.item}`}>
                        <Link
                            to={`?category=${encodeURIComponent(
                                Category.FEATURED
                            )}`}
                            className={classnames(css.link, {
                                [css.active]:
                                    activeCategory === Category.FEATURED,
                            })}
                            onClick={() =>
                                trackCategoryClick(
                                    CATEGORY_DATA[Category.FEATURED].title,
                                    domain
                                )
                            }
                        >
                            {CATEGORY_DATA[Category.FEATURED].title}
                        </Link>
                    </li>
                    {ORDERED_CATEGORIES.map((category, index) => {
                        if (CATEGORY_DATA[category].skipNav) return null
                        const categoryData = CATEGORY_DATA[category]
                        return (
                            <li className={css.item} key={index}>
                                <Link
                                    to={`?category=${encodeURIComponent(
                                        category
                                    )}`}
                                    className={classnames(css.link, {
                                        [css.active]:
                                            activeCategory === category,
                                    })}
                                    onClick={() =>
                                        trackCategoryClick(
                                            categoryData.title,
                                            domain
                                        )
                                    }
                                >
                                    {categoryData.title}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
            <aside className={css.aside}>
                <h4 className={css.asideTitle}>Building an app?</h4>
                <p>
                    Improve your internal processes and put your data to work
                    with Gorgias API.
                    <br />
                    <ArrowLink
                        href="https://developers.gorgias.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={css.asideLink}
                    >
                        Explore our API
                    </ArrowLink>
                </p>
            </aside>
        </div>
    )
}

function trackCategoryClick(categoryLabel: string, domain: string) {
    logEvent(SegmentEvent.IntegrationFilterClicked, {
        category: categoryLabel,
        account_domain: domain,
    })
}
