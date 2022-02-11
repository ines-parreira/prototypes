import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {Container} from 'reactstrap'
import Button, {ButtonIntent} from 'pages/common/components/button/Button'

import {Category, HelpCenter} from 'models/helpCenter/types'
import {getUncategorizedArticles} from 'state/entities/helpCenter/articles'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import Loader from 'pages/common/components/Loader/Loader'
import {
    CategoriesTable,
    CategoriesTableProps,
} from 'pages/settings/helpCenter/components/CategoriesTable'
import {ImportSection} from 'pages/settings/helpCenter/components/Imports/components/ImportSection'
import {CATEGORIES_PER_PAGE} from 'pages/settings/helpCenter/constants'
import {useArticlesActions} from 'pages/settings/helpCenter/hooks/useArticlesActions'
import {useCategoriesActions} from 'pages/settings/helpCenter/hooks/useCategoriesActions'
import {useHelpCenterCategories} from 'pages/settings/helpCenter/hooks/useHelpCenterCategories'
import settingsCss from 'pages/settings/settings.less'

import css from './CategoriesView.less'

type Props = Pick<CategoriesTableProps, 'renderArticleList'> & {
    helpCenter: HelpCenter
    onCreateArticle: () => void
    onCreateCategory: () => void
}

export const CategoriesViews = ({
    helpCenter,
    renderArticleList,
    onCreateArticle,
    onCreateCategory,
}: Props): JSX.Element | null => {
    const actions = useCategoriesActions()
    const {getArticleCount} = useArticlesActions()
    const uncategorizedArticles = useSelector(getUncategorizedArticles)
    const {categories, hasMore, isLoading, fetchMore} = useHelpCenterCategories(
        helpCenter.id,
        {
            per_page: CATEGORIES_PER_PAGE,
        }
    )
    const [uncategorizedArticleCount, setUncategorizedArticleCount] =
        useState(0)

    const handleOnReorder = (categories: Category[]) => {
        void actions.updateCategoriesPositions(categories)
    }

    const showCreateFirst =
        !isLoading &&
        categories.length === 0 &&
        uncategorizedArticles.length === 0 &&
        uncategorizedArticleCount === 0

    useEffect(() => {
        async function init() {
            const count = await getArticleCount(null)

            setUncategorizedArticleCount(count)
        }

        void init()
    }, [])

    if (isLoading && categories.length === 0) {
        return (
            <Container fluid className={settingsCss.pageContainer}>
                <Loader />
            </Container>
        )
    }

    return (
        <>
            {showCreateFirst && (
                <Container fluid className={settingsCss.pageContainer}>
                    <h1>
                        Start your Help Center here&nbsp;
                        <span aria-label="books" role="img">
                            📚
                        </span>
                    </h1>
                    <p>
                        Write your first article or create your first category
                        to be displayed in your very own Help Center.
                    </p>
                    <Button
                        className="mr-2"
                        intent={ButtonIntent.Primary}
                        type="button"
                        onClick={onCreateArticle}
                    >
                        <i className="material-icons-outlined mr-1">article</i>
                        Create Article
                    </Button>

                    <Button
                        intent={ButtonIntent.Secondary}
                        type="button"
                        onClick={onCreateCategory}
                    >
                        <i className="material-icons mr-1">list</i>
                        Create Category
                    </Button>

                    <ImportSection className={css.importSection} />
                </Container>
            )}
            <InfiniteScroll
                onLoad={fetchMore}
                shouldLoadMore={hasMore && !isLoading}
                loaderSize={20}
            >
                <CategoriesTable
                    categories={categories}
                    renderArticleList={renderArticleList}
                    onReorderFinish={handleOnReorder}
                    shouldRenderEmptyUncategorizedRow={!showCreateFirst}
                />
            </InfiniteScroll>
        </>
    )
}
