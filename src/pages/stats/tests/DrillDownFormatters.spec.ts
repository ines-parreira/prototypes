import {VoiceCallDimension} from 'models/reporting/cubes/VoiceCallCube'
import {formatVoiceDrillDownRowData} from '../DrillDownFormatters'

describe('DrillDownFormatters', () => {
    describe('formatVoiceDrillDownRowData', () => {
        it('should return the formatted row data', () => {
            const row = {
                [VoiceCallDimension.AgentId]: 'agentId',
                [VoiceCallDimension.CustomerId]: 'customerId',
                [VoiceCallDimension.Direction]: 'direction',
                [VoiceCallDimension.IntegrationId]: 'integrationId',
                [VoiceCallDimension.CreatedAt]: 'createdAt',
                [VoiceCallDimension.Status]: 'status',
                [VoiceCallDimension.Duration]: 'duration',
                [VoiceCallDimension.TicketId]: 'ticketId',
                [VoiceCallDimension.PhoneNumberDestination]:
                    'phoneNumberDestination',
                [VoiceCallDimension.PhoneNumberSource]: 'phoneNumberSource',
                [VoiceCallDimension.TalkTime]: 'talkTime',
                [VoiceCallDimension.WaitTime]: 'waitTime',
                [VoiceCallDimension.VoicemailAvailable]: 'voicemailAvailable',
                [VoiceCallDimension.VoicemailUrl]: 'voicemailUrl',
                [VoiceCallDimension.CallRecordingAvailable]:
                    'callRecordingAvailable',
                [VoiceCallDimension.CallRecordingUrl]: 'callRecordingUrl',
                metricField: 'metricField',
            }

            const result = formatVoiceDrillDownRowData(row, 'metricField')

            expect(result).toEqual({
                agentId: 'agentId',
                customerId: 'customerId',
                direction: 'direction',
                integrationId: 'integrationId',
                createdAt: 'createdAt',
                status: 'status',
                duration: 'duration',
                ticketId: 'ticketId',
                phoneNumberDestination: 'phoneNumberDestination',
                phoneNumberSource: 'phoneNumberSource',
                talkTime: 'talkTime',
                waitTime: 'waitTime',
                voicemailAvailable: 'voicemailAvailable',
                voicemailUrl: 'voicemailUrl',
                callRecordingAvailable: 'callRecordingAvailable',
                callRecordingUrl: 'callRecordingUrl',
                metricValue: 'metricField',
                rowData: row,
            })
        })
    })
})
