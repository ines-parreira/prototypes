import {Tooltip} from '@gorgias/merchant-ui-kit'
import React, {useMemo} from 'react'

import useId from 'hooks/useId'
import {BadgeWithTiers} from 'pages/automate/aiAgent/insights/IntentTableWidget/BadgeWithTiers/BadgeWithTiers'
import {
    getColumnWidth,
    IntentRowConfig,
    IntentsColumnsConfig,
} from 'pages/automate/aiAgent/insights/IntentTableWidget/IntentTableConfig'
import {
    Intent,
    IntentTableColumn,
} from 'pages/automate/aiAgent/insights/IntentTableWidget/types'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {formatMetricValue} from 'pages/stats/common/utils'

import intentTableCss from './IntentTable.less'

export const IntentNameCellContent = ({
    intent,
    column,
}: {
    intent: Intent
    column: IntentTableColumn
}) => {
    return (
        <BodyCellWrapper bodyCellProps={{width: getColumnWidth(column)}}>
            <div>{intent[column]}</div>
        </BodyCellWrapper>
    )
}

export const IntentDefaultCellContent = ({
    intent,
    column,
}: {
    intent: Intent
    column: IntentTableColumn
}) => {
    const id = useId()
    const tooltipId = `${column}-row-tooltip-${id}`

    return (
        <BodyCellWrapper
            bodyCellProps={{
                justifyContent: 'right',
                width: getColumnWidth(column),
            }}
        >
            <span id={tooltipId}>
                {formatMetricValue(
                    Number(intent[column]),
                    IntentsColumnsConfig[column]?.format
                )}
            </span>
            {IntentRowConfig[column]?.hint && (
                <Tooltip
                    target={tooltipId}
                    innerProps={{
                        style: {
                            textAlign: 'left',
                        },
                    }}
                >
                    Industry average for this intent: 14%
                </Tooltip>
            )}
        </BodyCellWrapper>
    )
}

export const IntentResourcesCellContent = ({
    intent,
    column,
}: {
    intent: Intent
    column: IntentTableColumn
}) => {
    return (
        <BodyCellWrapper
            bodyCellProps={{
                justifyContent: 'right',
                width: getColumnWidth(column),
            }}
        >
            {Number(intent[column]) > 0 ? (
                intent[column]
            ) : (
                <span className={intentTableCss.missing}>Missing</span>
            )}
        </BodyCellWrapper>
    )
}

export const IntentAutomationOpportunitiesCellContent = ({
    intent,
    column,
    allIntents,
}: {
    intent: Intent
    column: IntentTableColumn
    allIntents: Intent[]
}) => {
    const formattedMetricValue = formatMetricValue(
        Number(intent[column]),
        IntentsColumnsConfig[column]?.format
    )

    const values = useMemo(
        () => allIntents.map((intent) => Number(intent[column])),
        [allIntents, column]
    )

    return (
        <BodyCellWrapper
            bodyCellProps={{
                justifyContent: 'right',
                width: getColumnWidth(column),
            }}
        >
            <BadgeWithTiers
                value={Number(intent[column])}
                values={values}
                formattedValue={formattedMetricValue}
            />
        </BodyCellWrapper>
    )
}

export const LoadingIntentCellContent = ({
    column,
}: {
    column: IntentTableColumn
}) => {
    return (
        <BodyCellWrapper
            bodyCellProps={{
                justifyContent: 'right',
                width: getColumnWidth(column),
            }}
            isLoading={true}
        ></BodyCellWrapper>
    )
}

export const BodyCellWrapper = ({
    children,
    isLoading,
    bodyCellProps,
}: {
    children?: React.ReactNode
    isLoading?: boolean
    bodyCellProps: {width: number; justifyContent?: 'right'}
}) => {
    return (
        <BodyCell justifyContent={bodyCellProps.justifyContent}>
            {isLoading ? (
                <Skeleton
                    width={bodyCellProps.width - 36}
                    count={1}
                    className={intentTableCss.skeletonWrapper}
                />
            ) : (
                children
            )}
        </BodyCell>
    )
}
