import type { UIEventHandler } from 'react'
import React, { useMemo, useState } from 'react'

import { useMeasure } from '@repo/hooks'
import classNames from 'classnames'

import { Skeleton } from '@gorgias/axiom'

import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import {
    skeletonColumnsWidth,
    VoiceCallTableColumn,
} from 'domains/reporting/pages/voice/components/VoiceCallTable/constants'
import type { Cell } from 'domains/reporting/pages/voice/components/VoiceCallTable/utils'
import css from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTable.less'
import {
    getOrderedCells,
    getOrderedHeaderCells,
} from 'domains/reporting/pages/voice/components/VoiceCallTable/voiceCallTableContentCells'
import VoiceQueueProvider from 'domains/reporting/pages/voice/components/VoiceQueue/VoiceQueueProvider'
import { CALL_LIST_PAGE_SIZE } from 'domains/reporting/pages/voice/constants/voiceOverview'
import type { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import type { OrderDirection } from 'models/api/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

type VoiceCallTableContentProps = {
    data?: VoiceCallSummary[]
    isFetching: boolean
    columns: VoiceCallTableColumn[]
    onRowClick?: (voiceCall: VoiceCallSummary) => void
    isRecordingDownloadable?: boolean
    useMeasuredWidth?: boolean
    noDataTitle?: string
    noDataDescription?: string
    ongoingTimeColumnTitle?: string
    orderBy?: VoiceCallTableColumn
    orderDirection?: OrderDirection
    onColumnClick?: (column: VoiceCallTableColumn) => void
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
    const [ref, { width: measuredWidth }] = useMeasure<HTMLDivElement>()
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
        const skeletonColumns = columns
        const orderedSkeletonColumns = skeletonColumns.map((columnName) => [
            columnName,
            skeletonColumnsWidth[columnName],
        ])
        return Array.from({ length: CALL_LIST_PAGE_SIZE }, (_, rowIndex) => (
            <TableBodyRow key={rowIndex} className={css.tableRow}>
                {orderedSkeletonColumns.map(([key, width]) => (
                    <BodyCell
                        key={key}
                        justifyContent={
                            key === VoiceCallTableColumn.Duration ||
                            key === VoiceCallTableColumn.WaitTime
                                ? 'right'
                                : 'left'
                        }
                        className={classNames({
                            [css.withShadow]:
                                isTableScrolled &&
                                key === VoiceCallTableColumn.Activity,
                        })}
                    >
                        <Skeleton inline width={width} />
                    </BodyCell>
                ))}
            </TableBodyRow>
        ))
    }, [isTableScrolled, columns])

    if (!isFetching && (data === undefined || data?.length === 0)) {
        return (
            <NoDataAvailable
                title={noDataTitle}
                description={noDataDescription}
                className={css.noData}
            />
        )
    }

    const queueIds = data
        ? (Array.from(
              new Set(
                  data
                      .map((voiceCall) => voiceCall.queueId)
                      .filter((id) => id !== null),
              ),
          ) as number[])
        : []

    const tableContent = (
        <div ref={ref} className={css.container} onScroll={handleScroll}>
            <TableWrapper className={css.table} style={{ width }}>
                <TableHead className={classNames(css.tableHead, css.tableRow)}>
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
    )

    return (
        <VoiceQueueProvider queueIds={queueIds}>
            {tableContent}
        </VoiceQueueProvider>
    )
}
