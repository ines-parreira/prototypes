import React, {FC, useCallback, useMemo} from 'react'
import classNames from 'classnames'
import _keyBy from 'lodash/keyBy'

import {Article, NonRootCategory} from 'models/helpCenter/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import {LanguageList} from 'pages/common/components/LanguageBulletList'
import {sanitizeHtmlDefault} from 'utils/html'
import {
    ArticleRowActionTypes,
    CATEGORY_ROW_ACTIONS,
    MODALS,
} from 'pages/settings/helpCenter/constants'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {useModalManager} from 'hooks/useModalManager'

import {isSearchResultArticle, isLoading, SearchResultCategory} from '../types'
import {SearchResultsArticleRow} from '../SearchResultsArticleRow'
import {SearchResultsLoadingContent} from '../SearchResultsLoadingContent'
import {TableActions} from '../../TableActions'

import nestingCss from '../nesting.less'

import VisibilityCell from '../../VisibilityCell/VisibilityCell'
import {isResultOrAncestorUnlisted} from '../utils'

import css from './SearchResultsCategoryRow.less'

const Highlight: FC<{
    category: NonRootCategory
    hits: SearchResultCategory['algoliaHits']
}> = ({category, hits}) => {
    const localizedAlgoliaHit = hits[category.translation.locale]

    const matchingHighlightedTitle =
        localizedAlgoliaHit?._highlightResult?.title

    if (
        matchingHighlightedTitle?.matchLevel === 'full' ||
        matchingHighlightedTitle?.matchLevel === 'partial'
    ) {
        const sanitizedTitle = sanitizeHtmlDefault(
            matchingHighlightedTitle.value
        )

        return (
            <span
                className={css['category-title']}
                dangerouslySetInnerHTML={{
                    __html: sanitizedTitle,
                }}
            />
        )
    }

    return (
        <span className={css['category-title']}>
            {category.translation.title}
        </span>
    )
}

type Props = {
    category: SearchResultCategory
    level: number
    onArticleClick: (article: Article) => void
    onArticleClickSettings: (
        action: ArticleRowActionTypes,
        article: Article,
        isArticleOrAncestorUnlisted: boolean
    ) => void
}

export const SearchResultsCategoryRow: FC<Props> = ({
    category,
    level,
    onArticleClick,
    onArticleClickSettings,
}) => {
    const locales = useSupportedLocales()
    const hasChildren = category.children.length > 0
    const articleModal = useModalManager(MODALS.ARTICLE, {autoDestroy: false})
    const categoryModal = useModalManager(MODALS.CATEGORY, {autoDestroy: false})
    const localesByCode = useMemo(() => _keyBy(locales, 'code'), [locales])

    const languageList = useMemo(() => {
        if (isLoading(category.category)) {
            return []
        }

        if (category.category.available_locales.length > 0) {
            return category.category.available_locales.map(
                (code) => localesByCode[code]
            )
        }

        return [localesByCode[category.category.translation.locale]]
    }, [category, localesByCode])

    const isAncestorUnlisted =
        !isLoading(category.category) &&
        isResultOrAncestorUnlisted(
            category,
            category.category.translation.locale
        )

    const handleOnActionClick = useCallback(
        (ev: React.MouseEvent<HTMLSpanElement>, name: string) => {
            if (isLoading(category.category)) {
                return
            }

            if (name === 'categorySettings') {
                categoryModal.openModal(
                    MODALS.CATEGORY,
                    false,
                    category.category
                )
                return
            }
            if (name === 'createNestedCategory') {
                categoryModal.openModal(MODALS.CATEGORY, false, {
                    isCreate: true,
                    parentCategoryId: category.category.id,
                })
                return
            }
            if (name === 'createNestedArticle') {
                articleModal.openModal(MODALS.ARTICLE, false, {
                    categoryId: category.category.id,
                })
            }
        },
        [articleModal, categoryModal, category]
    )

    return (
        <>
            <TableBodyRow className={css.row}>
                <BodyCell className={css['cell']}>{''}</BodyCell>
                <BodyCell
                    className={classNames(
                        css['cell'],
                        nestingCss[`nesting-level-${level}`]
                    )}
                >
                    {isLoading(category.category) ? (
                        <SearchResultsLoadingContent />
                    ) : (
                        <>
                            {hasChildren ? (
                                <span
                                    className={classNames(
                                        css.caret,
                                        'material-icons'
                                    )}
                                >
                                    arrow_drop_down
                                </span>
                            ) : (
                                <span className={css['caret-placeholder']} />
                            )}
                            <Highlight
                                category={category.category}
                                hits={category.algoliaHits}
                            />
                        </>
                    )}
                </BodyCell>
                <BodyCell className={css['cell']}>{''}</BodyCell>
                <BodyCell style={{minWidth: 110, width: 110}}>
                    {!isLoading(category.category) && (
                        <VisibilityCell
                            status={
                                category.category.translation.visibility_status
                            }
                            isParentUnlisted={isAncestorUnlisted}
                        />
                    )}
                </BodyCell>
                <BodyCell style={{width: 105, minWidth: 105}}>
                    {!isLoading(category.category) && (
                        <LanguageList
                            id={category.id}
                            defaultLanguage={
                                localesByCode[
                                    category.category.translation.locale
                                ]
                            }
                            languageList={languageList}
                        />
                    )}
                </BodyCell>

                <BodyCell innerClassName={css.actions}>
                    <TableActions
                        actions={CATEGORY_ROW_ACTIONS.map(
                            ({name, icon, tooltip}) => ({
                                name,
                                icon,
                                disabled:
                                    level >= 3 &&
                                    name === 'createNestedCategory',
                                tooltip: {
                                    content: tooltip,
                                    target: `${name}-${category.id}`,
                                },
                            })
                        )}
                        onClick={handleOnActionClick}
                    />
                </BodyCell>
            </TableBodyRow>

            {hasChildren &&
                category.children.map((child, index) =>
                    isSearchResultArticle(child) ? (
                        <SearchResultsArticleRow
                            level={level + 1}
                            article={child}
                            key={index}
                            onArticleClick={onArticleClick}
                            onArticleClickSettings={onArticleClickSettings}
                        />
                    ) : (
                        <SearchResultsCategoryRow
                            level={level + 1}
                            category={child}
                            key={index}
                            onArticleClick={onArticleClick}
                            onArticleClickSettings={onArticleClickSettings}
                        />
                    )
                )}
        </>
    )
}
