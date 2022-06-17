import React, {FC, useMemo} from 'react'
import _keyBy from 'lodash/keyBy'

import {Article} from 'models/helpCenter/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import Tooltip from 'pages/common/components/Tooltip'
import {LanguageList} from 'pages/common/components/LanguageBulletList'
import {
    ArticleRowActionTypes,
    ARTICLE_ROW_ACTIONS,
} from 'pages/settings/helpCenter/constants'
import {useLimitations} from 'hooks/helpCenter/useLimitations'
import {sanitizeHtmlDefault} from 'utils/html'

import up from '../../../../../../../img/icons/rating-up-white.svg'
import down from '../../../../../../../img/icons/rating-down-white.svg'
import star from '../../../../../../../img/icons/rating-star.svg'

import {useRatingScore} from '../../../hooks/useRatingScore'
import {useSupportedLocales} from '../../../providers/SupportedLocales'
import {TableActions} from '../../TableActions'
import {isLoading, SearchResultArticle} from '../types'
import {SearchResultsLoadingContent} from '../SearchResultsLoadingContent'
import {isResultOrAncestorUnlisted} from '../utils'
import VisibilityCell from '../../VisibilityCell/VisibilityCell'

import nestingCss from '../nesting.less'

import css from './SearchResultsArticleRow.less'

const Highlight: FC<{
    article: Article
    hits: SearchResultArticle['algoliaHits']
}> = ({article, hits}) => {
    const localizedAlgoliaHit = hits[article.translation.locale]

    const matchingHighlightedTitleDraft =
        localizedAlgoliaHit?._highlightResult?.title_draft

    if (
        matchingHighlightedTitleDraft?.matchLevel === 'full' ||
        matchingHighlightedTitleDraft?.matchLevel === 'partial'
    ) {
        const sanitizedTitleDraft = sanitizeHtmlDefault(
            matchingHighlightedTitleDraft.value
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
        isArticleOrAncestorUnlisted: boolean
    ) => void
}

export const SearchResultsArticleRow: FC<Props> = ({
    article,
    level,
    onArticleClick,
    onArticleClickSettings,
}) => {
    const locales = useSupportedLocales()

    const entity = isLoading(article.article) ? null : article.article
    const ratingScore = useRatingScore(entity?.rating)
    const localesByCode = useMemo(() => _keyBy(locales, 'code'), [locales])
    const limitations = useLimitations()

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

    return (
        <TableBodyRow
            aria-label="open article"
            className={css.row}
            onClick={() => entity !== null && onArticleClick(entity)}
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
            <BodyCell style={{width: 77, minWidth: 77}}>
                <div className={css.rating} id={`rating-${article.id}`}>
                    <img alt="star" src={star} />
                    <div className={css['rating-text']}>{ratingScore}%</div>
                </div>
                {entity?.rating && (
                    <Tooltip
                        delay={100}
                        target={`rating-${article.id}`}
                        placement="top"
                        popperClassName={css.tooltip}
                        innerClassName={css['tooltip-inner']}
                        arrowClassName={css['tooltip-arrow']}
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
                style={{width: 110, minWidth: 110}}
                className={css['nested-cell']}
            >
                {entity !== null && (
                    <VisibilityCell
                        status={entity.translation.visibility_status}
                        isParentUnlisted={isAncestorUnlisted}
                        isArticle
                    />
                )}
            </BodyCell>
            <BodyCell style={{width: 105, minWidth: 105}}>
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
            <BodyCell style={{width: 120}} innerClassName={css.actions}>
                <TableActions
                    actions={ARTICLE_ROW_ACTIONS.map(
                        ({icon, name, tooltip}) => ({
                            icon,
                            name,
                            tooltip: {
                                content: tooltip,
                                target: `${name}-${article.id}`,
                            },
                            disabled: limitations[name]?.disabled,
                        })
                    )}
                    onClick={(
                        ev: React.MouseEvent,
                        name: ArticleRowActionTypes
                    ) => {
                        ev.stopPropagation()
                        if (entity !== null) {
                            onArticleClickSettings(
                                name,
                                entity,
                                isAncestorUnlisted
                            )
                        }
                    }}
                />
            </BodyCell>
        </TableBodyRow>
    )
}
