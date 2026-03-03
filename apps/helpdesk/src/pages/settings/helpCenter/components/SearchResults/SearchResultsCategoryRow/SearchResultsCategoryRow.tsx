import type { FC } from 'react'
import type React from 'react'
import { useCallback, useMemo } from 'react'

import classNames from 'classnames'
import _keyBy from 'lodash/keyBy'

import useAppDispatch from 'hooks/useAppDispatch'
import { useModalManager } from 'hooks/useModalManager'
import type {
    Article,
    LocaleCode,
    NonRootCategory,
} from 'models/helpCenter/types'
import { LanguageList } from 'pages/common/components/LanguageBulletList'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import type { ArticleRowActionTypes } from 'pages/settings/helpCenter/constants'
import { MODALS } from 'pages/settings/helpCenter/constants'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { changeViewLanguage } from 'state/ui/helpCenter/actions'
import { sanitizeHtmlDefault } from 'utils/html'

import { useCategoryRowActions } from '../../../hooks/useCategoryRowActions'
import { TableActions } from '../../TableActions'
import VisibilityCell from '../../VisibilityCell/VisibilityCell'
import { SearchResultsArticleRow } from '../SearchResultsArticleRow'
import { SearchResultsLoadingContent } from '../SearchResultsLoadingContent'
import type { SearchResultCategory } from '../types'
import { isLoading, isSearchResultArticle } from '../types'
import { isResultOrAncestorUnlisted } from '../utils'

import nestingCss from '../nesting.less'
import css from './SearchResultsCategoryRow.less'

const Highlight: FC<{
    category: NonRootCategory
    hits: SearchResultCategory['algoliaHits']
}> = ({ category, hits }) => {
    const localizedAlgoliaHit = hits[category.translation.locale]

    const matchingHighlightedTitle =
        localizedAlgoliaHit?._highlightResult?.title

    if (
        matchingHighlightedTitle?.matchLevel === 'full' ||
        matchingHighlightedTitle?.matchLevel === 'partial'
    ) {
        const sanitizedTitle = sanitizeHtmlDefault(
            matchingHighlightedTitle.value,
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
        isArticleOrAncestorUnlisted: boolean,
    ) => void
    viewLanguage: LocaleCode
}

export const SearchResultsCategoryRow: FC<Props> = ({
    category,
    level,
    onArticleClick,
    onArticleClickSettings,
    viewLanguage,
}) => {
    const dispatch = useAppDispatch()
    const locales = useSupportedLocales()
    const hasChildren = category.children.length > 0
    const articleModal = useModalManager(MODALS.ARTICLE, { autoDestroy: false })
    const categoryModal = useModalManager(MODALS.CATEGORY, {
        autoDestroy: false,
    })
    const localesByCode = useMemo(() => _keyBy(locales, 'code'), [locales])
    const categoryRowActions = useCategoryRowActions(category.id, level)

    const languageList = useMemo(() => {
        if (isLoading(category.category)) {
            return []
        }

        if (category.category.available_locales.length > 0) {
            return category.category.available_locales.map(
                (code) => localesByCode[code],
            )
        }

        return [localesByCode[category.category.translation.locale]]
    }, [category, localesByCode])

    const isAncestorUnlisted =
        !isLoading(category.category) &&
        isResultOrAncestorUnlisted(
            category,
            category.category.translation.locale,
        )

    const handleOnActionClick = useCallback(
        (ev: React.MouseEvent<HTMLSpanElement>, name: string) => {
            if (isLoading(category.category)) {
                return
            }

            if (name === 'categorySettings') {
                const searchResultsLocales = Object.keys(category.algoliaHits)
                const loadedTranslationNotInSearchResults =
                    !searchResultsLocales.includes(
                        category.category.translation.locale,
                    )

                categoryModal.openModal(
                    MODALS.CATEGORY,
                    false,
                    category.category,
                )

                if (searchResultsLocales.length === 0) {
                    dispatch(
                        changeViewLanguage(
                            category.category.translation.locale,
                        ),
                    )
                } else if (
                    loadedTranslationNotInSearchResults ||
                    viewLanguage !== category.category.translation.locale
                ) {
                    // the type assertion is safe as algoliaHits keys are LocaleCode
                    const firstMatchingLocale: LocaleCode | undefined =
                        Object.keys(category.algoliaHits)[0] as LocaleCode

                    if (firstMatchingLocale !== undefined) {
                        dispatch(changeViewLanguage(firstMatchingLocale))
                    }
                }

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [articleModal, categoryModal, category],
    )

    return (
        <>
            <TableBodyRow className={css.row}>
                <BodyCell className={css['cell']}>{''}</BodyCell>
                <BodyCell
                    className={classNames(
                        css['cell'],
                        nestingCss[`nesting-level-${level}`],
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
                                        'material-icons',
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
                <BodyCell style={{ minWidth: 110, width: 110 }}>
                    {!isLoading(category.category) && (
                        <VisibilityCell
                            status={
                                category.category.translation
                                    .customer_visibility ?? 'PUBLIC'
                            }
                            isParentUnlisted={isAncestorUnlisted}
                        />
                    )}
                </BodyCell>
                <BodyCell style={{ width: 105, minWidth: 105 }}>
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
                        actions={categoryRowActions}
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
                            viewLanguage={viewLanguage}
                        />
                    ),
                )}
        </>
    )
}
