import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListUsersHandler,
    mockListUsersResponse,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { render } from '../../../../tests/render.utils'
import { server } from '../../../../tests/server'
import { TicketThreadEventAuthor } from '../TicketThreadEventAuthor'

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

describe('TicketThreadEventAuthor', () => {
    it('renders the author name when the agent exists', async () => {
        server.use(
            getUsersHandler([
                mockUser({
                    id: 42,
                    name: 'Alex Agent',
                }),
            ]).handler,
        )

        render(<TicketThreadEventAuthor authorId={42} />)

        expect(await screen.findByText('Alex Agent')).toBeInTheDocument()
        expect(screen.getByText('by')).toBeInTheDocument()
    })

    it('renders nothing when the author cannot be resolved', async () => {
        const mockListUsers = getUsersHandler([
            mockUser({
                id: 12,
                name: 'Other Agent',
            }),
        ])
        const waitForListUsersRequest = mockListUsers.waitForRequest(server)

        server.use(mockListUsers.handler)

        const { container } = render(<TicketThreadEventAuthor authorId={42} />)

        await waitForListUsersRequest(() => undefined)
        await waitFor(() => {
            expect(container).toBeEmptyDOMElement()
        })
    })
})
