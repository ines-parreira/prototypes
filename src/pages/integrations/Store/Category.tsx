import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import ArrowLink from 'pages/common/components/ArrowLink/ArrowLink'
import {Category as CategoryType} from 'models/integration/types/app'

import {CATEGORY_DATA} from './constants'

import css from './Category.less'

type Props = {
    category: CategoryType
    showCategoryLink?: boolean
}

export default function Category({category, showCategoryLink = false}: Props) {
    const domain = useAppSelector(getCurrentAccountState).get('domain')
    return (
        <>
            <div className={css.titleWrapper}>
                <h2 className={css.title}>{CATEGORY_DATA[category].title}</h2>
                {showCategoryLink && (
                    <ArrowLink
                        href={`?category=${encodeURIComponent(category)}`}
                        onClick={() => {
                            logEvent(SegmentEvent.IntegrationFilterClicked, {
                                category: CATEGORY_DATA[category].title,
                                account_domain: domain,
                            })
                        }}
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
