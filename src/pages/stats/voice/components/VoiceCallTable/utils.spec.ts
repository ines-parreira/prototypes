import {VoiceAgentsMetric, VoiceMetric} from 'state/ui/stats/types'
import {VoiceCallTableColumnName} from './constants'
import {filterAndOrderCells, getVoiceDrillDownColumns} from './utils'

describe('utils', () => {
    describe('filterAndOrderCells', () => {
        it('should return an array of cells with the correct order', () => {
            const allColumns = {
                column1: {props: {someProp: 'someValue'}},
                column2: {props: {someProp: 'someValue'}},
                column3: {props: {someProp: 'someValue'}},
            }
            const requiredColumns = ['column2', 'column1']

            const result = filterAndOrderCells(
                allColumns as any,
                requiredColumns as VoiceCallTableColumnName[]
            )

            expect(result).toEqual([
                {key: 'column2', props: {someProp: 'someValue'}},
                {key: 'column1', props: {someProp: 'someValue'}},
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
                VoiceAgentsMetric.AgentAverageTalkTime
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
                VoiceCallTableColumnName.Date,
                VoiceCallTableColumnName.State,
                VoiceCallTableColumnName.Recording,
                VoiceCallTableColumnName.Duration,
                VoiceCallTableColumnName.WaitTime,
                VoiceCallTableColumnName.Ticket,
            ])
        })
    })
})
