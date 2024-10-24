import classnames from 'classnames'
import React from 'react'

import css from './HelpCenterPreviewHomePage.less'

const HomePageSection = ({title}: {title: string}) => {
    return (
        <div className={css.sectionHeader}>
            <span className={css.title}>{title}</span>

            <span className={css.seeAll}>
                See All
                <i className={classnames('material-icons', css.icon)}>
                    arrow_forward
                </i>
            </span>
        </div>
    )
}

const HomePageArticle = ({title}: {title: string}) => {
    return (
        <li className={classnames(css.item, css.articleItem)}>
            <div className={css.itemArticleName}>{title}</div>
            <p className={css.articleDescription}>
                Viva Forevis aptent taciti sociosqu ad litora torquent. Si u
                mundo tá muito paradis?
            </p>
        </li>
    )
}

const HomePageCategory = ({title}: {title: string}) => {
    return (
        <li className={css.item}>
            <div className={css.itemImage} />
            <div className={css.itemCatName}>{title}</div>
        </li>
    )
}

type HelpCenterPreviewDefaultHomePageProps = {
    searchPlaceholder?: string
    isSearchbar?: boolean
}

const HelpCenterPreviewDefaultHomePage = ({
    searchPlaceholder,
    isSearchbar,
}: HelpCenterPreviewDefaultHomePageProps) => {
    return (
        <>
            {isSearchbar && (
                <div className={css.searchBar}>
                    <i
                        className={classnames(
                            'material-icons',
                            css.searchBarIcon
                        )}
                    >
                        search
                    </i>
                    {searchPlaceholder}
                </div>
            )}

            <div>
                <HomePageSection title="Categories" />

                <ul className={css.itemList}>
                    <HomePageCategory title="Category name" />
                    <HomePageCategory title="Category name" />
                </ul>
            </div>

            <div>
                <HomePageSection title="Articles" />

                <ul className={classnames(css.itemList, css.verticalList)}>
                    <HomePageArticle title="Article name" />
                    <HomePageArticle title="Article name" />
                </ul>
            </div>
        </>
    )
}

export default HelpCenterPreviewDefaultHomePage
