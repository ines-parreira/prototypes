import React, {FC, useEffect, useMemo} from 'react'
import classNames from 'classnames'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableHead from 'pages/common/components/table/TableHead'

import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableBody from 'pages/common/components/table/TableBody'

import useAppSelector from 'hooks/useAppSelector'
import {getCategoriesById} from 'state/entities/helpCenter/categories'
import {getArticlesById} from 'state/entities/helpCenter/articles'
import {getViewLanguage} from 'state/ui/helpCenter'
import {Article, HelpCenter} from 'models/helpCenter/types'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

import {FlatAlgoliaSearchResults} from '../../providers/SearchContext'
import {useCategoriesActions} from '../../hooks/useCategoriesActions'
import {useArticlesActions} from '../../hooks/useArticlesActions'
import {ArticleRowActionTypes} from '../../constants'

import {getMissingEntities, searchResultsTreeFromAlgolia} from './utils'

import css from './SearchResults.less'
import {SearchResultsArticleRow} from './SearchResultsArticleRow'
import {SearchResultsCategoryRow} from './SearchResultsCategoryRow'

const UncategorizedArticlesHeaderRow: FC = () => (
    <TableBodyRow className={css.row}>
        <BodyCell>{''}</BodyCell>
        <BodyCell className={css['uncategorized-header-cell']} colSpan={4}>
            <span className={classNames(css.caret, 'material-icons')}>
                arrow_drop_down
            </span>
            Uncategorized articles
        </BodyCell>
    </TableBodyRow>
)

type Props = {
    results: FlatAlgoliaSearchResults
    helpCenter: HelpCenter
    onArticleClick: (article: Article) => void
    onArticleClickSettings: (
        action: ArticleRowActionTypes,
        article: Article,
        isArticleOrAncestorUnlisted: boolean
    ) => void
}

export const SearchResults: FC<Props> = ({
    helpCenter,
    results,
    onArticleClick,
    onArticleClickSettings,
}) => {
    const categoriesById = useAppSelector(getCategoriesById)
    const articlesById = useAppSelector(getArticlesById)
    const articlesActions = useArticlesActions()
    const categoriesActions = useCategoriesActions()

    const viewLanguage =
        useAppSelector(getViewLanguage) || helpCenter.default_locale

    const resultsTree = useMemo(
        () =>
            searchResultsTreeFromAlgolia(results, categoriesById, articlesById),
        [results, categoriesById, articlesById]
    )

    useEffect(() => {
        const {missingArticlesIds, missingCategoriesIds} =
            getMissingEntities(resultsTree)

        async function fetchData() {
            if (missingArticlesIds.size > 0) {
                await articlesActions.fetchArticlesByIds(
                    Array.from(missingArticlesIds)
                )
            }

            await Promise.all(
                Array.from(missingCategoriesIds).map((categoryId) =>
                    categoriesActions.fetchCategories(
                        viewLanguage,
                        categoryId,
                        false
                    )
                )
            )
        }

        void fetchData()
        // articlesActions and categoriesActions should not be in the dependency list
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resultsTree, viewLanguage])

    return (
        <TableWrapper>
            <TableHead className={css['header-tr']}>
                <HeaderCell style={{width: 25}} />
                <HeaderCell />
                <HeaderCell />
                <HeaderCell style={{width: 124}} />
                <HeaderCell style={{width: 160}} />
            </TableHead>
            <TableBody className={css['table-body']}>
                {resultsTree.uncategorized.length > 0 && (
                    <UncategorizedArticlesHeaderRow />
                )}

                {resultsTree.uncategorized.map((result, index) => (
                    <SearchResultsArticleRow
                        level={1}
                        article={result}
                        key={index}
                        onArticleClick={onArticleClick}
                        onArticleClickSettings={onArticleClickSettings}
                    />
                ))}

                {resultsTree.categorized.map((result, index) => (
                    <SearchResultsCategoryRow
                        level={0}
                        category={result}
                        key={index}
                        onArticleClick={onArticleClick}
                        onArticleClickSettings={onArticleClickSettings}
                    />
                ))}
            </TableBody>
        </TableWrapper>
    )
}
