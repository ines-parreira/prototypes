import { HttpResponse } from 'msw'

import { mockGetTicketHandler, mockTicket } from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../tests/render.utils'
import { server } from '../../tests/server'
import { useContactReasonPrediction } from '../contact-reason-prediction/useContactReasonPrediction'
import { useTicketThreadEvents } from '../events/useTicketThreadEvents'
import { useTicketThreadMessages } from '../messages/useTicketThreadMessages'
import { useRuleSuggestion } from '../rules-suggestions/useRuleSuggestion'
import { useTicketThreadSatisfactionSurveys } from '../satisfaction-survey/useTicketThreadSatisfactionSurveys'
import { TicketThreadItemTag } from '../types'
import { useTicketThread } from '../useTicketThread'
import { useTicketThreadVoiceCalls } from '../voice-calls/useTicketThreadVoiceCalls'

vi.mock('../messages/useTicketThreadMessages', () => ({
    useTicketThreadMessages: vi.fn(),
}))
vi.mock('../events/useTicketThreadEvents', () => ({
    useTicketThreadEvents: vi.fn(),
}))
vi.mock('../voice-calls/useTicketThreadVoiceCalls', () => ({
    useTicketThreadVoiceCalls: vi.fn(),
}))
vi.mock('../satisfaction-survey/useTicketThreadSatisfactionSurveys', () => ({
    useTicketThreadSatisfactionSurveys: vi.fn(),
}))
vi.mock('../rules-suggestions/useRuleSuggestion', () => ({
    useRuleSuggestion: vi.fn(),
}))
vi.mock('../contact-reason-prediction/useContactReasonPrediction', () => ({
    useContactReasonPrediction: vi.fn(),
}))

const mockUseTicketThreadMessages = vi.mocked(useTicketThreadMessages)
const mockUseTicketThreadEvents = vi.mocked(useTicketThreadEvents)
const mockUseTicketThreadVoiceCalls = vi.mocked(useTicketThreadVoiceCalls)
const mockUseTicketThreadSatisfactionSurveys = vi.mocked(
    useTicketThreadSatisfactionSurveys,
)
const mockUseRuleSuggestion = vi.mocked(useRuleSuggestion)
const mockUseContactReasonPrediction = vi.mocked(useContactReasonPrediction)

describe('useTicketThread', () => {
    beforeEach(() => {
        server.use(
            mockGetTicketHandler(async () =>
                HttpResponse.json(
                    mockTicket({
                        id: 7,
                    }),
                ),
            ).handler,
        )
        mockUseTicketThreadMessages.mockReturnValue({
            messages: [],
            activePendingMessages: [],
        })
        mockUseTicketThreadEvents.mockReturnValue({
            events: [],
            hasSatisfactionSurveyRespondedEvent: false,
        })
        mockUseTicketThreadVoiceCalls.mockReturnValue([])
        mockUseTicketThreadSatisfactionSurveys.mockReturnValue([])
        mockUseRuleSuggestion.mockReturnValue({
            insertRuleSuggestion: (items) => items,
        })
        mockUseContactReasonPrediction.mockReturnValue({
            insertContactReasonPrediction: (items) => items,
        })
    })

    it('sorts core items, appends active pending, then applies insertion hooks in order', () => {
        const messageEarly = {
            _tag: 'message-early',
            datetime: '2024-03-21T11:01:00Z',
        }
        const messageLate = {
            _tag: 'message-late',
            datetime: '2024-03-21T11:03:00Z',
        }
        const eventMid = {
            _tag: 'event-mid',
            datetime: '2024-03-21T11:02:00Z',
        }
        const voiceLate = {
            _tag: 'voice-late',
            datetime: '2024-03-21T11:04:00Z',
        }
        const surveyMidLate = {
            _tag: 'survey-mid-late',
            datetime: '2024-03-21T11:02:30Z',
        }
        const activePendingOld = {
            _tag: 'active-pending-old',
            datetime: '2024-03-21T11:00:00Z',
        }
        const ruleMarker = { _tag: 'rule-marker' }
        const contactMarker = { _tag: 'contact-marker' }

        mockUseTicketThreadMessages.mockReturnValue({
            messages: [messageLate, messageEarly] as any,
            activePendingMessages: [activePendingOld] as any,
        })
        mockUseTicketThreadEvents.mockReturnValue({
            events: [eventMid] as any,
            hasSatisfactionSurveyRespondedEvent: false,
        })
        mockUseTicketThreadVoiceCalls.mockReturnValue([voiceLate] as any)
        mockUseTicketThreadSatisfactionSurveys.mockReturnValue([
            surveyMidLate,
        ] as any)

        const insertRuleSuggestion = vi.fn((items: any[]) => [
            ...items,
            ruleMarker,
        ])
        const insertContactReasonPrediction = vi.fn((items: any[]) => [
            ...items,
            contactMarker,
        ])
        mockUseRuleSuggestion.mockReturnValue({ insertRuleSuggestion })
        mockUseContactReasonPrediction.mockReturnValue({
            insertContactReasonPrediction,
        })

        const { result } = renderHook(() =>
            useTicketThread({ ticketId: 7, showTicketEvents: true }),
        )

        const expectedBeforeInsertions = [
            messageEarly,
            eventMid,
            surveyMidLate,
            messageLate,
            voiceLate,
            activePendingOld,
        ]
        expect(insertRuleSuggestion).toHaveBeenCalledWith(
            expectedBeforeInsertions,
        )
        expect(insertContactReasonPrediction).toHaveBeenCalledWith([
            ...expectedBeforeInsertions,
            ruleMarker,
        ])

        // Legacy parity: active pending messages are intentionally appended after
        // sorting persisted/messages/events/voice/satisfaction buckets.
        expect(result.current.ticketThreadItems).toEqual([
            ...expectedBeforeInsertions,
            ruleMarker,
            contactMarker,
        ])
    })

    it('excludes events from sorted core items when showTicketEvents is false', () => {
        const message = {
            _tag: 'message',
            datetime: '2024-03-21T11:01:00Z',
        }
        const event = {
            _tag: 'event',
            datetime: '2024-03-21T11:00:00Z',
        }

        mockUseTicketThreadMessages.mockReturnValue({
            messages: [message] as any,
            activePendingMessages: [],
        })
        mockUseTicketThreadEvents.mockReturnValue({
            events: [event] as any,
            hasSatisfactionSurveyRespondedEvent: false,
        })

        const { result } = renderHook(() =>
            useTicketThread({ ticketId: 7, showTicketEvents: false }),
        )

        expect(result.current.ticketThreadItems).toEqual([message])
    })

    it('merges consecutive event items in the final ticket thread output', () => {
        const firstEvent = {
            _tag: TicketThreadItemTag.Events.TicketEvent,
            datetime: '2024-03-21T11:01:00Z',
            data: { id: 1 },
        }
        const secondEvent = {
            _tag: TicketThreadItemTag.Events.PhoneEvent,
            datetime: '2024-03-21T11:02:00Z',
            data: { id: 2 },
        }

        mockUseTicketThreadEvents.mockReturnValue({
            events: [firstEvent, secondEvent] as any,
            hasSatisfactionSurveyRespondedEvent: false,
        })

        const { result } = renderHook(() =>
            useTicketThread({ ticketId: 7, showTicketEvents: true }),
        )

        expect(result.current.ticketThreadItems).toEqual([
            {
                _tag: TicketThreadItemTag.Events.GroupedEvents,
                data: [firstEvent, secondEvent],
                datetime: firstEvent.datetime,
            },
        ])
    })

    it('does not merge events separated by insertion items', () => {
        const firstEvent = {
            _tag: TicketThreadItemTag.Events.TicketEvent,
            datetime: '2024-03-21T11:01:00Z',
            data: { id: 1 },
        }
        const secondEvent = {
            _tag: TicketThreadItemTag.Events.PhoneEvent,
            datetime: '2024-03-21T11:02:00Z',
            data: { id: 2 },
        }
        const contactMarker = {
            _tag: TicketThreadItemTag.ContactReasonSuggestion,
            data: null,
        }

        mockUseTicketThreadEvents.mockReturnValue({
            events: [firstEvent, secondEvent] as any,
            hasSatisfactionSurveyRespondedEvent: false,
        })
        mockUseContactReasonPrediction.mockReturnValue({
            insertContactReasonPrediction: (items) => [
                items[0],
                contactMarker,
                ...items.slice(1),
            ],
        })

        const { result } = renderHook(() =>
            useTicketThread({ ticketId: 7, showTicketEvents: true }),
        )

        expect(result.current.ticketThreadItems).toEqual([
            firstEvent,
            contactMarker,
            secondEvent,
        ])
    })
})
