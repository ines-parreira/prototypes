import {render, waitFor} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'
import client from 'models/api/resources'
import {teams} from 'fixtures/teams'
import TeamList from '../List'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('<TeamList />', () => {
    const store = mockStore({})
    let mockServer: MockAdapter

    beforeEach(() => {
        jest.clearAllMocks()
        mockServer = new MockAdapter(client)
    })

    it('should render without data', async () => {
        const {container, getByText} = render(
            <Provider store={store}>
                <TeamList />
            </Provider>
        )

        await waitFor(() => {
            expect(getByText(/Create teams/i)).toBeDefined()
            expect(container.firstChild).toMatchSnapshot()
        })
    })
    it('should render with data', async () => {
        mockServer
            .onGet('/api/teams/')
            .reply(200, {data: teams, meta: {current_page: 1}})

        const {container, getByText} = render(
            <Provider store={store}>
                <TeamList />
            </Provider>
        )

        await waitFor(() => {
            expect(getByText(/Create teams/i)).toBeDefined()
            expect(getByText(/Foo/i)).toBeDefined()
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
