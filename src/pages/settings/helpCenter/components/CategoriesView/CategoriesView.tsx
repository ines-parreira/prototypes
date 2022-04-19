import React, {useEffect, useState} from 'react'
import {Container} from 'reactstrap'
import Button from 'pages/common/components/button/Button'

import {HelpCenter} from 'models/helpCenter/types'
import {getUncategorizedArticles} from 'state/entities/helpCenter/articles'
import {getViewLanguage} from 'state/ui/helpCenter'
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
import useAppSelector from 'hooks/useAppSelector'

import {CategoriesPositionsType} from '../CategoriesTable/CategoriesTable'

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
    const uncategorizedArticles = useAppSelector(getUncategorizedArticles)
    const viewLanguage =
        useAppSelector(getViewLanguage) || helpCenter.default_locale
    const {categories, isLoading} = useHelpCenterCategories(helpCenter.id, {
        per_page: CATEGORIES_PER_PAGE,
        locale: viewLanguage,
    })
    const [uncategorizedArticleCount, setUncategorizedArticleCount] =
        useState(0)

    const handleOnReorder = ({
        categories,
        categoryId,
        defaultSiblingsPositions,
    }: CategoriesPositionsType) => {
        if (categories.length) {
            void actions.updateCategoriesPositions({
                categories,
                categoryId,
                defaultSiblingsPositions,
            })
        }
    }

    const showCreateFirst =
        !isLoading &&
        categories.length === 1 &&
        uncategorizedArticles.length === 0 &&
        uncategorizedArticleCount === 0

    useEffect(() => {
        async function init() {
            const count = await getArticleCount(null)

            setUncategorizedArticleCount(count)
        }

        void init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (isLoading && categories.length === 1) {
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
                    <Button className="mr-2" onClick={onCreateArticle}>
                        <i className="material-icons-outlined mr-1">article</i>
                        Create Article
                    </Button>

                    <Button intent="secondary" onClick={onCreateCategory}>
                        <i className="material-icons mr-1">list</i>
                        Create Category
                    </Button>

                    <ImportSection className={css.importSection} />
                </Container>
            )}
            <CategoriesTable
                renderArticleList={renderArticleList}
                onReorderFinish={handleOnReorder}
                shouldRenderEmptyUncategorizedRow={!showCreateFirst}
            />
        </>
    )
}
