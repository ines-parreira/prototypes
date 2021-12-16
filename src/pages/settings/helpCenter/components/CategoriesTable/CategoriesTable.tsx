import {chain as _chain} from 'lodash'
import React, {useEffect, useState} from 'react'

import {Category} from '../../../../../models/helpCenter/types'
import HeaderCell from '../../../../common/components/table/cells/HeaderCell'
import TableBody from '../../../../common/components/table/TableBody'
import TableHead from '../../../../common/components/table/TableHead'
import TableWrapper from '../../../../common/components/table/TableWrapper'

import {
    CategoriesTableRow,
    CategoriesTableRowProps,
} from './components/CategoriesTableRow'
import css from './CategoriesTable.less'

export type CategoriesTableProps = Pick<
    CategoriesTableRowProps,
    'renderArticleList'
> & {
    categories: Category[]
    onReorderFinish: (categories: Category[]) => void
    shouldRenderEmptyUncategorizedRow: boolean
}

export const CategoriesTable = ({
    categories,
    onReorderFinish,
    renderArticleList,
    shouldRenderEmptyUncategorizedRow,
}: CategoriesTableProps): JSX.Element => {
    const [records, setRecords] = useState(
        _chain(categories).sortBy(['position']).value()
    )

    useEffect(() => {
        setRecords(_chain(categories).sortBy(['position']).value())
    }, [categories])

    const handleOnDropCategory = (dragIndex: number, hoverIndex: number) => {
        const dragRecord = records[dragIndex]
        let nextRecords = [...records]

        if (dragRecord) {
            nextRecords.splice(dragIndex, 1)
            nextRecords.splice(hoverIndex, 0, dragRecord)

            nextRecords = _chain(nextRecords)
                .map((category: Category, index: number) => ({
                    ...category,
                    position: index,
                }))
                .sortBy('position')
                .value()

            setRecords(nextRecords)
        }
    }

    const handleOnReorderFinish = () => {
        onReorderFinish(records)
    }

    return (
        <TableWrapper>
            <TableHead>
                <HeaderCell style={{width: 25}} className={css.headerCell} />
                <HeaderCell className={css.headerCell} />
                <HeaderCell style={{width: 124}} className={css.headerCell} />
                <HeaderCell style={{width: 160}} className={css.headerCell} />
            </TableHead>
            <TableBody className={css['main-table']}>
                <CategoriesTableRow
                    categoryId={null}
                    shouldRenderRowWithoutArticles={
                        shouldRenderEmptyUncategorizedRow
                    }
                    title="Uncategorized articles"
                    renderArticleList={renderArticleList}
                    tooltip="Uncategorized articles will always be the last ones on the list in the live Help Center."
                />
                {records.map((category, index) => (
                    <CategoriesTableRow
                        key={category.id}
                        categoryId={category.id}
                        category={category}
                        position={index}
                        title={category.translation.title}
                        renderArticleList={renderArticleList}
                        onMoveEntity={handleOnDropCategory}
                        onDropEntity={handleOnReorderFinish}
                    />
                ))}
            </TableBody>
        </TableWrapper>
    )
}
