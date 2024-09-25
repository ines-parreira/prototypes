import {agents} from 'fixtures/agents'
import {
    TicketQAScoreDimensionName,
    TicketQAScoreMeasure,
} from 'models/reporting/cubes/auto-qa/TicketQAScoreCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {VoiceCallDimension} from 'models/reporting/cubes/VoiceCallCube'
import {
    formatTicketDrillDownRowData,
    formatVoiceDrillDownRowData,
} from '../DrillDownFormatters'

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

            const result = formatVoiceDrillDownRowData({
                row,
                metricField: 'metricField',
            })

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

    describe('formatTicketDrillDownRowData', () => {
        const ticketId = 468575039
        const agentId = 789726418
        const rawQaScore =
            '[{"dimension":"communication_skills","prediction":"5"},{"dimension":"resolution_completeness","prediction":"1"}]'
        const enrichment = {
            'Ticket.id': ticketId,
            'Ticket.subject': '',
            'Ticket.status': 'closed',
            'Ticket.excerpt':
                'Hi Rafa\u00ebl,\n\nThank you for reaching out regarding your order #3417. Since your order was placed on September 16, 2024, and it has been less than 2 business days, the tracking information and shipment d',
            'Ticket.channel': 'email',
            'Ticket.assignee_user_id': agentId,
            'Ticket.created_datetime': '2024-09-18T19:12:22',
            'Ticket.contact_reason': null,
            'Ticket.is_unread': false,
        }

        it('should format data with QA score', () => {
            const ticketId = 468575039
            const agentId = 789726418

            const cubeResult = {
                [TicketDimension.TicketId]: String(ticketId),
                [TicketQAScoreMeasure.QAScoreData]: rawQaScore,
            }

            const ticketRow = {
                ...cubeResult,
                ...enrichment,
            }
            const agentsData = [{...agents[0], id: agentId}]

            const formattedData = formatTicketDrillDownRowData({
                row: ticketRow,
                agents: agentsData,
                metricField: TicketQAScoreMeasure.QAScoreData,
                ticketIdField: TicketDimension.TicketId,
            })

            expect(formattedData).toEqual(
                expect.objectContaining({
                    qaScore: {
                        [TicketQAScoreDimensionName.ResolutionCompleteness]:
                            '1',
                        [TicketQAScoreDimensionName.CommunicationSkills]: '5',
                    },
                })
            )
        })

        it('should return no data if QA score is missing', () => {
            const cubeResult = {
                [TicketDimension.TicketId]: String(ticketId),
                [TicketQAScoreMeasure.QAScoreData]: '{}',
            }
            const ticketRow = {
                ...cubeResult,
                ...enrichment,
            }
            const agentsData = [{...agents[0], id: agentId}]

            const formattedData = formatTicketDrillDownRowData({
                row: ticketRow,
                agents: agentsData,
                metricField: TicketQAScoreMeasure.QAScoreData,
                ticketIdField: TicketDimension.TicketId,
            })

            expect(formattedData).toEqual(
                expect.not.objectContaining({
                    qaScore: {
                        [TicketQAScoreDimensionName.ResolutionCompleteness]:
                            '1',
                        [TicketQAScoreDimensionName.CommunicationSkills]: '5',
                    },
                })
            )
        })
    })
})
