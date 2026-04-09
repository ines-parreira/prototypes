import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListUsersHandler,
    mockListUsersResponse,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { VoiceCallAgentLabel } from '../components/VoiceCallAgentLabel'

const testAgent = mockUser({ id: 42, name: 'Alice Agent' })

describe('VoiceCallAgentLabel', () => {
    describe('when agent is found', () => {
        beforeEach(() => {
            server.use(
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

        it('renders agent name when data is loaded', async () => {
            render(<VoiceCallAgentLabel agentId={42} />)

            await waitFor(() => {
                expect(screen.getByText('Alice Agent')).toBeInTheDocument()
            })
        })
    })

    describe('when users list is loading', () => {
        beforeEach(() => {
            server.use(
                mockListUsersHandler(() => new Promise(() => {})).handler,
            )
        })

        it('falls back to formatted phone number while loading', () => {
            render(
                <VoiceCallAgentLabel agentId={42} phoneNumber="+12025551234" />,
            )

            expect(screen.getByText('+1 202 555 1234')).toBeInTheDocument()
        })
    })

    describe('when agent is not found and no phone number', () => {
        beforeEach(() => {
            server.use(
                mockListUsersHandler(async () =>
                    HttpResponse.json(
                        mockListUsersResponse({
                            data: [],
                            meta: { prev_cursor: null, next_cursor: null },
                        }),
                    ),
                ).handler,
            )
        })

        it('falls back to "Agent #N" when agent not found and no phone number', async () => {
            render(<VoiceCallAgentLabel agentId={99} />)

            await waitFor(() => {
                expect(screen.getByText('Agent #99')).toBeInTheDocument()
            })
        })
    })
})
