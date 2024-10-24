import React from 'react'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import nestingCss from '../SearchResults/nesting.less'
import {SearchResultsLoadingContent} from '../SearchResults/SearchResultsLoadingContent'

import css from './CategoriesTableSkeleton.less'

const SkeletonRow = () => {
    return (
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
}

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
                {Array(5)
                    .fill(null)
                    .map((_, index) => (
                        <SkeletonRow key={`skeleton_${index}`} />
                    ))}
            </TableBody>
        </TableWrapper>
    )
}
