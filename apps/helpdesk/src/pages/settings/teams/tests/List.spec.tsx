import client from '@repo/api-resources'
import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import { teams } from 'fixtures/teams'

import TeamList from '../List'

describe('<TeamList />', () => {
    let mockServer: MockAdapter
    beforeEach(() => {
        mockServer = new MockAdapter(client)
    })
    it('should render without data', async () => {
        render(<TeamList />, {})
        await waitFor(() => {
            expect(
                screen.getByText(/Your account doesn't have any teams yet./i),
            ).toBeInTheDocument()
        })
    })
    it('should render with data', async () => {
        mockServer.onGet('/api/teams/').reply(200, {
            data: teams,
            meta: { next_cursor: null, prev_cursor: null },
        })
        const { container } = render(<TeamList />, {})
        await waitFor(() => {
            expect(screen.getByText(/Create teams/i)).toBeDefined()
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
