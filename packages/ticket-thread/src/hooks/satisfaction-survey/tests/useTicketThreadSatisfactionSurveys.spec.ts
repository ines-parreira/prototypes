import { renderHook } from '../../../tests/render.utils'
import { TicketThreadItemTag } from '../../types'
import { useTicketThreadSatisfactionSurveys } from '../useTicketThreadSatisfactionSurveys'

describe('useTicketThreadSatisfactionSurveys', () => {
    it('hides satisfaction survey when responded event exists', () => {
        const ticket = {
            satisfaction_survey: {
                score: 5,
                customer_id: 12,
                ticket_id: 24,
                scored_datetime: '2024-03-21T11:30:00Z',
                created_datetime: '2024-03-21T11:00:00Z',
            },
        }

        const { result } = renderHook(() =>
            useTicketThreadSatisfactionSurveys({
                ticket: ticket as any,
                hasSatisfactionSurveyRespondedEvent: true,
            }),
        )

        // Legacy parity: selectors#getBody suppresses ticket satisfaction survey
        // entries once a "satisfaction-survey-responded" event is present.
        expect(result.current).toEqual([])
    })

    it('uses scored_datetime as primary timeline datetime', () => {
        const ticket = {
            satisfaction_survey: {
                score: 3,
                customer_id: 12,
                ticket_id: 24,
                scored_datetime: '2024-03-21T11:30:00Z',
                created_datetime: '2024-03-21T11:00:00Z',
            },
        }

        const { result } = renderHook(() =>
            useTicketThreadSatisfactionSurveys({
                ticket: ticket as any,
                hasSatisfactionSurveyRespondedEvent: false,
            }),
        )

        expect(result.current).toEqual([
            {
                _tag: TicketThreadItemTag.SatisfactionSurvey,
                data: ticket.satisfaction_survey,
                datetime: '2024-03-21T11:30:00Z',
            },
        ])
    })

    it('falls back to created_datetime when scored_datetime is null', () => {
        const ticket = {
            satisfaction_survey: {
                score: null,
                customer_id: 12,
                ticket_id: 24,
                scored_datetime: null,
                created_datetime: '2024-03-21T11:00:00Z',
            },
        }

        const { result } = renderHook(() =>
            useTicketThreadSatisfactionSurveys({
                ticket: ticket as any,
                hasSatisfactionSurveyRespondedEvent: false,
            }),
        )

        expect(result.current[0]?.datetime).toBe('2024-03-21T11:00:00Z')
    })
})
