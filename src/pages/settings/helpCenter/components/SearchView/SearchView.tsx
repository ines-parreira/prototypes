import React, {FC, useEffect, useState} from 'react'

import {Article, HelpCenter} from 'models/helpCenter/types'

import Button from 'pages/common/components/button/Button'
import {getUncategorizedArticles} from 'state/entities/helpCenter/articles'
import {getCategories} from 'state/entities/helpCenter/categories'
import useAppSelector from 'hooks/useAppSelector'
import {useSearchContext} from '../../providers/SearchContext'

import {SearchBar} from '../SearchBar'
import {SearchResults} from '../SearchResults'
import {ArticleRowActionTypes} from '../../constants'
import {CategoriesTableSkeleton} from '../CategoriesTableSkeleton'
import {useArticlesActions} from '../../hooks/useArticlesActions'
import {ImportSection} from '../Imports/components/ImportSection'
import {NoResult} from './NoResult'

import css from './SearchView.less'

type Props = {
    helpCenter: HelpCenter
    onArticleClick: (article: Article) => void
    onArticleClickSettings: (
        action: ArticleRowActionTypes,
        article: Article,
        isArticleOrAncestorUnlisted: boolean
    ) => void
    onArticleCreate: () => void
    onCategoryCreate: () => void
    canUpdateArticle: boolean | null
    canUpdateCategory: boolean | null
}

type HeaderProps = Pick<
    Props,
    | 'onArticleCreate'
    | 'onCategoryCreate'
    | 'canUpdateArticle'
    | 'canUpdateCategory'
>

const Header: FC<HeaderProps> = ({
    onArticleCreate,
    onCategoryCreate,
    canUpdateArticle,
    canUpdateCategory,
}) => {
    return (
        <div className={css.wrapper}>
            <SearchBar />

            <ImportSection isButton />
            <Button
                isDisabled={!canUpdateCategory}
                intent="secondary"
                className={css.button}
                onClick={onCategoryCreate}
            >
                <i className="material-icons">add</i>
                Category
            </Button>
            <Button
                isDisabled={!canUpdateArticle}
                intent="primary"
                className={css.button}
                onClick={onArticleCreate}
            >
                <i className="material-icons">add</i>
                Article
            </Button>
        </div>
    )
}

export const SearchView: FC<Props> = ({
    helpCenter,
    onArticleClick,
    onArticleClickSettings,
    onArticleCreate,
    onCategoryCreate,
    canUpdateArticle,
    canUpdateCategory,
}) => {
    const {searchInput, searchResults} = useSearchContext()

    const categories = useAppSelector(getCategories)
    const uncategorizedArticles = useAppSelector(getUncategorizedArticles)
    const {getArticleCount} = useArticlesActions()

    const [uncategorizedArticleCount, setUncategorizedArticleCount] =
        useState(0)

    useEffect(() => {
        async function init() {
            const count = await getArticleCount(null)

            setUncategorizedArticleCount(count)
        }

        void init()
    }, [getArticleCount])

    if (
        categories.length === 1 &&
        uncategorizedArticles.length === 0 &&
        uncategorizedArticleCount === 0
    ) {
        return null
    }

    if (
        searchResults === null ||
        searchResults.state === 'error' ||
        !searchInput
    ) {
        return (
            <Header
                onArticleCreate={onArticleCreate}
                onCategoryCreate={onCategoryCreate}
                canUpdateArticle={canUpdateArticle}
                canUpdateCategory={canUpdateCategory}
            />
        )
    }

    if (searchResults.state === 'loading') {
        return (
            <>
                <Header
                    onArticleCreate={onArticleCreate}
                    onCategoryCreate={onCategoryCreate}
                    canUpdateArticle={canUpdateArticle}
                    canUpdateCategory={canUpdateCategory}
                />
                <CategoriesTableSkeleton />
            </>
        )
    }

    if (searchResults.results.length === 0) {
        return (
            <>
                <Header
                    onArticleCreate={onArticleCreate}
                    onCategoryCreate={onCategoryCreate}
                    canUpdateArticle={canUpdateArticle}
                    canUpdateCategory={canUpdateCategory}
                />
                <NoResult searchInput={searchInput} />
            </>
        )
    }

    return (
        <>
            <Header
                onArticleCreate={onArticleCreate}
                onCategoryCreate={onCategoryCreate}
                canUpdateArticle={canUpdateArticle}
                canUpdateCategory={canUpdateCategory}
            />
            <SearchResults
                helpCenter={helpCenter}
                results={searchResults.results}
                onArticleClick={onArticleClick}
                onArticleClickSettings={onArticleClickSettings}
            />
        </>
    )
}
