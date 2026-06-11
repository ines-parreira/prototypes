import client from '@repo/api-resources'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import { teams } from 'fixtures/teams'

import { TeamList } from '../List'

const paginationMeta = { next_cursor: null, prev_cursor: null }

describe('<TeamList />', () => {
    let mockServer: MockAdapter

    const mockFetchTeams = (data: typeof teams = []) => {
        mockServer.onGet('/api/teams/').reply(200, {
            data,
            meta: paginationMeta,
        })
    }

    beforeEach(() => {
        mockServer = new MockAdapter(client)
    })

    afterEach(() => {
        mockServer.restore()
    })

    it('should render empty state when no teams are returned', async () => {
        mockFetchTeams()

        render(<TeamList />, {})

        expect(
            await screen.findByText(
                /Your account doesn't have any teams yet./i,
            ),
        ).toBeInTheDocument()
    })

    it('should render teams returned by the API', async () => {
        mockFetchTeams(teams)

        render(<TeamList />, {})

        expect(
            await screen.findByRole('link', { name: /Foo/i }),
        ).toHaveAttribute('href', '/app/settings/teams/33/members')
        expect(
            screen.getByRole('link', {
                name: /Phone team - \+1 205-396-3441/i,
            }),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(/Your account doesn't have any teams yet./i),
        ).not.toBeInTheDocument()
    })
})
