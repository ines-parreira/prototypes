import { VoiceCallDimension } from 'domains/reporting/models/cubes/VoiceCallCube'
import { VoiceCallTableColumn } from 'domains/reporting/pages/voice/components/VoiceCallTable/constants'
import {
    filterAndOrderCells,
    getVoiceDrillDownColumns,
    isVoiceCallTableColumnSortable,
    voiceCallTableColumnNameToDimension,
} from 'domains/reporting/pages/voice/components/VoiceCallTable/utils'
import {
    VoiceAgentsMetric,
    VoiceMetric,
} from 'domains/reporting/state/ui/stats/types'

describe('utils', () => {
    describe('filterAndOrderCells', () => {
        it('should return an array of cells with the correct order', () => {
            const allColumns = {
                column1: { props: { someProp: 'someValue' } },
                column2: { props: { someProp: 'someValue' } },
                column3: { props: { someProp: 'someValue' } },
            }
            const requiredColumns = ['column2', 'column1']

            const result = filterAndOrderCells(
                allColumns as any,
                requiredColumns as VoiceCallTableColumn[],
            )

            expect(result).toEqual([
                { key: 'column2', props: { someProp: 'someValue' } },
                { key: 'column1', props: { someProp: 'someValue' } },
            ])
        })
    })

    describe('getVoiceDrillDownColumns', () => {
        it.each([
            VoiceMetric.AverageWaitTime,
            VoiceMetric.QueueAverageWaitTime,
        ])('should return the correct columns for %s', (metric) => {
            const result = getVoiceDrillDownColumns(metric)

            expect(result).toEqual([
                VoiceCallTableColumn.Activity,
                VoiceCallTableColumn.WaitTime,
                VoiceCallTableColumn.Integration,
                VoiceCallTableColumn.Date,
                VoiceCallTableColumn.State,
                VoiceCallTableColumn.Recording,
            ])
        })

        it.each([
            VoiceMetric.AverageTalkTime,
            VoiceMetric.QueueAverageTalkTime,
        ])('should return the correct columns for %s', (metric) => {
            const result = getVoiceDrillDownColumns(metric)

            expect(result).toEqual([
                VoiceCallTableColumn.Activity,
                VoiceCallTableColumn.TalkTime,
                VoiceCallTableColumn.Integration,
                VoiceCallTableColumn.Date,
                VoiceCallTableColumn.State,
                VoiceCallTableColumn.Recording,
            ])
        })

        it.each([
            VoiceAgentsMetric.AgentTotalCalls,
            VoiceAgentsMetric.AgentInboundAnsweredCalls,
            VoiceAgentsMetric.AgentInboundMissedCalls,
            VoiceAgentsMetric.AgentOutboundCalls,
            VoiceMetric.QueueInboundCalls,
            VoiceMetric.QueueInboundUnansweredCalls,
            VoiceMetric.QueueInboundMissedCalls,
            VoiceMetric.QueueInboundAbandonedCalls,
            VoiceMetric.QueueOutboundCalls,
        ])('should return the correct columns for %s', (metric) => {
            const result = getVoiceDrillDownColumns(metric)

            expect(result).toEqual([
                VoiceCallTableColumn.Activity,
                VoiceCallTableColumn.Duration,
                VoiceCallTableColumn.Integration,
                VoiceCallTableColumn.Date,
                VoiceCallTableColumn.State,
                VoiceCallTableColumn.Recording,
            ])
        })

        it('should return the correct columns for AgentInboundTransferredCalls', () => {
            const result = getVoiceDrillDownColumns(
                VoiceAgentsMetric.AgentInboundTransferredCalls,
            )

            expect(result).toEqual([
                VoiceCallTableColumn.TransferActivity,
                VoiceCallTableColumn.Duration,
                VoiceCallTableColumn.Integration,
                VoiceCallTableColumn.Date,
                VoiceCallTableColumn.State,
                VoiceCallTableColumn.Recording,
            ])
        })

        it('should return the correct columns for AgentAverageTalkTime', () => {
            const result = getVoiceDrillDownColumns(
                VoiceAgentsMetric.AgentAverageTalkTime,
            )

            expect(result).toEqual([
                VoiceCallTableColumn.Activity,
                VoiceCallTableColumn.TalkTime,
                VoiceCallTableColumn.Integration,
                VoiceCallTableColumn.Date,
                VoiceCallTableColumn.State,
                VoiceCallTableColumn.Recording,
            ])
        })

        it('should return the default columns', () => {
            const result = getVoiceDrillDownColumns()

            expect(result).toEqual([
                VoiceCallTableColumn.Activity,
                VoiceCallTableColumn.Integration,
                VoiceCallTableColumn.Queue,
                VoiceCallTableColumn.Date,
                VoiceCallTableColumn.State,
                VoiceCallTableColumn.Recording,
                VoiceCallTableColumn.Duration,
                VoiceCallTableColumn.WaitTime,
                VoiceCallTableColumn.Ticket,
            ])
        })
    })

    describe('voiceCallTableColumnNameToDimension', () => {
        it.each([
            [VoiceCallTableColumn.Activity, undefined],
            [
                VoiceCallTableColumn.Integration,
                VoiceCallDimension.IntegrationId,
            ],
            [VoiceCallTableColumn.Date, VoiceCallDimension.CreatedAt],
            [VoiceCallTableColumn.State, VoiceCallDimension.DisplayStatus],
            [VoiceCallTableColumn.Duration, VoiceCallDimension.Duration],
            [VoiceCallTableColumn.WaitTime, VoiceCallDimension.WaitTime],
            [VoiceCallTableColumn.Ticket, VoiceCallDimension.TicketId],
            [VoiceCallTableColumn.TalkTime, VoiceCallDimension.TalkTime],
            [VoiceCallTableColumn.OngoingTime, VoiceCallDimension.Duration],
        ])(
            'should return the correct dimension for %s',
            (columnName, dimension) => {
                const result = voiceCallTableColumnNameToDimension(columnName)

                expect(result).toBe(dimension)
            },
        )
    })

    describe('isVoiceCallTableColumnSortable', () => {
        it.each([
            VoiceCallTableColumn.Activity,
            VoiceCallTableColumn.Integration,
            VoiceCallTableColumn.Recording,
            VoiceCallTableColumn.Ticket,
        ])('should return false for %s', (columnName) => {
            const result = isVoiceCallTableColumnSortable(columnName)

            expect(result).toBe(false)
        })

        it.each([
            VoiceCallTableColumn.Date,
            VoiceCallTableColumn.Duration,
            VoiceCallTableColumn.WaitTime,
            VoiceCallTableColumn.TalkTime,
            VoiceCallTableColumn.OngoingTime,
            VoiceCallTableColumn.State,
        ])('should return true for %s', (columnName) => {
            const result = isVoiceCallTableColumnSortable(columnName)

            expect(result).toBe(true)
        })
    })
})
