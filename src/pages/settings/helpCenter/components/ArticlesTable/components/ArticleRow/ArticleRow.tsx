import React, {useMemo} from 'react'
import classNames from 'classnames'
import _keyBy from 'lodash/keyBy'
import Tooltip from 'pages/common/components/Tooltip'

import {useLimitations} from '../../../../../../../hooks/helpCenter/useLimitations'
import {useRatingScore} from '../../../../hooks/useRatingScore'
import {Article} from '../../../../../../../models/helpCenter/types'
import {LanguageList} from '../../../../../../common/components/LanguageBulletList'
import BodyCell from '../../../../../../common/components/table/cells/BodyCell'
import TableBodyRow from '../../../../../../common/components/table/TableBodyRow'
import {ARTICLE_ROW_ACTIONS} from '../../../../constants'
import {useSupportedLocales} from '../../../../providers/SupportedLocales'
import {Callbacks, useReorderDnD} from '../../../../hooks/useReorderDnD'
import {TableActions} from '../../../TableActions'

import up from '../../../../../../../../img/icons/rating-up-white.svg'
import down from '../../../../../../../../img/icons/rating-down-white.svg'
import star from '../../../../../../../../img/icons/rating-star.svg'

import css from './ArticleRow.less'

export type RowEventListeners = {
    onMoveEntity: Callbacks['onHover']
    onDropEntity?: Callbacks['onDrop']
    onClickRow: (article: Article) => void
    onClickSettings: (
        ev: React.MouseEvent,
        name: string,
        article: Article
    ) => void
}

type Props = RowEventListeners & {
    isNested?: boolean
    article: Article
    categoryId: number | null
    position: number
}

export const ArticleRow = ({
    isNested = false,
    article,
    position,
    categoryId,
    onMoveEntity,
    onClickRow,
    onDropEntity,
    onClickSettings,
}: Props): JSX.Element => {
    const locales = useSupportedLocales()
    const limitations = useLimitations()
    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        {
            position,
            id: article.id,
            type: `ARTICLE-${categoryId ?? 'UNCATEGORIZED'}`,
        },
        [`ARTICLE-${categoryId ?? 'UNCATEGORIZED'}`],
        {onHover: onMoveEntity, onDrop: onDropEntity}
    )

    const opacity = isDragging ? 0 : 1

    const localesByCode = useMemo(() => _keyBy(locales, 'code'), [locales])

    const languageList = useMemo(() => {
        if (article.available_locales.length > 0) {
            return article.available_locales.map((code) => localesByCode[code])
        }

        return [localesByCode[article.translation.locale]]
    }, [article, localesByCode])

    const ratingScore = useRatingScore(article.rating)

    const handleOnActionsClick = (ev: React.MouseEvent, name: string) => {
        return onClickSettings(ev, name, article)
    }

    return (
        <TableBodyRow
            key={article.id}
            ref={dropRef as React.Ref<HTMLTableRowElement>}
            aria-label="open article"
            data-handler-id={handlerId}
            className={css.row}
            style={{opacity}}
            onClick={() => onClickRow(article)}
        >
            <BodyCell
                className={classNames({
                    [css['nested-cell']]: isNested,
                })}
            >
                <div
                    ref={dragRef as React.RefObject<HTMLDivElement>}
                    className={classNames(
                        css['drag-handler'],
                        'material-icons'
                    )}
                >
                    drag_indicator
                </div>
            </BodyCell>
            <BodyCell className={css['nested-cell']}>
                {article.translation.title}
            </BodyCell>
            <BodyCell size="small">
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
            <BodyCell width={130} className={css['nested-cell']}>
                <div className={css.rating} id={`rating-${article.id}`}>
                    <img alt="star" src={star} />
                    <div className={css['rating-text']}>{ratingScore}%</div>
                </div>
                {article.rating && (
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
            <BodyCell width={120} innerClassName={css.actions}>
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
                    onClick={handleOnActionsClick}
                />
            </BodyCell>
        </TableBodyRow>
    )
}
