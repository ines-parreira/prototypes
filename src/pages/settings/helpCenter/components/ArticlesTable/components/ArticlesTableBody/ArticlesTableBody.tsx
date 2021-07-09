import React from 'react'

import {HelpCenterArticle} from '../../../../../../../models/helpCenter/types'

import TableBody from '../../../../../../common/components/table/TableBody'

import {ArticleRow, RowEventListeners} from '../ArticleRow'

type Props = RowEventListeners & {
    isNested?: boolean
    categoryId: number
    list: HelpCenterArticle[]
}

export const ArticlesTableBody = ({
    isNested = false,
    categoryId,
    list,
    onMoveEntity,
    onDropEntity,
    onClickRow,
    onClickSettings,
}: Props): JSX.Element => {
    return (
        <TableBody>
            {list.map((article) => (
                <ArticleRow
                    key={article.id}
                    isNested={isNested}
                    categoryId={categoryId}
                    article={article}
                    onMoveEntity={onMoveEntity}
                    onDropEntity={onDropEntity}
                    onClickRow={onClickRow}
                    onClickSettings={onClickSettings}
                />
            ))}
        </TableBody>
    )
}
