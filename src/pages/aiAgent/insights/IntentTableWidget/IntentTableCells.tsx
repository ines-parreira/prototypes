import React, { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { useHistory, useParams } from 'react-router-dom'

import { Skeleton, Tooltip } from '@gorgias/merchant-ui-kit'

import { SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import useId from 'hooks/useId'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { BadgeWithTiers } from 'pages/aiAgent/insights/IntentTableWidget/BadgeWithTiers/BadgeWithTiers'
import {
    getColumnWidth,
    IntentRowConfig,
    IntentsColumnsConfig,
} from 'pages/aiAgent/insights/IntentTableWidget/IntentTableConfig'
import {
    Intent,
    IntentTableColumn,
} from 'pages/aiAgent/insights/IntentTableWidget/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import { HintTooltip } from 'pages/stats/common/HintTooltip'
import { DEFAULT_LOCALE, formatMetricValue } from 'pages/stats/common/utils'
import { DrillDownMetric } from 'state/ui/stats/drillDownSlice'

import { INTENT_LEVEL } from '../OptimizeContainer/OptimizeContainer'

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
    const goToIntent = () => {
        if (hasL2DrilldownEnabled && isL1Drilldown) {
            history.push(routes.optimizeIntent(String(intent.id)))
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

export const IntentAutomationOpportunitiesCellContent = ({
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
    bodyCellProps: {
        width: number
        justifyContent?: 'right'
        isClickable?: boolean
    }
}) => {
    return (
        <BodyCell
            justifyContent={bodyCellProps.justifyContent}
            innerClassName={
                bodyCellProps.isClickable
                    ? intentTableCss.clickableCell
                    : intentTableCss.notClickableCell
            }
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
