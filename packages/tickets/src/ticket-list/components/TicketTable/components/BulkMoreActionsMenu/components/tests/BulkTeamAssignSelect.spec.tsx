import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListTeamsHandler, mockTeam } from '@gorgias/helpdesk-mocks'

import {
    render,
    testAppQueryClient,
} from '../../../../../../../tests/render.utils'
import { BulkTeamAssignSelect } from '../BulkTeamAssignSelect'

const team1 = mockTeam({ id: 1, name: 'Support' })
const team2 = mockTeam({ id: 2, name: 'Sales' })

const mockListTeams = mockListTeamsHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        data: [team1, team2],
        meta: { prev_cursor: null, next_cursor: null },
    }),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockListTeams.handler)
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const waitUntilLoaded = async () => {
    let trigger: HTMLElement = {} as HTMLElement
    await waitFor(() => {
        const elements = screen.getAllByLabelText('Assign team')
        expect(elements[0]).not.toBeDisabled()
        trigger = elements[0]
    })
    return trigger
}

const openMenu = async (
    user: ReturnType<typeof render>['user'],
    trigger: HTMLElement,
) => {
    await user.click(trigger)
}

describe('BulkTeamAssignSelect', () => {
    it('calls onChange with the selected team', async () => {
        const onChange = vi.fn()
        const { user } = render(<BulkTeamAssignSelect onChange={onChange} />)

        const trigger = await waitUntilLoaded()
        await openMenu(user, trigger)

        const supportOptions = await screen.findAllByText('Support')
        await user.click(supportOptions[supportOptions.length - 1])

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1, name: 'Support' }),
        )
    })

    it('calls onChange with null when No team is selected', async () => {
        const onChange = vi.fn()
        const { user } = render(<BulkTeamAssignSelect onChange={onChange} />)

        const trigger = await waitUntilLoaded()
        await openMenu(user, trigger)

        const noTeamOptions = await screen.findAllByText('No team')
        await user.click(noTeamOptions[noTeamOptions.length - 1])

        expect(onChange).toHaveBeenCalledWith(null)
    })

    it('clears search when dropdown is closed', async () => {
        const { user } = render(<BulkTeamAssignSelect onChange={vi.fn()} />)

        const trigger = await waitUntilLoaded()
        await openMenu(user, trigger)

        const searchInput = await screen.findByRole('searchbox')
        await user.type(searchInput, 'Sup')
        expect(searchInput).toHaveValue('Sup')

        await user.click(trigger)
        await waitFor(() => {
            expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
        })

        await openMenu(user, trigger)
        expect(await screen.findByRole('searchbox')).toHaveValue('')
    })
})
