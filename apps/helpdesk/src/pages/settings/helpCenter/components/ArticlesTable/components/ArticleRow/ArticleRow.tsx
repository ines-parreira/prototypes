import type React from 'react'
import { useMemo } from 'react'

import classNames from 'classnames'
import _keyBy from 'lodash/keyBy'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import down from 'assets/img/icons/rating-down-white.svg'
import star from 'assets/img/icons/rating-star.svg'
import up from 'assets/img/icons/rating-up-white.svg'
import type { Article } from 'models/helpCenter/types'
import { CustomerVisibilityEnum } from 'models/helpCenter/types'
import { LanguageList } from 'pages/common/components/LanguageBulletList'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import type { Callbacks } from 'pages/common/hooks/useReorderDnD'
import { useReorderDnD } from 'pages/common/hooks/useReorderDnD'
import type { ArticleRowActionTypes } from 'pages/settings/helpCenter/constants'
import { useRatingScore } from 'pages/settings/helpCenter/hooks/useRatingScore'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { isNotPublished } from 'pages/settings/helpCenter/utils/helpCenter.utils'
import { getDetailedFormattedDate, getFormattedDate } from 'utils/date'

import { useArticleRowActions } from '../../../../hooks/useArticleRowActions'
import { TableActions } from '../../../TableActions'
import VisibilityCell from '../../../VisibilityCell/VisibilityCell'

import css from './ArticleRow.less'

export type RowEventListeners = {
    onMoveEntity: Callbacks['onHover']
    onDropEntity?: Callbacks['onDrop']
    onClickRow: (article: Article) => void
    onClickSettings: (
        ev: React.MouseEvent,
        name: ArticleRowActionTypes,
        article: Article,
        isArticleOrAncestorUnlisted: boolean,
    ) => void
}

type Props = RowEventListeners & {
    isNested?: boolean
    article: Article
    categoryId: number | null
    level: number
    isAncestorUnlisted: boolean
    position: number
}

export const ArticleRow = ({
    isNested = false,
    level,
    isAncestorUnlisted,
    article,
    position,
    categoryId,
    onMoveEntity,
    onClickRow,
    onDropEntity,
    onClickSettings,
}: Props): JSX.Element => {
    const locales = useSupportedLocales()

    const { dragRef, dropRef, handlerId, isDragging } = useReorderDnD(
        {
            position,
            id: article.id,
            type: `ARTICLE-${categoryId ?? 'UNCATEGORIZED'}`,
        },
        [`ARTICLE-${categoryId ?? 'UNCATEGORIZED'}`],
        { onHover: onMoveEntity, onDrop: onDropEntity },
    )

    const articleRowActions = useArticleRowActions(article.id)

    const opacity = isDragging ? 0 : 1

    const localesByCode = useMemo(() => _keyBy(locales, 'code'), [locales])

    const languageList = useMemo(() => {
        if (article.available_locales.length > 0) {
            return article.available_locales
                .filter((code) => localesByCode[code])
                .map((code) => localesByCode[code])
        }

        return [localesByCode[article.translation.locale]]
    }, [article, localesByCode])

    const ratingScore = useRatingScore(article.rating)

    const { lastUpdate, lastUpdateDetailed } = useMemo(
        () => ({
            lastUpdate: getFormattedDate(article.translation.updated_datetime),
            lastUpdateDetailed: getDetailedFormattedDate(
                article.translation.updated_datetime,
            ),
        }),
        [article],
    )

    const handleOnActionsClick = (
        ev: React.MouseEvent,
        name: ArticleRowActionTypes,
    ) => {
        ev.stopPropagation()

        const isArticleOrAncestorUnlisted =
            isAncestorUnlisted ||
            article.translation.customer_visibility ===
                CustomerVisibilityEnum.UNLISTED

        return onClickSettings(ev, name, article, isArticleOrAncestorUnlisted)
    }

    return (
        <TableBodyRow
            key={article.id}
            ref={dropRef as React.Ref<HTMLTableRowElement>}
            aria-label="open article"
            data-handler-id={handlerId}
            className={css.row}
            style={{ opacity }}
            onClick={() => onClickRow(article)}
        >
            <BodyCell
                className={classNames(css[`sub-category-articles-${level}`], {
                    [css['nested-cell']]: isNested,
                })}
            >
                <div
                    ref={dragRef as React.RefObject<HTMLDivElement>}
                    className={classNames(
                        css['drag-handler'],
                        'material-icons',
                    )}
                >
                    drag_indicator
                </div>
            </BodyCell>
            <BodyCell className={css['nested-cell']}>
                {article.translation.title}
            </BodyCell>
            <BodyCell
                style={{ width: 85, minWidth: 85 }}
                className={css['nested-cell']}
            >
                <div className={css.rating} id={`rating-${article.id}`}>
                    <img alt="star" src={star} />
                    <div className={css['rating-text']}>{ratingScore}%</div>
                </div>
                {article.rating && (
                    <Tooltip
                        delay={100}
                        target={`rating-${article.id}`}
                        placement="top"
                        innerProps={{
                            popperClassName: css.tooltip,
                            innerClassName: css['tooltip-inner'],
                        }}
                        arrowClassName={css['tooltip-arrow']}
                    >
                        <div className={css.rating}>
                            <div>
                                <img
                                    alt="up"
                                    className={css['rating-icon']}
                                    src={up}
                                />
                                {article.rating.up}
                            </div>
                            <div className={css['rating-separator']}>|</div>
                            <div>
                                <img
                                    alt="down"
                                    className={css['rating-icon']}
                                    src={down}
                                />
                                {article.rating.down}
                            </div>
                        </div>
                    </Tooltip>
                )}
            </BodyCell>
            <BodyCell
                style={{ width: 110, minWidth: 110 }}
                className={css['nested-cell']}
            >
                <VisibilityCell
                    status={
                        article.translation.customer_visibility ??
                        CustomerVisibilityEnum.PUBLIC
                    }
                    isParentUnlisted={isAncestorUnlisted}
                    isArticle
                    isDraft={isNotPublished(article)}
                />
            </BodyCell>
            <BodyCell style={{ width: 105, minWidth: 105 }}>
                {article.translation && (
                    <LanguageList
                        id={article.id}
                        defaultLanguage={
                            localesByCode[article.translation.locale]
                        }
                        languageList={languageList}
                    />
                )}
            </BodyCell>
            <BodyCell style={{ width: 105, minWidth: 105 }}>
                <div id={`last-update-${article.id}`}>{lastUpdate}</div>
                <Tooltip
                    delay={100}
                    target={`last-update-${article.id}`}
                    placement="top"
                    innerProps={{
                        popperClassName: css.tooltip,
                        innerClassName: css['tooltip-inner'],
                    }}
                    arrowClassName={css['tooltip-arrow']}
                >
                    {lastUpdateDetailed}
                </Tooltip>
            </BodyCell>
            <BodyCell style={{ width: 120 }} innerClassName={css.actions}>
                <TableActions
                    actions={articleRowActions}
                    onClick={handleOnActionsClick}
                />
            </BodyCell>
        </TableBodyRow>
    )
}
