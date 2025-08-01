import React, { useMemo } from 'react'

import classnames from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { useHistory, useParams } from 'react-router-dom'

import { Skeleton, Tooltip } from '@gorgias/merchant-ui-kit'

import { SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { INTENT_LEVEL } from 'domains/reporting/hooks/automate/utils'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import { HintTooltip } from 'domains/reporting/pages/common/HintTooltip'
import {
    DEFAULT_LOCALE,
    formatMetricValue,
} from 'domains/reporting/pages/common/utils'
import { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import useId from 'hooks/useId'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { BadgeWithTiers } from 'pages/aiAgent/insights/IntentTableWidget/BadgeWithTiers/BadgeWithTiers'
import {
    getChildrenSkeletonColumnWidth,
    getColumnWidth,
    IntentRowConfig,
    IntentsColumnsConfig,
} from 'pages/aiAgent/insights/IntentTableWidget/IntentTableConfig'
import {
    Intent,
    IntentTableColumn,
} from 'pages/aiAgent/insights/IntentTableWidget/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

import intentTableCss from './IntentTable.less'

type TableCellProps = {
    intent: Intent
    column: IntentTableColumn
    drillDownMetricData?: DrillDownMetric | null | undefined
    allIntents?: Intent[]
    intentLevel?: number
}

export const IntentNameCellContent = ({
    intent,
    column,
    intentLevel,
}: TableCellProps) => {
    const history = useHistory()
    const { shopName } = useParams<{
        shopName: string
    }>()
    const { routes } = useAiAgentNavigation({ shopName })
    const isL1Drilldown = intentLevel === INTENT_LEVEL
    const hasL2DrilldownEnabled =
        useFlags()[FeatureFlagKey.AiAgentOptimizeTabL2Drilldown]
    const isActionDrivenAiAgentNavigationEnabled =
        useFlags()[FeatureFlagKey.ActionDrivenAiAgentNavigation]
    const goToIntent = () => {
        if (hasL2DrilldownEnabled && isL1Drilldown) {
            history.push(
                isActionDrivenAiAgentNavigationEnabled
                    ? routes.intentsWithId(String(intent.id))
                    : routes.optimizeIntent(String(intent.id)),
            )
        }
    }

    const showHint = !isL1Drilldown && intent.id.endsWith('Other')

    return (
        <BodyCellWrapper
            bodyCellProps={{
                width: getColumnWidth(column),
                isClickable: hasL2DrilldownEnabled && isL1Drilldown,
            }}
        >
            <div className={intentTableCss.intentNameCell} onClick={goToIntent}>
                {intent[column]}
                {showHint && (
                    <HintTooltip
                        title={
                            "Many tickets may initially be classified as 'Other'. Over time, they’ll be grouped into more specific topics as AI Agent learns from past tickets."
                        }
                    />
                )}
            </div>
        </BodyCellWrapper>
    )
}

export const IntentAvgCsatCellContent = ({
    intent,
    column,
    drillDownMetricData,
}: TableCellProps) => {
    const formatedValue = intent[column]
        ? Intl.NumberFormat(DEFAULT_LOCALE, {
              maximumFractionDigits: 1,
          }).format(intent[column] as number)
        : '-'
    return (
        <BodyCellWrapper
            bodyCellProps={{
                justifyContent: 'right',
                width: getColumnWidth(column),
            }}
        >
            <DrillDownModalWrapper
                drillDownMetricData={drillDownMetricData}
                metricValue={intent[column] as number}
            >
                {formatedValue}
            </DrillDownModalWrapper>
        </BodyCellWrapper>
    )
}

export const IntentDefaultCellContent = ({
    intent,
    column,
    drillDownMetricData,
}: TableCellProps) => {
    const id = useId()
    const tooltipId = `${column}-row-tooltip-${id}`
    return (
        <BodyCellWrapper
            bodyCellProps={{
                justifyContent: 'right',
                width: getColumnWidth(column),
            }}
        >
            <DrillDownModalWrapper
                drillDownMetricData={drillDownMetricData}
                metricValue={intent[column] as number}
            >
                <span id={tooltipId}>
                    {formatMetricValue(
                        intent[column] as number,
                        IntentsColumnsConfig[column]?.format,
                        IntentsColumnsConfig[column]?.notAvailableText,
                    )}
                </span>{' '}
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
            </DrillDownModalWrapper>
        </BodyCellWrapper>
    )
}

export const IntentResourcesCellContent = ({
    intent,
    column,
}: TableCellProps) => {
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

export const IntentSuccessRateUpliftOpportunitiesCellContent = ({
    intent,
    column,
    allIntents,
}: TableCellProps) => {
    const value = intent[column] as number

    const formattedMetricValue = formatMetricValue(
        value,
        IntentsColumnsConfig[column]?.format,
        IntentsColumnsConfig[column]?.notAvailableText,
    )

    const values = useMemo(
        () => allIntents?.map((intent) => intent[column] || 0),
        [allIntents, column],
    ) as number[]

    return (
        <BodyCellWrapper
            bodyCellProps={{
                justifyContent: 'right',
                width: getColumnWidth(column),
            }}
        >
            <BadgeWithTiers
                value={value}
                values={values}
                formattedValue={formattedMetricValue}
                hasValue={!!value}
            />
        </BodyCellWrapper>
    )
}

export const LoadingIntentCellContent = ({
    column,
    intentLevel = INTENT_LEVEL,
}: {
    column: IntentTableColumn
    intentLevel?: number
}) => {
    return (
        <BodyCellWrapper
            bodyCellProps={{
                justifyContent:
                    column === IntentTableColumn.IntentName ? 'left' : 'right',
                width:
                    intentLevel === INTENT_LEVEL
                        ? getColumnWidth(column)
                        : getChildrenSkeletonColumnWidth(column),
                colSpan: column === IntentTableColumn.IntentName ? 2 : 1,
                hasMarginLeft: column === IntentTableColumn.IntentName,
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
    bodyCellProps: {
        width: number
        justifyContent?: 'right' | 'left'
        isClickable?: boolean
        colSpan?: number
        hasMarginLeft?: boolean
    }
}) => {
    return (
        <BodyCell
            colSpan={bodyCellProps.colSpan}
            justifyContent={bodyCellProps.justifyContent}
            innerClassName={classnames(
                bodyCellProps.isClickable
                    ? intentTableCss.clickableCell
                    : intentTableCss.notClickableCell,
                bodyCellProps.hasMarginLeft ? intentTableCss.loadingRow : '',
            )}
        >
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

const DrillDownModalWrapper = ({
    metricValue,
    drillDownMetricData,
    children,
}: {
    metricValue: number | null
    drillDownMetricData: DrillDownMetric | null | undefined
    children: React.ReactNode
}) => {
    return (
        <>
            {drillDownMetricData ? (
                <DrillDownModalTrigger
                    enabled={!!metricValue}
                    highlighted
                    metricData={drillDownMetricData}
                    segmentEventName={
                        SegmentEvent.AiAgentTicketDrilldownClicked
                    }
                >
                    {children}
                </DrillDownModalTrigger>
            ) : (
                children
            )}
        </>
    )
}
