import type { FC } from 'react'
import type React from 'react'
import { useCallback, useMemo } from 'react'

import _keyBy from 'lodash/keyBy'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import down from 'assets/img/icons/rating-down-white.svg'
import star from 'assets/img/icons/rating-star.svg'
import up from 'assets/img/icons/rating-up-white.svg'
import useAppDispatch from 'hooks/useAppDispatch'
import type { Article, LocaleCode } from 'models/helpCenter/types'
import { LanguageList } from 'pages/common/components/LanguageBulletList'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import type { ArticleRowActionTypes } from 'pages/settings/helpCenter/constants'
import { changeViewLanguage } from 'state/ui/helpCenter/actions'
import { sanitizeHtmlDefault } from 'utils/html'

import { useArticleRowActions } from '../../../hooks/useArticleRowActions'
import { useRatingScore } from '../../../hooks/useRatingScore'
import { useSupportedLocales } from '../../../providers/SupportedLocales'
import { isNotPublished } from '../../../utils/helpCenter.utils'
import { TableActions } from '../../TableActions'
import VisibilityCell from '../../VisibilityCell/VisibilityCell'
import { SearchResultsLoadingContent } from '../SearchResultsLoadingContent'
import type { SearchResultArticle } from '../types'
import { isLoading } from '../types'
import { isResultOrAncestorUnlisted } from '../utils'

import nestingCss from '../nesting.less'
import css from './SearchResultsArticleRow.less'

const Highlight: FC<{
    article: Article
    hits: SearchResultArticle['algoliaHits']
}> = ({ article, hits }) => {
    const localizedAlgoliaHit = hits[article.translation.locale]

    const matchingHighlightedTitleDraft =
        localizedAlgoliaHit?._highlightResult?.title_draft

    if (
        matchingHighlightedTitleDraft?.matchLevel === 'full' ||
        matchingHighlightedTitleDraft?.matchLevel === 'partial'
    ) {
        const sanitizedTitleDraft = sanitizeHtmlDefault(
            matchingHighlightedTitleDraft.value,
        )

        return (
            <span
                dangerouslySetInnerHTML={{
                    __html: sanitizedTitleDraft,
                }}
            />
        )
    }

    return <span>{article.translation.title}</span>
}

type Props = {
    article: SearchResultArticle
    level: number
    onArticleClick: (article: Article) => void
    onArticleClickSettings: (
        action: ArticleRowActionTypes,
        article: Article,
        isArticleOrAncestorUnlisted: boolean,
    ) => void
}

export const SearchResultsArticleRow: FC<Props> = ({
    article,
    level,
    onArticleClick,
    onArticleClickSettings,
}) => {
    const dispatch = useAppDispatch()
    const locales = useSupportedLocales()

    const entity = isLoading(article.article) ? null : article.article
    const ratingScore = useRatingScore(entity?.rating)
    const localesByCode = useMemo(() => _keyBy(locales, 'code'), [locales])
    const articleRowActions = useArticleRowActions(article.id)

    const languageList = useMemo(() => {
        if (!entity) {
            return []
        }

        if (entity.available_locales.length > 0) {
            return entity.available_locales.map((code) => localesByCode[code])
        }

        return [localesByCode[entity.translation.locale]]
    }, [entity, localesByCode])

    const isAncestorUnlisted =
        entity !== null &&
        isResultOrAncestorUnlisted(article, entity.translation.locale)

    const loadSearchResultTranslationIfMissing = useCallback(() => {
        if (entity === null) {
            return
        }

        const searchResultsLocales = Object.keys(article.algoliaHits)

        const loadedTranslationNotASearchResult =
            !searchResultsLocales.includes(entity.translation.locale)

        if (loadedTranslationNotASearchResult) {
            // the type assertion is safe as algoliaHits keys are LocaleCode
            const firstMatchingLocale: LocaleCode =
                searchResultsLocales[0] as LocaleCode

            dispatch(changeViewLanguage(firstMatchingLocale))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entity, article])

    const onRowClick = useCallback(() => {
        if (entity !== null) {
            loadSearchResultTranslationIfMissing()
            onArticleClick(entity)
        }
    }, [entity, loadSearchResultTranslationIfMissing, onArticleClick])

    return (
        <TableBodyRow
            aria-label="open article"
            className={css.row}
            onClick={onRowClick}
        >
            <BodyCell>{''}</BodyCell>
            <BodyCell className={nestingCss[`nesting-level-${level}`]}>
                {isLoading(article.article) ? (
                    <SearchResultsLoadingContent />
                ) : (
                    <Highlight
                        article={article.article}
                        hits={article.algoliaHits}
                    />
                )}
            </BodyCell>
            <BodyCell style={{ width: 77, minWidth: 77 }}>
                <div className={css.rating} id={`rating-${article.id}`}>
                    <img alt="star" src={star} />
                    <div className={css['rating-text']}>{ratingScore}%</div>
                </div>
                {entity?.rating && (
                    <Tooltip
                        delay={100}
                        target={`rating-${article.id}`}
                        placement="top"
                        innerProps={{
                            popperClassName: css.tooltip,
                            innerClassName: css['tooltip-inner'],
                            arrowClassName: css['tooltip-arrow'],
                        }}
                    >
                        <div className={css.rating}>
                            <div>
                                <img
                                    alt="up"
                                    className={css['rating-icon']}
                                    src={up}
                                />
                                {entity.rating.up}
                            </div>
                            <div className={css['rating-separator']}>|</div>
                            <div>
                                <img
                                    alt="down"
                                    className={css['rating-icon']}
                                    src={down}
                                />
                                {entity.rating.down}
                            </div>
                        </div>
                    </Tooltip>
                )}
            </BodyCell>
            <BodyCell
                style={{ width: 110, minWidth: 110 }}
                className={css['nested-cell']}
            >
                {entity !== null && (
                    <VisibilityCell
                        status={
                            entity.translation.customer_visibility ?? 'PUBLIC'
                        }
                        isParentUnlisted={isAncestorUnlisted}
                        isArticle
                        isDraft={isNotPublished(entity)}
                    />
                )}
            </BodyCell>
            <BodyCell style={{ width: 105, minWidth: 105 }}>
                {entity?.translation && (
                    <LanguageList
                        id={article.id}
                        defaultLanguage={
                            localesByCode[entity.translation.locale]
                        }
                        languageList={languageList}
                    />
                )}
            </BodyCell>
            <BodyCell style={{ width: 120 }} innerClassName={css.actions}>
                <TableActions
                    actions={articleRowActions}
                    onClick={(
                        ev: React.MouseEvent,
                        name: ArticleRowActionTypes,
                    ) => {
                        ev.stopPropagation()
                        if (entity !== null) {
                            if (name === 'articleSettings') {
                                loadSearchResultTranslationIfMissing()
                            }

                            onArticleClickSettings(
                                name,
                                entity,
                                isAncestorUnlisted,
                            )
                        }
                    }}
                />
            </BodyCell>
        </TableBodyRow>
    )
}
