import React from 'react'
import classNames from 'classnames'

import {Button} from 'reactstrap'

import {HelpCenterArticle} from '../../../../../../../models/helpCenter/types'

import BodyCell from '../../../../../../common/components/table/cells/BodyCell'
import TableBodyRow from '../../../../../../common/components/table/TableBodyRow'

import {useReorderDnD, Callbacks} from '../../../../hooks/useReorderDnD'

import css from './ArticleRow.less'

export type RowEventListeners = {
    onMoveEntity: Callbacks['onHover']
    onClickRow: (article: HelpCenterArticle) => void
    onClickSettings: (
        ev: React.MouseEvent<HTMLButtonElement>,
        article: HelpCenterArticle
    ) => void
}

type Props = RowEventListeners & {
    article: HelpCenterArticle
    categoryId: number
}

export const ArticleRow = ({
    article,
    categoryId,
    onMoveEntity,
    onClickRow,
    onClickSettings,
}: Props): JSX.Element => {
    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        {
            position: article?.position || 0,
            id: article.id,
            type: `ARTICLE-${categoryId}`,
        },
        [`ARTICLE-${categoryId}`],
        {onHover: onMoveEntity}
    )

    const opacity = isDragging ? 0 : 1

    return (
        <TableBodyRow
            key={article.id}
            ref={dropRef as React.Ref<HTMLTableRowElement>}
            data-handler-id={handlerId}
            className={css.row}
            style={{opacity}}
            onClick={() => onClickRow(article)}
        >
            <BodyCell className={css['nested-cell']} style={{width: 25}}>
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
            <BodyCell style={{width: 25}}>
                <Button
                    aria-label="open article settings"
                    className={css.iconBtn}
                    onClick={(ev) => onClickSettings(ev, article)}
                >
                    <span className="material-icons">settings</span>
                </Button>
            </BodyCell>
        </TableBodyRow>
    )
}
