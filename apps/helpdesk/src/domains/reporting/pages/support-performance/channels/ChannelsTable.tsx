import React, { UIEventHandler, useState } from 'react'

import { useMeasure } from '@repo/hooks'
import classNames from 'classnames'

import { useSortedChannelsWithData } from 'domains/reporting/hooks/support-performance/useSortedChannelsWithData'
import { useChannelsTableSetting } from 'domains/reporting/hooks/useChannelsTableConfigSetting'
import css from 'domains/reporting/pages/common/components/Table/AnalyticsTable.less'
import { ChannelsCellContent } from 'domains/reporting/pages/support-performance/channels/ChannelsCellContent'
import { ChannelsHeaderCellContent } from 'domains/reporting/pages/support-performance/channels/ChannelsHeaderCellContent'
import {
    ChannelColumnConfig,
    getColumnWidth,
} from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

export const ChannelsTable = () => {
    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }
    const [ref, { width }] = useMeasure<HTMLDivElement>()
    const { channels, isLoading } = useSortedChannelsWithData()
    const { columnsOrder } = useChannelsTableSetting()

    return (
        <div ref={ref} className={css.container} onScroll={handleScroll}>
            <TableWrapper
                className={classNames(css.table)}
                style={{ width }}
                height={'comfortable'}
            >
                <TableHead>
                    {columnsOrder.map((column, index) => (
                        <ChannelsHeaderCellContent
                            column={column}
                            key={column}
                            width={getColumnWidth(column)}
                            className={classNames(css.BodyCell, {
                                [css.withShadow]:
                                    index === 0 && isTableScrolled,
                            })}
                        />
                    ))}
                </TableHead>
                <TableBody>
                    {channels.map((channel) => (
                        <TableBodyRow key={channel.slug}>
                            {columnsOrder.map((column, index) => (
                                <ChannelsCellContent
                                    key={`${channel.slug}-${column}`}
                                    isLoading={isLoading}
                                    channel={channel}
                                    column={column}
                                    useMetric={
                                        ChannelColumnConfig[column].useMetric
                                    }
                                    width={getColumnWidth(column)}
                                    className={classNames(css.BodyCell, {
                                        [css.withShadow]:
                                            index === 0 && isTableScrolled,
                                    })}
                                />
                            ))}
                        </TableBodyRow>
                    ))}
                </TableBody>
            </TableWrapper>
        </div>
    )
}
