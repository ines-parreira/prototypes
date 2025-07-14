import { ComponentProps } from 'react'

import { VoiceCallDimension } from 'domains/reporting/models/cubes/VoiceCallCube'
import { VoiceCallTableColumnName } from 'domains/reporting/pages/voice/components/VoiceCallTable/constants'
import {
    VoiceAgentsMetric,
    VoiceMetric,
} from 'domains/reporting/state/ui/stats/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'

export const getVoiceDrillDownColumns = (
    metricName?: string,
): VoiceCallTableColumnName[] => {
    switch (metricName) {
        case VoiceMetric.AverageWaitTime:
        case VoiceMetric.QueueAverageWaitTime:
            return [
                VoiceCallTableColumnName.Activity,
                VoiceCallTableColumnName.WaitTime,
                VoiceCallTableColumnName.Integration,
                VoiceCallTableColumnName.Date,
                VoiceCallTableColumnName.State,
                VoiceCallTableColumnName.Recording,
            ]
        case VoiceMetric.AverageTalkTime:
        case VoiceMetric.QueueAverageTalkTime:
            return [
                VoiceCallTableColumnName.Activity,
                VoiceCallTableColumnName.TalkTime,
                VoiceCallTableColumnName.Integration,
                VoiceCallTableColumnName.Date,
                VoiceCallTableColumnName.State,
                VoiceCallTableColumnName.Recording,
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
            return [
                VoiceCallTableColumnName.Activity,
                VoiceCallTableColumnName.Duration,
                VoiceCallTableColumnName.Integration,
                VoiceCallTableColumnName.Date,
                VoiceCallTableColumnName.State,
                VoiceCallTableColumnName.Recording,
            ]
        case VoiceAgentsMetric.AgentAverageTalkTime:
            return [
                VoiceCallTableColumnName.Activity,
                VoiceCallTableColumnName.TalkTime,
                VoiceCallTableColumnName.Integration,
                VoiceCallTableColumnName.Date,
                VoiceCallTableColumnName.State,
                VoiceCallTableColumnName.Recording,
            ]
        default:
            return [
                VoiceCallTableColumnName.Activity,
                VoiceCallTableColumnName.Integration,
                VoiceCallTableColumnName.Queue,
                VoiceCallTableColumnName.Date,
                VoiceCallTableColumnName.State,
                VoiceCallTableColumnName.Recording,
                VoiceCallTableColumnName.Duration,
                VoiceCallTableColumnName.WaitTime,
                VoiceCallTableColumnName.Ticket,
            ]
    }
}

export type Cell<T extends typeof BodyCell | typeof HeaderCellProperty> = {
    key: VoiceCallTableColumnName
    props: ComponentProps<T>
}

export const filterAndOrderCells = <
    T extends typeof BodyCell | typeof HeaderCellProperty,
>(
    allColumns: Record<VoiceCallTableColumnName, Pick<Cell<T>, 'props'>>,
    requiredColumns: VoiceCallTableColumnName[] = getVoiceDrillDownColumns(),
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
    columnName: VoiceCallTableColumnName,
): VoiceCallDimension | undefined => {
    switch (columnName) {
        case VoiceCallTableColumnName.Integration:
            return VoiceCallDimension.IntegrationId
        case VoiceCallTableColumnName.Date:
            return VoiceCallDimension.CreatedAt
        case VoiceCallTableColumnName.State:
            return VoiceCallDimension.DisplayStatus
        case VoiceCallTableColumnName.Duration:
            return VoiceCallDimension.Duration
        case VoiceCallTableColumnName.OngoingTime:
            return VoiceCallDimension.Duration
        case VoiceCallTableColumnName.WaitTime:
            return VoiceCallDimension.WaitTime
        case VoiceCallTableColumnName.TalkTime:
            return VoiceCallDimension.TalkTime
        case VoiceCallTableColumnName.Ticket:
            return VoiceCallDimension.TicketId
        default:
            return undefined
    }
}

export const isVoiceCallTableColumnSortable = (
    columnName: VoiceCallTableColumnName,
): boolean => {
    switch (columnName) {
        case VoiceCallTableColumnName.Activity:
        case VoiceCallTableColumnName.Integration:
        case VoiceCallTableColumnName.Ticket:
        case VoiceCallTableColumnName.Recording:
        case VoiceCallTableColumnName.Queue:
            return false
        default:
            return true
    }
}
