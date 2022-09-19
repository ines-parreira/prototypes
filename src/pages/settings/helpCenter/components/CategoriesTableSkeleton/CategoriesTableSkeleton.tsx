import React from 'react'
import _fill from 'lodash/fill'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {SearchResultsLoadingContent} from '../SearchResults/SearchResultsLoadingContent'

import nestingCss from '../SearchResults/nesting.less'
import css from './CategoriesTableSkeleton.less'

const skeletonRow = (
    <TableBodyRow className={css.row}>
        <BodyCell className={nestingCss[`nesting-level-1`]}>
            <SearchResultsLoadingContent />
        </BodyCell>
        <BodyCell />
        <BodyCell />
        <BodyCell />
        <BodyCell />
    </TableBodyRow>
)

export const CategoriesTableSkeleton: React.FC = () => {
    return (
        <TableWrapper>
            <TableHead>
                <HeaderCell className={css.headerCell} />
                <HeaderCell className={css.headerCell} />
                <HeaderCell className={css.headerCell} style={{width: 124}} />
                <HeaderCell className={css.headerCell} style={{width: 160}} />
            </TableHead>
            <TableBody className={css['main-table']}>
                {_fill(Array(5), skeletonRow)}
            </TableBody>
        </TableWrapper>
    )
}
