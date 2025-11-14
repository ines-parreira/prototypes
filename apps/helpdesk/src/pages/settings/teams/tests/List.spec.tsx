import { screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { teams } from 'fixtures/teams'
import client from 'models/api/resources'
import { renderWithRouter } from 'utils/testing'

import TeamList from '../List'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('<TeamList />', () => {
    const store = mockStore({})
    let mockServer: MockAdapter

    beforeEach(() => {
        mockServer = new MockAdapter(client)
    })

    it('should render without data', async () => {
        renderWithRouter(
            <Provider store={store}>
                <TeamList />
            </Provider>,
        )

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

        const { container } = renderWithRouter(
            <Provider store={store}>
                <TeamList />
            </Provider>,
        )

        await waitFor(() => {
            expect(screen.getByText(/Create teams/i)).toBeDefined()
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
