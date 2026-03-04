import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListTeamsHandler,
    mockListTeamsResponse,
    mockListUsersHandler,
    mockListUsersResponse,
    mockTeam,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { render } from '../../../../tests/render.utils'
import { server } from '../../../../tests/server'
import { TicketThreadEventTarget } from '../TicketThreadEventTarget'

function getUsersHandler(users: unknown[]) {
    return mockListUsersHandler(async () =>
        HttpResponse.json(
            mockListUsersResponse({
                data: users as any[],
                meta: { prev_cursor: null, next_cursor: null },
            }),
        ),
    )
}

function getTeamsHandler(teams: unknown[]) {
    return mockListTeamsHandler(async () =>
        HttpResponse.json(
            mockListTeamsResponse({
                data: teams as any[],
                meta: { prev_cursor: null, next_cursor: null },
            }),
        ),
    )
}

describe('TicketThreadEventTarget', () => {
    it('renders the assignee agent when assignee_user_id is provided', async () => {
        server.use(
            getUsersHandler([mockUser({ id: 99, name: 'User Agent' })]).handler,
            getTeamsHandler([mockTeam({ id: 1, name: 'Support Team' })])
                .handler,
        )

        render(<TicketThreadEventTarget assignee_user_id={99} />)

        expect(await screen.findByText('User Agent')).toBeInTheDocument()
        expect(screen.getByText('to')).toBeInTheDocument()
    })

    it('renders the assignee team when assignee_team_id is provided', async () => {
        server.use(
            getUsersHandler([mockUser({ id: 99, name: 'User Agent' })]).handler,
            getTeamsHandler([mockTeam({ id: 2, name: 'Billing Team' })])
                .handler,
        )

        render(<TicketThreadEventTarget assignee_team_id={2} />)

        expect(await screen.findByText('Billing Team')).toBeInTheDocument()
        expect(screen.getByText('to')).toBeInTheDocument()
    })

    it('renders nothing when target cannot be resolved', async () => {
        const mockListUsers = getUsersHandler([
            mockUser({ id: 1, name: 'User Agent' }),
        ])
        const mockListTeams = getTeamsHandler([
            mockTeam({ id: 2, name: 'Billing Team' }),
        ])
        const waitForUsersRequest = mockListUsers.waitForRequest(server)
        const waitForTeamsRequest = mockListTeams.waitForRequest(server)

        server.use(mockListUsers.handler, mockListTeams.handler)

        const { container } = render(
            <TicketThreadEventTarget assignee_user_id={9} />,
        )

        await waitForUsersRequest(() => undefined)
        await waitForTeamsRequest(() => undefined)
        await waitFor(() => {
            expect(container).toBeEmptyDOMElement()
        })
    })
})
