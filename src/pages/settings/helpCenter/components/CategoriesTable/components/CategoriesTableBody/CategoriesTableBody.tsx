import React from 'react'

import {Category} from '../../../../../../../models/helpCenter/types'

import TableBody from '../../../../../../common/components/table/TableBody'

import {DroppableCategoryRow, RowEventListeners} from '../DroppableCategoryRow'

import css from './CategoriesTableBody.less'

export type TableBodyProps = RowEventListeners & {
    categories?: Category[]
    renderArticleList?: (category: Category) => React.ReactElement
}

export const CategoriesTableBody = ({
    categories = [],
    renderArticleList,
    onRowClick,
    onMoveEntity,
    onDropEntity,
}: TableBodyProps): JSX.Element => {
    return (
        <TableBody className={css['main-table']}>
            {categories.map((category) => (
                <DroppableCategoryRow
                    key={category.id}
                    category={category}
                    renderArticleList={renderArticleList}
                    onRowClick={onRowClick}
                    onMoveEntity={onMoveEntity}
                    onDropEntity={onDropEntity}
                />
            ))}
        </TableBody>
    )
}
