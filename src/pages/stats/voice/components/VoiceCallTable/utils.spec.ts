import { VoiceCallDimension } from 'models/reporting/cubes/VoiceCallCube'
import { VoiceAgentsMetric, VoiceMetric } from 'state/ui/stats/types'

import { VoiceCallTableColumnName } from './constants'
import {
    filterAndOrderCells,
    getVoiceDrillDownColumns,
    isVoiceCallTableColumnSortable,
    voiceCallTableColumnNameToDimension,
} from './utils'

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
                requiredColumns as VoiceCallTableColumnName[],
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
                VoiceCallTableColumnName.Activity,
                VoiceCallTableColumnName.WaitTime,
                VoiceCallTableColumnName.Integration,
                VoiceCallTableColumnName.Date,
                VoiceCallTableColumnName.State,
                VoiceCallTableColumnName.Recording,
            ])
        })

        it.each([
            VoiceMetric.AverageTalkTime,
            VoiceMetric.QueueAverageTalkTime,
        ])('should return the correct columns for %s', (metric) => {
            const result = getVoiceDrillDownColumns(metric)

            expect(result).toEqual([
                VoiceCallTableColumnName.Activity,
                VoiceCallTableColumnName.TalkTime,
                VoiceCallTableColumnName.Integration,
                VoiceCallTableColumnName.Date,
                VoiceCallTableColumnName.State,
                VoiceCallTableColumnName.Recording,
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
                VoiceCallTableColumnName.Activity,
                VoiceCallTableColumnName.Duration,
                VoiceCallTableColumnName.Integration,
                VoiceCallTableColumnName.Date,
                VoiceCallTableColumnName.State,
                VoiceCallTableColumnName.Recording,
            ])
        })

        it('should return the correct columns for AgentAverageTalkTime', () => {
            const result = getVoiceDrillDownColumns(
                VoiceAgentsMetric.AgentAverageTalkTime,
            )

            expect(result).toEqual([
                VoiceCallTableColumnName.Activity,
                VoiceCallTableColumnName.TalkTime,
                VoiceCallTableColumnName.Integration,
                VoiceCallTableColumnName.Date,
                VoiceCallTableColumnName.State,
                VoiceCallTableColumnName.Recording,
            ])
        })

        it('should return the default columns', () => {
            const result = getVoiceDrillDownColumns()

            expect(result).toEqual([
                VoiceCallTableColumnName.Activity,
                VoiceCallTableColumnName.Integration,
                VoiceCallTableColumnName.Queue,
                VoiceCallTableColumnName.Date,
                VoiceCallTableColumnName.State,
                VoiceCallTableColumnName.Recording,
                VoiceCallTableColumnName.Duration,
                VoiceCallTableColumnName.WaitTime,
                VoiceCallTableColumnName.Ticket,
            ])
        })
    })

    describe('voiceCallTableColumnNameToDimension', () => {
        it.each([
            [VoiceCallTableColumnName.Activity, undefined],
            [
                VoiceCallTableColumnName.Integration,
                VoiceCallDimension.IntegrationId,
            ],
            [VoiceCallTableColumnName.Date, VoiceCallDimension.CreatedAt],
            [VoiceCallTableColumnName.State, VoiceCallDimension.DisplayStatus],
            [VoiceCallTableColumnName.Duration, VoiceCallDimension.Duration],
            [VoiceCallTableColumnName.WaitTime, VoiceCallDimension.WaitTime],
            [VoiceCallTableColumnName.Ticket, VoiceCallDimension.TicketId],
            [VoiceCallTableColumnName.TalkTime, VoiceCallDimension.TalkTime],
            [VoiceCallTableColumnName.OngoingTime, VoiceCallDimension.Duration],
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
            VoiceCallTableColumnName.Activity,
            VoiceCallTableColumnName.Integration,
            VoiceCallTableColumnName.Recording,
            VoiceCallTableColumnName.Ticket,
        ])('should return false for %s', (columnName) => {
            const result = isVoiceCallTableColumnSortable(columnName)

            expect(result).toBe(false)
        })

        it.each([
            VoiceCallTableColumnName.Date,
            VoiceCallTableColumnName.Duration,
            VoiceCallTableColumnName.WaitTime,
            VoiceCallTableColumnName.TalkTime,
            VoiceCallTableColumnName.OngoingTime,
            VoiceCallTableColumnName.State,
        ])('should return true for %s', (columnName) => {
            const result = isVoiceCallTableColumnSortable(columnName)

            expect(result).toBe(true)
        })
    })
})
