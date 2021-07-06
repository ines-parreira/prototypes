import React from 'react'

import {HelpCenterArticle} from '../../../../../../../models/helpCenter/types'

import TableBody from '../../../../../../common/components/table/TableBody'

import {ArticleRow, RowEventListeners} from '../ArticleRow'

type Props = RowEventListeners & {
    categoryId: number
    list: HelpCenterArticle[]
}

export const ArticlesTableBody = ({
    categoryId,
    list,
    onMoveEntity,
    onClickRow,
    onClickSettings,
}: Props): JSX.Element => {
    return (
        <TableBody>
            {list.map((article) => (
                <ArticleRow
                    key={article.id}
                    categoryId={categoryId}
                    article={article}
                    onMoveEntity={onMoveEntity}
                    onClickRow={onClickRow}
                    onClickSettings={(ev) => onClickSettings(ev, article)}
                />
            ))}
        </TableBody>
    )
}
