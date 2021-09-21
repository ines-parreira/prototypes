import {chain as _chain} from 'lodash'
import React from 'react'

import {Category} from '../../../../../models/helpCenter/types'
import HeaderCell from '../../../../common/components/table/cells/HeaderCell'
import TableHead from '../../../../common/components/table/TableHead'
import TableWrapper from '../../../../common/components/table/TableWrapper'

import css from './CategoriesTable.less'
import {
    CategoriesTableBody,
    TableBodyProps,
} from './components/CategoriesTableBody'

type Props = Partial<TableBodyProps> & {
    onReorderFinish?: (categories: Category[]) => void
}

export const CategoriesTable = ({
    categories = [],
    renderArticleList,
    onRowClick,
    onReorderFinish,
}: Props): JSX.Element => {
    const [records, setRecords] = React.useState(
        _chain(categories).sortBy(['position']).value()
    )

    React.useEffect(() => {
        setRecords(_chain(categories).sortBy(['position']).value())
    }, [categories])

    const handleOnDropCategory = (dragIndex: number, hoverIndex: number) => {
        const dragRecord = records.find(
            (category) => category.position === dragIndex
        )
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
        onReorderFinish && onReorderFinish(records)
    }

    return (
        <TableWrapper>
            <TableHead>
                <HeaderCell style={{width: 25}} className={css.headerCell} />
                <HeaderCell className={css.headerCell} />
                <HeaderCell style={{width: 124}} className={css.headerCell} />
                <HeaderCell style={{width: 160}} className={css.headerCell} />
            </TableHead>
            <CategoriesTableBody
                categories={records}
                renderArticleList={renderArticleList}
                onRowClick={onRowClick}
                onMoveEntity={handleOnDropCategory}
                onDropEntity={handleOnReorderFinish}
            />
        </TableWrapper>
    )
}
