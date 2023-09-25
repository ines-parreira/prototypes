import React from 'react'

import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import ChartCard from 'pages/stats/ChartCard'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import GaugeCellAddon from 'pages/common/components/table/addons/GaugeCellAddon'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    NOT_AVAILABLE_PLACEHOLDER,
    formatMetricValue,
} from 'pages/stats/common/utils'
import colors from 'assets/tokens/colors.json'

import {DistributionCategoryCell} from './DistributionCategoryCell'
import {NoDataAvailable} from './NoDataAvailable'
import {useTicketsDistribution} from './useTicketsDistribution'

import css from './TicketDistributionTable.less'

export const OUTSIDE_TOP_DATA = {
    title: 'Outside of Top used',
    color: colors['📺 Classic'].Accessory.Purple_bg.value,
}

export const TicketDistributionTable = () => {
    const {
        isFetching,
        topData,
        ticketsCountTotal,
        outsideTopTotal,
        outsideTopTotalPercentage,
    } = useTicketsDistribution()

    return (
        <ChartCard title="Top used values" className={css.card}>
            {isFetching ? (
                <TableWrapper className={css.table}>
                    <TableBody>
                        {new Array(10).fill(null).map((_, rowIndex) => (
                            <TableBodyRow key={rowIndex}>
                                <BodyCell>
                                    <Skeleton width={250} />
                                </BodyCell>
                                <BodyCell justifyContent="right">
                                    <Skeleton width={50} />
                                </BodyCell>
                                <BodyCell justifyContent="right">
                                    <Skeleton width={50} />
                                </BodyCell>
                            </TableBodyRow>
                        ))}
                    </TableBody>
                </TableWrapper>
            ) : topData.length > 0 ? (
                <TableWrapper className={css.table}>
                    <TableBody>
                        {topData.map((item, index) => {
                            const valueInPercentage =
                                (100 *
                                    Number(
                                        item[
                                            TicketCustomFieldsMeasure
                                                .TicketCustomFieldsTicketCount
                                        ]
                                    )) /
                                ticketsCountTotal

                            const category =
                                item[
                                    TicketCustomFieldsDimension
                                        .TicketCustomFieldsValueString
                                ] || NOT_AVAILABLE_PLACEHOLDER

                            return (
                                <TableBodyRow key={index}>
                                    <DistributionCategoryCell
                                        key={category}
                                        progress={valueInPercentage}
                                        width={300}
                                        category={category}
                                    />
                                    <BodyCell justifyContent="right">
                                        {formatMetricValue(
                                            Number(
                                                item[
                                                    TicketCustomFieldsMeasure
                                                        .TicketCustomFieldsTicketCount
                                                ]
                                            ),
                                            'decimal',
                                            NOT_AVAILABLE_PLACEHOLDER
                                        )}
                                    </BodyCell>
                                    <BodyCell justifyContent="right">
                                        {formatMetricValue(
                                            valueInPercentage,
                                            'percent',
                                            NOT_AVAILABLE_PLACEHOLDER
                                        )}
                                    </BodyCell>
                                </TableBodyRow>
                            )
                        })}

                        {outsideTopTotal ? (
                            <TableBodyRow>
                                <BodyCell justifyContent="left">
                                    <GaugeCellAddon
                                        progress={outsideTopTotalPercentage}
                                        color={OUTSIDE_TOP_DATA.color}
                                    />
                                    {OUTSIDE_TOP_DATA.title}
                                </BodyCell>
                                <BodyCell justifyContent="right">
                                    {formatMetricValue(
                                        outsideTopTotal,
                                        'decimal',
                                        NOT_AVAILABLE_PLACEHOLDER
                                    )}
                                </BodyCell>
                                <BodyCell justifyContent="right">
                                    {formatMetricValue(
                                        outsideTopTotalPercentage,
                                        'percent',
                                        NOT_AVAILABLE_PLACEHOLDER
                                    )}
                                </BodyCell>
                            </TableBodyRow>
                        ) : null}

                        <TableBodyRow className={css.lastRow}>
                            <BodyCell className={css.total}>Total</BodyCell>
                            <BodyCell justifyContent="right">
                                {formatMetricValue(ticketsCountTotal)}
                            </BodyCell>
                            <BodyCell justifyContent="right">100%</BodyCell>
                        </TableBodyRow>
                    </TableBody>
                </TableWrapper>
            ) : (
                <NoDataAvailable style={{minHeight: 200}} />
            )}
        </ChartCard>
    )
}
