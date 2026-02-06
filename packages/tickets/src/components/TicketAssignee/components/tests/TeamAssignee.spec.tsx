import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListTeamsHandler,
    mockTeam,
    mockTicket,
    mockTicketTeam,
    mockUpdateTicketHandler,
} from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../../../tests/render.utils'
import { TeamAssignee } from '../TeamAssignee'

const ticketId = 123

const team1 = mockTeam({ id: 1, name: 'Support', decoration: { emoji: '🛠️' } })
const team2 = mockTeam({ id: 2, name: 'Sales', decoration: { emoji: '💰' } })
const team3 = mockTeam({ id: 3, name: 'Engineering', decoration: null })

const mockListTeams = mockListTeamsHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        data: [team1, team2, team3],
        meta: {
            prev_cursor: null,
            next_cursor: null,
        },
    }),
)

const mockUpdateTicket = mockUpdateTicketHandler(async () => {
    return HttpResponse.json(
        mockTicket({
            id: ticketId,
            assignee_team: mockTicketTeam(team1),
        }),
    )
})

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockListTeams.handler, mockUpdateTicket.handler)
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const waitUntilLoaded = async () => {
    let selectElement: HTMLElement = {} as HTMLElement
    await waitFor(() => {
        const select = screen.getAllByLabelText('Team selection')
        expect(select[0]).not.toBeDisabled()
        selectElement = select[0]
    })
    return selectElement
}

describe('TeamAssignee', () => {
    it('should render with "No team" placeholder when no team assigned', async () => {
        render(<TeamAssignee ticketId={ticketId} currentTeam={null} />)

        await waitUntilLoaded()

        expect(screen.getByText('No team')).toBeInTheDocument()
    })

    it('should render with current team name when team is assigned', async () => {
        render(
            <TeamAssignee
                ticketId={ticketId}
                currentTeam={mockTicketTeam(team1)}
            />,
        )

        await waitUntilLoaded()

        const supportTexts = screen.getAllByText('Support')
        expect(supportTexts.length).toBeGreaterThan(0)
    })

    it('should render and include current team in options when not in loaded teams list', async () => {
        const notLoadedTeam = mockTicketTeam({
            id: 123,
            name: 'Random Team',
            decoration: { emoji: '🔥' },
        })
        const notLoadedTicketTeam = mockTicketTeam(notLoadedTeam)

        const { user } = render(
            <TeamAssignee
                ticketId={ticketId}
                currentTeam={notLoadedTicketTeam}
            />,
        )

        const select = await waitUntilLoaded()
        await act(() => user.click(select))

        await waitFor(() => {
            const randomTeamTexts = screen.getAllByText('Random Team')
            expect(randomTeamTexts.length).toBe(3)
        })
    })

    it('should be disabled while loading', () => {
        render(<TeamAssignee ticketId={ticketId} currentTeam={null} />)

        const select = screen.getAllByLabelText('Team selection')
        expect(select[0]).toBeDisabled()
    })

    it('should update team assignment when selecting a team', async () => {
        const waitForUpdateTicketRequest =
            mockUpdateTicket.waitForRequest(server)

        const { user } = render(
            <TeamAssignee ticketId={ticketId} currentTeam={null} />,
        )

        const select = await waitUntilLoaded()
        await act(() => user.click(select))

        const supportOption = screen.getByRole('option', {
            name: 'Support',
        })
        await act(() => user.click(supportOption))

        await waitForUpdateTicketRequest(async (request) => {
            const body = await request.clone().json()
            expect(body).toEqual({
                assignee_team: { id: 1 },
            })
        })
    })

    it('should update team assignment when selecting "No team" option', async () => {
        const waitForUpdateTicketRequest =
            mockUpdateTicket.waitForRequest(server)

        const { user } = render(
            <TeamAssignee
                ticketId={ticketId}
                currentTeam={mockTicketTeam(team1)}
            />,
        )

        const select = await waitUntilLoaded()
        await act(() => user.click(select))

        const noTeamOption = screen
            .getAllByRole('option')
            .find((option) => option.textContent?.includes('No team'))

        await act(() => user.click(noTeamOption!))

        await waitForUpdateTicketRequest(async (request) => {
            const body = await request.clone().json()
            expect(body).toEqual({
                assignee_team: null,
            })
        })
    })

    it('should clear search when dropdown is closed', async () => {
        const { user } = render(
            <TeamAssignee ticketId={ticketId} currentTeam={null} />,
        )

        const select = await waitUntilLoaded()
        await act(() => user.click(select))

        const searchInput = await screen.findByRole('searchbox')
        await act(() => user.type(searchInput, 'test search'))

        expect(searchInput).toHaveValue('test search')

        await act(() => user.click(select))
        await waitFor(() => {
            expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
        })

        await act(() => user.click(select))
        const searchInputAfterReopen = await screen.findByRole('searchbox')

        expect(searchInputAfterReopen).toHaveValue('')
    })
})
