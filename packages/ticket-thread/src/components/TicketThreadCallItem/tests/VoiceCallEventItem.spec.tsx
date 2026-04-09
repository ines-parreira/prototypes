import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListUsersHandler,
    mockListUsersResponse,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { getCurrentUserHandler } from '../../../tests/getCurrentUser.mock'
import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { VoiceCallEventItem } from '../components/VoiceCallEventItem'
import type { ProcessedEvent } from '../models/processEvents'
import { VoiceCallSubjectType } from '../models/types'

const testAgent = mockUser({ id: 42, name: 'Agent Smith' })

const baseEvent: ProcessedEvent = {
    datetime: '2024-03-21T11:00:00Z',
    action: 'answered',
}

describe('VoiceCallEventItem', () => {
    beforeEach(() => {
        server.use(
            getCurrentUserHandler().handler,
            mockListUsersHandler(async () =>
                HttpResponse.json(
                    mockListUsersResponse({
                        data: [testAgent],
                        meta: { prev_cursor: null, next_cursor: null },
                    }),
                ),
            ).handler,
        )
    })

    it('renders the capitalised action text', () => {
        render(<VoiceCallEventItem event={baseEvent} />)

        expect(screen.getByText('Answered')).toBeInTheDocument()
    })

    it('renders "Transfer answered" when showTransferPrefix is true', () => {
        const event: ProcessedEvent = {
            ...baseEvent,
            showTransferPrefix: true,
        }

        render(<VoiceCallEventItem event={event} />)

        expect(screen.getByText('Transfer answered')).toBeInTheDocument()
    })

    it('renders agent name when actor is an Agent subject', async () => {
        const event: ProcessedEvent = {
            ...baseEvent,
            actor: {
                type: VoiceCallSubjectType.Agent,
                id: 42,
            },
        }

        render(<VoiceCallEventItem event={event} />)

        await waitFor(() => {
            expect(screen.getByText('Agent Smith')).toBeInTheDocument()
        })
    })

    it('renders extra text in parentheses when extra is provided', () => {
        const event: ProcessedEvent = {
            ...baseEvent,
            extra: 'timeout',
        }

        render(<VoiceCallEventItem event={event} />)

        expect(screen.getByText('(timeout)')).toBeInTheDocument()
    })
})
