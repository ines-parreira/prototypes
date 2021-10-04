import React from 'react'
import {useSelector} from 'react-redux'
import {Button, Container} from 'reactstrap'

import {Category, HelpCenter} from '../../../../../models/helpCenter/types'
import {getUncategorizedArticles} from '../../../../../state/helpCenter/articles'
import InfiniteScroll from '../../../../common/components/InfiniteScroll/InfiniteScroll'
import Loader from '../../../../common/components/Loader/Loader'
import {
    CategoriesTable,
    CategoriesTableProps,
} from '../../components/CategoriesTable'
import {CATEGORIES_PER_PAGE} from '../../constants'
import {useCategoriesActions} from '../../hooks/useCategoriesActions'
import {useHelpCenterCategories} from '../../hooks/useHelpcenterCategories'

type Props = Pick<
    CategoriesTableProps,
    'viewLanguage' | 'renderArticleList'
> & {
    helpCenter: HelpCenter
    createArticle: () => void
    createCategory: () => void
}

export const CategoriesViews = ({
    helpCenter,
    viewLanguage,
    renderArticleList,
    createArticle,
    createCategory,
}: Props): JSX.Element | null => {
    const actions = useCategoriesActions()
    const uncategorizedArticles = useSelector(getUncategorizedArticles)

    const {categories, hasMore, isLoading, fetchMore} = useHelpCenterCategories(
        helpCenter.id,
        {
            locale: viewLanguage,
            per_page: CATEGORIES_PER_PAGE,
        }
    )
    const handleOnReorder = (categories: Category[]) => {
        void actions.updateCategoriesPositions(categories)
    }

    const showCreateFirst =
        !isLoading &&
        categories.length === 0 &&
        uncategorizedArticles.length === 0

    if (isLoading && categories.length === 0) {
        return (
            <Container fluid className="page-container">
                <Loader />
            </Container>
        )
    }

    return (
        <>
            {showCreateFirst && (
                <Container fluid className="page-container">
                    <h1>
                        Start your help center here&nbsp;
                        <span aria-label="books" role="img">
                            📚
                        </span>
                    </h1>
                    <p>
                        Write your first article or create your first category
                        to be displayed in your very own help center.
                    </p>
                    <Button
                        color="success"
                        onClick={createArticle}
                        className="mr-2"
                    >
                        <i className="material-icons-outlined mr-1">article</i>
                        Create Article
                    </Button>

                    <Button onClick={createCategory}>
                        <i className="material-icons mr-1">list</i>
                        Create Category
                    </Button>
                </Container>
            )}
            <InfiniteScroll
                onLoad={fetchMore}
                shouldLoadMore={hasMore && !isLoading}
                loaderSize={20}
            >
                <CategoriesTable
                    categories={categories}
                    viewLanguage={viewLanguage}
                    renderArticleList={renderArticleList}
                    onReorderFinish={handleOnReorder}
                />
            </InfiniteScroll>
        </>
    )
}
