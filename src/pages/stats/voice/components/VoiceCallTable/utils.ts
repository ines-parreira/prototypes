import {ComponentProps} from 'react'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {VoiceAgentsMetric, VoiceMetric} from 'state/ui/stats/types'
import {VoiceCallTableColumnName} from './constants'

export const getVoiceDrillDownColumns = (
    metricName?: string
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
        case VoiceMetric.QueueMissedInboundCalls:
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
    requiredColumns: VoiceCallTableColumnName[] = getVoiceDrillDownColumns()
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
