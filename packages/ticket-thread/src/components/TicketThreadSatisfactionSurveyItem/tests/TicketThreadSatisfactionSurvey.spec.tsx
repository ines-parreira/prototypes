import { screen } from '@testing-library/react'

import { ListEventsObjectType } from '@gorgias/helpdesk-client'
import {
    mockEvent,
    mockTicketSatisfactionSurvey,
} from '@gorgias/helpdesk-mocks'

import { SATISFACTION_SURVEY_RESPONDED_EVENT_TYPE } from '../../../hooks/satisfaction-survey/constants'
import {
    isScheduledSatisfactionSurveyItem,
    isSentSatisfactionSurveyItem,
    isToBeSentSatisfactionSurveyItem,
} from '../../../hooks/satisfaction-survey/predicates'
import {
    toSurveyItemFromEvent,
    toSurveyItemFromSurvey,
} from '../../../hooks/satisfaction-survey/transforms'
import type { TicketThreadSatisfactionSurveyItem } from '../../../hooks/satisfaction-survey/types'
import { getCurrentUserHandler } from '../../../tests/getCurrentUser.mock'
import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { TicketThreadSatisfactionSurveyItem as TicketThreadSatisfactionSurveyItemComponent } from '../TicketTheadSatisfactionSurveyItem'

const defaultAuthorLabel = 'Jane Customer'

beforeEach(() => {
    server.use(getCurrentUserHandler().handler)
})

function createRespondedItem(overrides?: {
    body_text?: string | null
    created_datetime?: string
    score?: number
}) {
    return toSurveyItemFromEvent(
        {
            ...mockEvent({
                object_id: 11,
                object_type: ListEventsObjectType.SatisfactionSurvey,
                type: SATISFACTION_SURVEY_RESPONDED_EVENT_TYPE,
            }),
            created_datetime:
                overrides?.created_datetime ?? '2024-03-21T11:00:00Z',
            data: {
                score: overrides?.score ?? 4,
                body_text: overrides?.body_text ?? 'Great support',
            },
        },
        defaultAuthorLabel,
    )
}

function createSentItem() {
    const survey = mockTicketSatisfactionSurvey({
        body_text: null,
        created_datetime: '2024-03-21T11:00:00Z',
        customer_id: 12,
        id: 11,
        score: null,
        scored_datetime: null,
        sent_datetime: '2024-03-21T11:45:00Z',
        should_send_datetime: null,
        ticket_id: 24,
    })

    if (!isSentSatisfactionSurveyItem(survey)) {
        throw new Error('Expected a sent satisfaction survey mock')
    }

    return toSurveyItemFromSurvey(survey, defaultAuthorLabel)
}

function createScheduledItem() {
    const survey = mockTicketSatisfactionSurvey({
        body_text: null,
        created_datetime: '2024-03-21T11:00:00Z',
        customer_id: 12,
        id: 11,
        score: null,
        scored_datetime: null,
        sent_datetime: null,
        should_send_datetime: '2024-03-22T11:45:00Z',
        ticket_id: 24,
    })

    if (!isScheduledSatisfactionSurveyItem(survey)) {
        throw new Error('Expected a scheduled satisfaction survey mock')
    }

    return toSurveyItemFromSurvey(survey, defaultAuthorLabel)
}

function createToBeSentItem() {
    const survey = mockTicketSatisfactionSurvey({
        body_text: null,
        created_datetime: '2024-03-21T11:00:00Z',
        customer_id: 12,
        id: 11,
        score: null,
        scored_datetime: null,
        sent_datetime: null,
        should_send_datetime: null,
        ticket_id: 24,
    })

    if (!isToBeSentSatisfactionSurveyItem(survey)) {
        throw new Error('Expected a to-be-sent satisfaction survey mock')
    }

    return toSurveyItemFromSurvey(survey, defaultAuthorLabel)
}

function renderSatisfactionSurvey(item: TicketThreadSatisfactionSurveyItem) {
    render(<TicketThreadSatisfactionSurveyItemComponent item={item} />)
}

describe('TicketThreadSatisfactionSurveyItem', () => {
    it('renders a responded survey item', () => {
        renderSatisfactionSurvey(createRespondedItem())

        expect(screen.getByText('4 stars CSAT review')).toBeInTheDocument()
        expect(screen.getByText('Jane Customer')).toBeInTheDocument()
        expect(screen.getByText('Great support')).toBeInTheDocument()
        expect(screen.getByText('03/21/2024')).toBeInTheDocument()
    })

    it('renders singular responded copy for a one-star review', () => {
        renderSatisfactionSurvey(
            createRespondedItem({
                body_text: 'Needs work',
                score: 1,
            }),
        )

        expect(screen.getByText('1 star CSAT review')).toBeInTheDocument()
        expect(screen.getByText('Needs work')).toBeInTheDocument()
    })

    it('renders a sent survey item', () => {
        renderSatisfactionSurvey(createSentItem())

        expect(
            screen.getByText('CSAT review was sent to Jane Customer'),
        ).toBeInTheDocument()
        expect(screen.getByText('03/21/2024')).toBeInTheDocument()
    })

    it('renders a scheduled survey item with a scheduled date', () => {
        renderSatisfactionSurvey(createScheduledItem())

        expect(
            screen.getByText('CSAT review will be sent to Jane Customer'),
        ).toBeInTheDocument()
        expect(screen.getByText('03/22/2024')).toBeInTheDocument()
    })

    it('renders a to-be-sent survey item without any scheduled date', () => {
        renderSatisfactionSurvey(createToBeSentItem())

        expect(
            screen.getByText('CSAT review to be sent to Jane Customer'),
        ).toBeInTheDocument()
        expect(screen.queryByText('03/21/2024')).not.toBeInTheDocument()
    })
})
