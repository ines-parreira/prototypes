import {
    TicketQAScoreDimensionName,
    TicketQAScoreMeasure,
} from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { VoiceCallDimension } from 'domains/reporting/models/cubes/VoiceCallCube'
import {
    formatTicketDrillDownRowData,
    formatVoiceDrillDownRowData,
} from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import { agents } from 'fixtures/agents'

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
            const score = 123

            const cubeResult = {
                [TicketDimension.TicketId]: String(ticketId),
                [TicketQAScoreMeasure.AverageAccuracyScore]: score,
                [TicketQAScoreMeasure.AverageBrandVoiceScore]: score,
                [TicketQAScoreMeasure.AverageCommunicationSkillsScore]: score,
                [TicketQAScoreMeasure.AverageEfficiencyScore]: score,
                [TicketQAScoreMeasure.AverageInternalComplianceScore]: score,
                [TicketQAScoreMeasure.AverageLanguageProficiencyScore]: score,
                [TicketQAScoreMeasure.AverageResolutionCompletenessScore]:
                    score,
            }

            const ticketRow = {
                ...cubeResult,
                ...enrichment,
            }
            const agentsData = [{ ...agents[0], id: agentId }]

            const formattedData = formatTicketDrillDownRowData({
                row: ticketRow,
                agents: agentsData,
                metricField: TicketQAScoreMeasure.QAScoreData,
                ticketIdField: TicketDimension.TicketId,
            })

            expect(formattedData).toEqual(
                expect.objectContaining({
                    rowData: expect.objectContaining({
                        [TicketQAScoreMeasure.AverageAccuracyScore]: score,
                        [TicketQAScoreMeasure.AverageBrandVoiceScore]: score,
                        [TicketQAScoreMeasure.AverageCommunicationSkillsScore]:
                            score,
                        [TicketQAScoreMeasure.AverageEfficiencyScore]: score,
                        [TicketQAScoreMeasure.AverageInternalComplianceScore]:
                            score,
                        [TicketQAScoreMeasure.AverageLanguageProficiencyScore]:
                            score,
                        [TicketQAScoreMeasure.AverageResolutionCompletenessScore]:
                            score,
                    }),
                }),
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
            const agentsData = [{ ...agents[0], id: agentId }]

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
                }),
            )
        })
    })

    describe('format row data for AI agent insights', () => {
        it('should return the formatted row data with outcome', () => {
            const row = {
                'Ticket.assignee_user_id': null,
                'Ticket.channel': 'chat',
                'Ticket.contact_reason': null,
                'Ticket.created_datetime': '2024-12-19T17:13:00.291264',
                'Ticket.custom_fields': { 1: '1::1', 2: '2::2' },
                'TicketEnriched.ticketId': '1',
            }
            const result = formatTicketDrillDownRowData({
                row,
                metricField: 'metricField',
                customFieldsIds: {
                    outcomeCustomFieldId: 1,
                },
            })

            expect(result).toEqual(
                expect.objectContaining({
                    assignee: null,
                    ticket: {
                        channel: 'chat',
                        contactReason: null,
                        created: '2024-12-19T17:13:00.291264',
                        description: null,
                        id: null,
                        isRead: false,
                        status: null,
                        subject: null,
                    },
                    intent: undefined,
                    outcome: 'Automated',
                    metricValue: undefined,
                }),
            )
        })

        it('should return the formatted row data with intent', () => {
            const row = {
                'Ticket.assignee_user_id': null,
                'Ticket.channel': 'chat',
                'Ticket.contact_reason': null,
                'Ticket.created_datetime': '2024-12-19T17:13:00.291264',
                'Ticket.custom_fields': { 1: '1::1', 2: '2::2' },
                'TicketEnriched.ticketId': '1',
            }
            const result = formatTicketDrillDownRowData({
                row,
                metricField: 'metricField',
                customFieldsIds: {
                    intentCustomFieldId: 2,
                },
            })

            expect(result).toEqual(
                expect.objectContaining({
                    assignee: null,
                    ticket: {
                        channel: 'chat',
                        contactReason: null,
                        created: '2024-12-19T17:13:00.291264',
                        description: null,
                        id: null,
                        isRead: false,
                        status: null,
                        subject: null,
                    },
                    intent: '2/2',
                    outcome: undefined,
                    metricValue: undefined,
                }),
            )
        })

        it('should return the formatted row data with surveyScore', () => {
            const row = {
                'Ticket.assignee_user_id': null,
                'Ticket.channel': 'chat',
                'Ticket.contact_reason': 'Some reason',
                'Ticket.created_datetime': '2024-12-19T17:13:00.291264',
                'TicketEnriched.ticketId': '1',
                'TicketSatisfactionSurveyEnriched.surveyScore': '5',
            }
            const result = formatTicketDrillDownRowData({
                row,
                metricField: 'metricField',
                customFieldsIds: {
                    intentCustomFieldId: 2,
                },
            })

            expect(result).toEqual(
                expect.objectContaining({
                    assignee: null,
                    ticket: {
                        channel: 'chat',
                        contactReason: 'Some reason',
                        created: '2024-12-19T17:13:00.291264',
                        description: null,
                        id: null,
                        isRead: false,
                        status: null,
                        subject: null,
                    },
                    outcome: undefined,
                    metricValue: undefined,
                    surveyScore: '5',
                }),
            )
        })

        it('should handle product data with titles and variants present', () => {
            const row = {
                'Ticket.assignee_user_id': null,
                'Ticket.channel': 'chat',
                'Ticket.contact_reason': null,
                'Ticket.created_datetime': '2024-12-19T17:13:00.291264',
                'TicketEnriched.ticketId': '1',
                'Products.titles': {
                    product1: 'Product One',
                    product2: 'Product Two',
                },
                'Products.variants': {
                    variant1: 'Variant One',
                    variant2: 'Variant Two',
                },
            }
            const result = formatTicketDrillDownRowData({
                row,
                metricField: 'metricField',
                customFieldsIds: {},
            })

            expect(result).toEqual(
                expect.objectContaining({
                    product: {
                        titles: ['Product One', 'Product Two'],
                        variants: ['Variant One', 'Variant Two'],
                    },
                }),
            )
        })

        it('should handle product data with titles and variants missing', () => {
            const row = {
                'Ticket.assignee_user_id': null,
                'Ticket.channel': 'chat',
                'Ticket.contact_reason': null,
                'Ticket.created_datetime': '2024-12-19T17:13:00.291264',
                'TicketEnriched.ticketId': '1',
            }
            const result = formatTicketDrillDownRowData({
                row,
                metricField: 'metricField',
                customFieldsIds: {},
            })

            expect(result).toEqual(
                expect.objectContaining({
                    product: {
                        titles: [],
                        variants: [],
                    },
                }),
            )
        })
    })
})
