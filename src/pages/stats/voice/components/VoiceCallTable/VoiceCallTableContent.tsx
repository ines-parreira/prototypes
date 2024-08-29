import React, {UIEventHandler, useMemo, useState} from 'react'
import classNames from 'classnames'
import useMeasure from 'hooks/useMeasure'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {VoiceCallSummary} from 'pages/stats/voice/models/types'
import {CALL_LIST_PAGE_SIZE} from 'pages/stats/voice/constants/voiceOverview'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'
import {OrderDirection} from 'models/api/types'

import css from './VoiceCallTable.less'
import {VoiceCallTableColumnName, skeletonColumnsWidth} from './constants'
import {Cell, getVoiceDrillDownColumns} from './utils'
import {
    getOrderedCells,
    getOrderedHeaderCells,
} from './voiceCallTableContentCells'

type VoiceCallTableContentProps = {
    data?: VoiceCallSummary[]
    isFetching: boolean
    columns?: VoiceCallTableColumnName[]
    onRowClick?: (voiceCall: VoiceCallSummary) => void
    isRecordingDownloadable?: boolean
    useMeasuredWidth?: boolean
    noDataTitle?: string
    noDataDescription?: string
    ongoingTimeColumnTitle?: string
    orderBy?: VoiceCallTableColumnName
    orderDirection?: OrderDirection
    onColumnClick?: (column: VoiceCallTableColumnName) => void
}

export default function VoiceCallTableContent({
    data,
    isFetching,
    columns,
    onRowClick,
    isRecordingDownloadable,
    useMeasuredWidth = true,
    noDataTitle = 'No voice calls',
    noDataDescription = 'Try adjusting filters to get results.',
    ongoingTimeColumnTitle,
    orderBy,
    orderDirection,
    onColumnClick,
}: VoiceCallTableContentProps) {
    const [ref, {width: measuredWidth}] = useMeasure<HTMLDivElement>()
    const [isTableScrolled, setIsTableScrolled] = useState(false)

    const width = useMeasuredWidth ? measuredWidth : undefined

    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }

    const skeletons = useMemo(() => {
        const skeletonColumns = columns ?? getVoiceDrillDownColumns()
        const orderedSkeletonColumns = skeletonColumns.map((columnName) => [
            columnName,
            skeletonColumnsWidth[columnName],
        ])
        return new Array(CALL_LIST_PAGE_SIZE).fill(null).map((_, rowIndex) => (
            <TableBodyRow key={rowIndex} className={css.tableRow}>
                {orderedSkeletonColumns.map(([key, width]) => (
                    <BodyCell
                        key={key}
                        justifyContent={
                            key === VoiceCallTableColumnName.Duration ||
                            key === VoiceCallTableColumnName.WaitTime
                                ? 'right'
                                : 'left'
                        }
                        className={classNames({
                            [css.withShadow]:
                                isTableScrolled &&
                                key === VoiceCallTableColumnName.Activity,
                        })}
                    >
                        <Skeleton inline width={width} />
                    </BodyCell>
                ))}
            </TableBodyRow>
        ))
    }, [isTableScrolled, columns])

    if (!isFetching && data?.length === 0) {
        return (
            <NoDataAvailable
                title={noDataTitle}
                description={noDataDescription}
                className={css.noData}
            />
        )
    }

    return (
        <>
            <div ref={ref} className={css.container} onScroll={handleScroll}>
                <TableWrapper className={css.table} style={{width}}>
                    <TableHead
                        className={classNames(css.tableHead, css.tableRow)}
                    >
                        {getOrderedHeaderCells({
                            columns,
                            isTableScrolled,
                            ongoingTimeColumnTitle,
                        }).map((cell) => (
                            <HeaderCellProperty
                                key={`${cell.key}-header-cell`}
                                isOrderedBy={cell.key === orderBy}
                                direction={orderDirection}
                                onClick={() => onColumnClick?.(cell.key)}
                                {...cell.props}
                            />
                        ))}
                    </TableHead>
                    <TableBody>
                        {isFetching
                            ? skeletons
                            : data?.map((item, index) => (
                                  <TableBodyRow
                                      key={`row-${index}`}
                                      className={css.tableRow}
                                      onClick={() => onRowClick?.(item)}
                                  >
                                      {getOrderedCells({
                                          item,
                                          columns,
                                          isTableScrolled,
                                          isRecordingDownloadable,
                                      }).map((cell: Cell<typeof BodyCell>) => (
                                          <BodyCell
                                              key={`${cell.key}-cell`}
                                              {...cell.props}
                                          />
                                      ))}
                                  </TableBodyRow>
                              ))}
                    </TableBody>
                </TableWrapper>
            </div>
        </>
    )
}
