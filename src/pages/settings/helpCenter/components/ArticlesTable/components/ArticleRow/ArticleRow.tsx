import React from 'react'
import classNames from 'classnames'

import {HelpCenterArticle} from '../../../../../../../models/helpCenter/types'

import {LanguageList} from '../../../../../../common/components/LanguageBulletList'
import BodyCell from '../../../../../../common/components/table/cells/BodyCell'
import TableBodyRow from '../../../../../../common/components/table/TableBodyRow'

import {ARTICLE_ROW_ACTIONS} from '../../../../constants'
import {useReorderDnD, Callbacks} from '../../../../hooks/useReorderDnD'
import {useSupportedLocales} from '../../../../providers/SupportedLocales'

import {TableActions} from '../../../TableActions'

import css from './ArticleRow.less'

export type RowEventListeners = {
    onMoveEntity: Callbacks['onHover']
    onDropEntity?: Callbacks['onDrop']
    onClickRow: (article: HelpCenterArticle) => void
    onClickSettings: (
        ev: React.MouseEvent,
        name: string,
        article: HelpCenterArticle
    ) => void
}

type Props = RowEventListeners & {
    isNested?: boolean
    article: HelpCenterArticle
    categoryId: number
}

export const ArticleRow = ({
    isNested = false,
    article,
    categoryId,
    onMoveEntity,
    onClickRow,
    onDropEntity,
    onClickSettings,
}: Props): JSX.Element => {
    const localesByCode = useSupportedLocales()
    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        {
            position: article?.position || 0,
            id: article.id,
            type: `ARTICLE-${categoryId}`,
        },
        [`ARTICLE-${categoryId}`],
        {onHover: onMoveEntity, onDrop: onDropEntity}
    )

    const opacity = isDragging ? 0 : 1

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
                width={25}
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
                {article.translation?.title}
            </BodyCell>
            <BodyCell>
                {article.translation && (
                    <LanguageList
                        helpcenterId={article.id}
                        defaultLanguage={
                            localesByCode[article.translation.locale]
                        }
                        languageList={[
                            localesByCode[article.translation.locale],
                        ]}
                    />
                )}
            </BodyCell>
            <BodyCell width={120} innerClassName={css.actions}>
                <TableActions
                    actions={ARTICLE_ROW_ACTIONS}
                    onClick={handleOnActionsClick}
                />
            </BodyCell>
        </TableBodyRow>
    )
}
