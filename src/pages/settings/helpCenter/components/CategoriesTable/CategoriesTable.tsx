import React from 'react'
import {chain} from 'lodash'

import {Category} from '../../../../../models/helpCenter/types'

import HeaderCell from '../../../../common/components/table/cells/HeaderCell'
import TableHead from '../../../../common/components/table/TableHead'
import TableWrapper from '../../../../common/components/table/TableWrapper'

import {
    CategoriesTableBody,
    TableBodyProps,
} from './components/CategoriesTableBody'

type Props = Partial<TableBodyProps>

export const CategoriesTable = ({
    categories = [],
    renderArticleList,
    onRowClick,
}: Props): JSX.Element => {
    const [records, setRecords] = React.useState(
        chain(categories)
            .sortBy(['position'])
            .forEach((category: Category, index) => {
                category.position = index
            })
            .value()
    )

    const handleOnDropCategory = (dragIndex: number, hoverIndex: number) => {
        const dragRecord = records.find(
            (category) => category.position === dragIndex
        )
        const nextRecords = [...records]

        if (dragRecord) {
            nextRecords.splice(dragIndex, 1)
            nextRecords.splice(hoverIndex, 0, dragRecord)

            chain(nextRecords)
                .map((category: Category, index: number) => {
                    category.position = index
                    return category
                })
                .sortBy('position')
                .value()

            setRecords(nextRecords)
        }
    }

    return (
        <TableWrapper>
            <TableHead>
                <HeaderCell style={{width: 25}} />
                <HeaderCell />
                <HeaderCell style={{width: 124}} />
                <HeaderCell style={{width: 160}} />
            </TableHead>
            <CategoriesTableBody
                categories={records}
                renderArticleList={renderArticleList}
                onRowClick={onRowClick}
                onMoveEntity={handleOnDropCategory}
            />
        </TableWrapper>
    )
}
