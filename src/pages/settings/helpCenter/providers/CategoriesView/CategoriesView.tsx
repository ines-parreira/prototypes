import React from 'react'
import {useSelector} from 'react-redux'
import {Container} from 'reactstrap'

import {Category, HelpCenter} from '../../../../../models/helpCenter/types'
import InfiniteScroll from '../../../../common/components/InfiniteScroll/InfiniteScroll'
import CreateFirst from '../../components/articles/CreateFirst'
import {
    CategoriesTable,
    CategoriesTableProps,
} from '../../components/CategoriesTable'
import {CATEGORIES_PER_PAGE} from '../../constants'
import {useCategoriesActions} from '../../hooks/useCategoriesActions'
import {useHelpCenterCategories} from '../../hooks/useHelpcenterCategories'
import {readUncategorizedArticles} from '../../../../../state/helpCenter/articles'

type Props = Pick<
    CategoriesTableProps,
    'viewLanguage' | 'renderArticleList'
> & {
    helpCenter: HelpCenter
    createArticle: () => void
}

export const CategoriesViews = ({
    helpCenter,
    viewLanguage,
    renderArticleList,
    createArticle,
}: Props): JSX.Element | null => {
    const actions = useCategoriesActions()
    const uncategorizedArticles = useSelector(readUncategorizedArticles)

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

    return (
        <>
            {showCreateFirst && (
                <Container fluid className="page-container">
                    <CreateFirst
                        title="Create your first article 📚"
                        description="Write your first article to be displayed in your very own help center."
                        buttonText="Create Article"
                        onClick={createArticle}
                    />
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
