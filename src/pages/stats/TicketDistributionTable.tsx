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
        <ChartCard
            title="Top used values"
            hint="Top 10 used values, as well as the number of tickets that were labeled with one of these values within the selected timeframe for the selected Ticket Field. All other values are grouped in the “Outside of Top used”."
            className={css.card}
        >
            {isFetching ? (
                <TableWrapper className={css.table}>
                    <TableBody>
                        {new Array(10).fill(null).map((_, rowIndex) => (
                            <TableBodyRow key={rowIndex}>
                                <BodyCell>
                                    <Skeleton inline width={260} />
                                </BodyCell>
                                <BodyCell justifyContent="right">
                                    <Skeleton inline width={65} />
                                </BodyCell>
                                <BodyCell justifyContent="right">
                                    <Skeleton inline width={40} />
                                </BodyCell>
                            </TableBodyRow>
                        ))}
                        <TableBodyRow className={css.lastRow}>
                            <BodyCell>
                                <Skeleton width={260} />
                            </BodyCell>
                            <BodyCell justifyContent="right">
                                <Skeleton width={65} />
                            </BodyCell>
                            <BodyCell justifyContent="right">
                                <Skeleton width={40} />
                            </BodyCell>
                        </TableBodyRow>
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
                                    <BodyCell
                                        justifyContent="right"
                                        width={100}
                                    >
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
                                    <BodyCell justifyContent="right" width={80}>
                                        {formatMetricValue(
                                            valueInPercentage,
                                            'percent-refined',
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
                                <BodyCell justifyContent="right" width={100}>
                                    {formatMetricValue(
                                        outsideTopTotal,
                                        'decimal',
                                        NOT_AVAILABLE_PLACEHOLDER
                                    )}
                                </BodyCell>
                                <BodyCell justifyContent="right" width={80}>
                                    {formatMetricValue(
                                        outsideTopTotalPercentage,
                                        'percent-refined',
                                        NOT_AVAILABLE_PLACEHOLDER
                                    )}
                                </BodyCell>
                            </TableBodyRow>
                        ) : null}

                        <TableBodyRow className={css.lastRow}>
                            <BodyCell className={css.total} width={300}>
                                Total
                            </BodyCell>
                            <BodyCell justifyContent="right" width={100}>
                                {formatMetricValue(ticketsCountTotal)}
                            </BodyCell>
                            <BodyCell justifyContent="right" width={80}>
                                100%
                            </BodyCell>
                        </TableBodyRow>
                    </TableBody>
                </TableWrapper>
            ) : (
                <NoDataAvailable style={{minHeight: 300}} />
            )}
        </ChartCard>
    )
}
