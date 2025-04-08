import React, { UIEventHandler, useMemo, useState } from 'react'

import classNames from 'classnames'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useMeasure from 'hooks/useMeasure'
import { OrderDirection } from 'models/api/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import { NoDataAvailable } from 'pages/stats/NoDataAvailable'
import { CALL_LIST_PAGE_SIZE } from 'pages/stats/voice/constants/voiceOverview'
import { VoiceCallSummary } from 'pages/stats/voice/models/types'

import VoiceQueueProvider from '../VoiceQueue/VoiceQueueProvider'
import { skeletonColumnsWidth, VoiceCallTableColumnName } from './constants'
import { Cell } from './utils'
import {
    getOrderedCells,
    getOrderedHeaderCells,
} from './voiceCallTableContentCells'

import css from './VoiceCallTable.less'

type VoiceCallTableContentProps = {
    data?: VoiceCallSummary[]
    isFetching: boolean
    columns: VoiceCallTableColumnName[]
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
    const shouldExposeVoiceQueues = useFlag(FeatureFlagKey.ExposeVoiceQueues)

    columns = shouldExposeVoiceQueues
        ? columns
        : columns.filter((col) => col !== VoiceCallTableColumnName.Queue)

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

    if (!shouldExposeVoiceQueues) {
        return tableContent
    }
    return (
        <VoiceQueueProvider queueIds={queueIds}>
            {tableContent}
        </VoiceQueueProvider>
    )
}
