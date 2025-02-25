import React, { UIEventHandler, useState } from 'react'

import classNames from 'classnames'

import { useSortedChannelsWithData } from 'hooks/reporting/support-performance/useSortedChannelsWithData'
import { useChannelsTableSetting } from 'hooks/reporting/useChannelsTableConfigSetting'
import useMeasure from 'hooks/useMeasure'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import css from 'pages/stats/AnalyticsTable.less'
import { ChannelsCellContent } from 'pages/stats/support-performance/channels/ChannelsCellContent'
import { ChannelsHeaderCellContent } from 'pages/stats/support-performance/channels/ChannelsHeaderCellContent'
import {
    ChannelColumnConfig,
    getColumnWidth,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'

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
