import { CSSProperties, useState } from 'react'

import { TrendIcon } from '@repo/reporting'
import classNames from 'classnames'

import { logEvent, SegmentEvent } from 'common/segment'
import { transformCategorySeparator } from 'domains/reporting/hooks/helpers'
import css from 'domains/reporting/pages/common/components/Table/BreakdownTable.less'
import { TableWithNestedRowsCell } from 'domains/reporting/pages/common/components/Table/TableWithNestedRowsCell'
import {
    DEFAULT_BADGE_TEXT,
    TREND_BADGE_FORMAT,
} from 'domains/reporting/pages/common/components/TrendBadge'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import { formatMetricTrend } from 'domains/reporting/pages/common/utils'
import { ProductRows } from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/ProductRows'
import topProductsCss from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntent.less'
import {
    TopIntentsColumns,
    TopProductsTableColumnsForIntents,
} from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentConfig'
import { TopIntentsRowProps } from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/types'
import { VoiceOfCustomerMetricWithDrillDown } from 'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerMetricConfig'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

export const IntentRows = ({
    level,
    entityId,
    value,
    prevValue,
    leadColumn,
    intentCustomFieldId,
    defaultExpanded,
}: TopIntentsRowProps) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)

    const toggleExpand = (): void => {
        setIsExpanded(!isExpanded)
        if (!isExpanded) {
            logEvent(SegmentEvent.StatVoCSidePanelIntentClick)
        }
    }

    return (
        <>
            <TableBodyRow>
                {TopProductsTableColumnsForIntents.map((column) => (
                    <IntentCell
                        key={column}
                        column={column}
                        level={level}
                        entityId={entityId}
                        value={value}
                        prevValue={prevValue}
                        isLeadColumn={leadColumn === column}
                        intentCustomFieldId={intentCustomFieldId}
                        isExpanded={isExpanded}
                        toggleExpand={toggleExpand}
                    />
                ))}
            </TableBodyRow>
            {isExpanded && (
                <ProductRows
                    entityId={entityId}
                    intentCustomFieldId={intentCustomFieldId}
                    leadColumn={TopIntentsColumns.Product}
                    level={level}
                />
            )}
        </>
    )
}

const contentCellInnerStyle: CSSProperties = {
    marginLeft: 0,
    paddingLeft: 'var(--layout-spacing-m)',
}

const IntentCell = ({
    column,
    entityId,
    value,
    prevValue,
    isLeadColumn,
    level,
    intentCustomFieldId,
    isExpanded,
    toggleExpand,
}: {
    column: TopIntentsColumns
    entityId: string
    isLeadColumn: boolean
    level: number
    intentCustomFieldId: number
    isExpanded?: boolean
    toggleExpand?: () => void
    value: number
    prevValue: number
}) => {
    const { formattedTrend, sign } = formatMetricTrend(
        value,
        prevValue,
        TREND_BADGE_FORMAT,
    )

    const formattedEntity = transformCategorySeparator(entityId)

    switch (column) {
        case TopIntentsColumns.Intent:
            return (
                <TableWithNestedRowsCell
                    isLeadColumn={isLeadColumn}
                    level={level}
                    hasChildren={false}
                    innerStyle={{
                        marginLeft: 0,
                    }}
                    className={classNames(css.leadColumn)}
                    onClick={toggleExpand}
                >
                    <i
                        className={classNames(
                            'material-icons-round',
                            topProductsCss.expandIcon,
                        )}
                    >
                        {isExpanded ? 'arrow_drop_down' : 'arrow_right'}
                    </i>
                    {formattedEntity}
                </TableWithNestedRowsCell>
            )
        case TopIntentsColumns.TicketVolume:
            return (
                <TableWithNestedRowsCell
                    isLeadColumn={isLeadColumn}
                    level={level}
                    hasChildren={false}
                    innerStyle={contentCellInnerStyle}
                >
                    <DrillDownModalTrigger
                        highlighted
                        metricData={{
                            title: `Intent Topic | ${formattedEntity}`,
                            metricName:
                                VoiceOfCustomerMetricWithDrillDown.IntentPerProducts,
                            intentCustomFieldId: intentCustomFieldId,
                            intentCustomFieldValueString: entityId,
                        }}
                    >
                        {value}
                    </DrillDownModalTrigger>
                </TableWithNestedRowsCell>
            )
        case TopIntentsColumns.Delta:
            return (
                <TableWithNestedRowsCell
                    isLeadColumn={isLeadColumn}
                    level={level}
                    hasChildren={false}
                    innerStyle={contentCellInnerStyle}
                >
                    <TrendIcon value={sign} />
                    {formattedTrend || DEFAULT_BADGE_TEXT}
                </TableWithNestedRowsCell>
            )
    }
}
