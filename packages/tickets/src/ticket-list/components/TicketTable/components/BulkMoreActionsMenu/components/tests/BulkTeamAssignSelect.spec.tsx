import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import { mockListTeamsHandler, mockTeam } from '@gorgias/helpdesk-mocks'

import { render } from '../../../../../../../tests/render.utils'
import { server } from '../../../../../../../tests/server'
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

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockListTeams.handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const waitUntilLoaded = async () => {
    await waitFor(() => {
        const elements = screen.getAllByLabelText('Assign team')
        expect(elements[0]).not.toBeDisabled()
    })
    return screen.getAllByLabelText('Assign team')[0]
}

const openMenu = async (user: ReturnType<typeof render>['user']) => {
    await user.click(await waitUntilLoaded())
}

describe('BulkTeamAssignSelect', () => {
    it('calls onChange with the selected team', async () => {
        const onChange = vi.fn()
        const { user } = render(<BulkTeamAssignSelect onChange={onChange} />)

        await openMenu(user)

        const supportOptions = await screen.findAllByText('Support')
        await user.click(supportOptions[supportOptions.length - 1])

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1, name: 'Support' }),
        )
    })

    it('calls onChange with null when No team is selected', async () => {
        const onChange = vi.fn()
        const { user } = render(<BulkTeamAssignSelect onChange={onChange} />)

        await openMenu(user)

        const noTeamOptions = await screen.findAllByText('No team')
        await user.click(noTeamOptions[noTeamOptions.length - 1])

        expect(onChange).toHaveBeenCalledWith(null)
    })

    it('clears search when dropdown is closed', async () => {
        const { user } = render(<BulkTeamAssignSelect onChange={vi.fn()} />)

        await openMenu(user)

        const searchInput = await screen.findByRole('searchbox')
        await user.type(searchInput, 'Sup')
        expect(searchInput).toHaveValue('Sup')

        await user.click(await waitUntilLoaded())
        await waitFor(() => {
            expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
        })

        await openMenu(user)
        expect(await screen.findByRole('searchbox')).toHaveValue('')
    })
})
