import classNames from 'classnames'

import { Skeleton } from '@gorgias/axiom'

import {
    ScoredSurveyDataKey,
    ScoredSurveysData,
} from 'domains/reporting/hooks/quality-management/satisfaction/useScoredSurveys'
import css from 'domains/reporting/pages/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysTable.less'
import {
    SCORED_SURVEYS_TABLE_COLUMNS,
    SURVEYS_PER_PAGE,
} from 'domains/reporting/pages/quality-management/satisfaction/ScoredSurveysChart/utils'
import { opposite, OrderDirection } from 'models/api/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

export type TableState = {
    currentPage: number
    orderBy: ScoredSurveyDataKey
    orderDirection: OrderDirection
}

type Props = {
    data?: ScoredSurveysData[]
    isFetching: boolean
    tableState: TableState
    handleSort: (property: ScoredSurveyDataKey) => void
}

export default function ScoredSurveysTable({
    data,
    isFetching,
    tableState,
    handleSort,
}: Props) {
    const { orderBy, orderDirection } = tableState

    return (
        <div className={css.container}>
            <TableWrapper className={css.table}>
                <TableHead>
                    {SCORED_SURVEYS_TABLE_COLUMNS.map((column) => {
                        const { title, width, property, justifyContent } =
                            column
                        return (
                            <HeaderCellProperty
                                key={title}
                                direction={opposite(orderDirection)}
                                title={title}
                                isOrderedBy={orderBy === property}
                                justifyContent={justifyContent}
                                wrapContent
                                width={width}
                                {...(property && {
                                    onClick: () => handleSort(property),
                                })}
                            />
                        )
                    })}
                </TableHead>
                <TableBody>
                    {isFetching ? (
                        <TableBodySkeleton />
                    ) : (
                        data?.map((rowData) => (
                            <TableBodyRow key={rowData.ticketId}>
                                {SCORED_SURVEYS_TABLE_COLUMNS.map(
                                    (
                                        {
                                            width,
                                            justifyContent,
                                            CellComponent,
                                        },
                                        index,
                                    ) => (
                                        <CellComponent
                                            innerClassName={css.rowCell}
                                            key={`${rowData.ticketId}-${index}`}
                                            width={width}
                                            justifyContent={justifyContent}
                                            {...rowData}
                                        />
                                    ),
                                )}
                            </TableBodyRow>
                        ))
                    )}
                </TableBody>
            </TableWrapper>
        </div>
    )
}

export const TableBodySkeleton = () => {
    return (
        <>
            {Array.from({ length: SURVEYS_PER_PAGE }, (_, index) => (
                <TableBodyRow key={index}>
                    {SCORED_SURVEYS_TABLE_COLUMNS.map(({ title, width }) => (
                        <BodyCell
                            key={title}
                            width={width}
                            className={classNames(css.sticky)}
                        >
                            <Skeleton containerClassName={css.skeleton} />
                        </BodyCell>
                    ))}
                </TableBodyRow>
            ))}
        </>
    )
}
