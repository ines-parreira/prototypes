import type { ComponentProps } from 'react'

import { VoiceCallDimension } from 'domains/reporting/models/cubes/VoiceCallCube'
import { VoiceCallTableColumn } from 'domains/reporting/pages/voice/components/VoiceCallTable/constants'
import {
    VoiceAgentsMetric,
    VoiceMetric,
} from 'domains/reporting/state/ui/stats/types'
import type BodyCell from 'pages/common/components/table/cells/BodyCell'
import type HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'

export const getVoiceDrillDownColumns = (
    metricName?: string,
): VoiceCallTableColumn[] => {
    switch (metricName) {
        case VoiceMetric.AverageWaitTime:
        case VoiceMetric.QueueAverageWaitTime:
            return [
                VoiceCallTableColumn.Activity,
                VoiceCallTableColumn.WaitTime,
                VoiceCallTableColumn.Integration,
                VoiceCallTableColumn.Date,
                VoiceCallTableColumn.State,
                VoiceCallTableColumn.Recording,
            ]
        case VoiceMetric.AverageTalkTime:
        case VoiceMetric.QueueAverageTalkTime:
            return [
                VoiceCallTableColumn.Activity,
                VoiceCallTableColumn.TalkTime,
                VoiceCallTableColumn.Integration,
                VoiceCallTableColumn.Date,
                VoiceCallTableColumn.State,
                VoiceCallTableColumn.Recording,
            ]
        case VoiceMetric.QueueInboundCalls:
        case VoiceMetric.QueueInboundUnansweredCalls:
        case VoiceMetric.QueueInboundMissedCalls:
        case VoiceMetric.QueueInboundAbandonedCalls:
        case VoiceMetric.QueueOutboundCalls:
        case VoiceAgentsMetric.AgentTotalCalls:
        case VoiceAgentsMetric.AgentInboundAnsweredCalls:
        case VoiceAgentsMetric.AgentInboundMissedCalls:
        case VoiceAgentsMetric.AgentOutboundCalls:
        case VoiceAgentsMetric.AgentInboundDeclinedCalls:
            return [
                VoiceCallTableColumn.Activity,
                VoiceCallTableColumn.Duration,
                VoiceCallTableColumn.Integration,
                VoiceCallTableColumn.Date,
                VoiceCallTableColumn.State,
                VoiceCallTableColumn.Recording,
            ]
        case VoiceAgentsMetric.AgentInboundTransferredCalls:
            return [
                VoiceCallTableColumn.TransferActivity,
                VoiceCallTableColumn.Duration,
                VoiceCallTableColumn.Integration,
                VoiceCallTableColumn.Date,
                VoiceCallTableColumn.State,
                VoiceCallTableColumn.Recording,
            ]
        case VoiceAgentsMetric.AgentAverageTalkTime:
            return [
                VoiceCallTableColumn.Activity,
                VoiceCallTableColumn.TalkTime,
                VoiceCallTableColumn.Integration,
                VoiceCallTableColumn.Date,
                VoiceCallTableColumn.State,
                VoiceCallTableColumn.Recording,
            ]
        default:
            return [
                VoiceCallTableColumn.Activity,
                VoiceCallTableColumn.Integration,
                VoiceCallTableColumn.Queue,
                VoiceCallTableColumn.Date,
                VoiceCallTableColumn.State,
                VoiceCallTableColumn.Recording,
                VoiceCallTableColumn.Duration,
                VoiceCallTableColumn.WaitTime,
                VoiceCallTableColumn.Ticket,
            ]
    }
}

export type Cell<T extends typeof BodyCell | typeof HeaderCellProperty> = {
    key: VoiceCallTableColumn
    props: ComponentProps<T>
}

export const filterAndOrderCells = <
    T extends typeof BodyCell | typeof HeaderCellProperty,
>(
    allColumns: Record<VoiceCallTableColumn, Pick<Cell<T>, 'props'>>,
    requiredColumns: VoiceCallTableColumn[] = getVoiceDrillDownColumns(),
): Cell<T>[] => {
    const result = requiredColumns.map((columnName) => {
        const cellProps = allColumns[columnName]
        const cell = {
            ...cellProps,
            key: columnName,
        }

        return cell
    })

    return result
}

export const voiceCallTableColumnNameToDimension = (
    columnName: VoiceCallTableColumn,
): VoiceCallDimension | undefined => {
    switch (columnName) {
        case VoiceCallTableColumn.Integration:
            return VoiceCallDimension.IntegrationId
        case VoiceCallTableColumn.Date:
            return VoiceCallDimension.CreatedAt
        case VoiceCallTableColumn.State:
            return VoiceCallDimension.DisplayStatus
        case VoiceCallTableColumn.Duration:
            return VoiceCallDimension.Duration
        case VoiceCallTableColumn.OngoingTime:
            return VoiceCallDimension.Duration
        case VoiceCallTableColumn.WaitTime:
            return VoiceCallDimension.WaitTime
        case VoiceCallTableColumn.TalkTime:
            return VoiceCallDimension.TalkTime
        case VoiceCallTableColumn.Ticket:
            return VoiceCallDimension.TicketId
        default:
            return undefined
    }
}

export const isVoiceCallTableColumnSortable = (
    columnName: VoiceCallTableColumn,
): boolean => {
    switch (columnName) {
        case VoiceCallTableColumn.Activity:
        case VoiceCallTableColumn.Integration:
        case VoiceCallTableColumn.Ticket:
        case VoiceCallTableColumn.Recording:
        case VoiceCallTableColumn.Queue:
            return false
        default:
            return true
    }
}
