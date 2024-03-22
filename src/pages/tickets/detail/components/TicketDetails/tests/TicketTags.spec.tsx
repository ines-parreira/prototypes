import React, {ComponentProps} from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {Map, fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'

import {UserRole} from 'config/types/user'
import {agents} from 'fixtures/agents'
import client from 'models/api/resources'

import {SEARCH_ENDPOINT} from 'models/search/resources'
import TicketTags from '../TicketTags'

const mockStore = configureMockStore([thunk])

describe('<TicketTags />', () => {
    let mockServer: MockAdapter

    const user = fromJS(fromJS(agents[0])) as Map<any, any>
    const store = mockStore({
        currentUser: user,
    })

    beforeEach(() => {
        mockServer = new MockAdapter(client)
    })

    const minProps: Omit<ComponentProps<typeof TicketTags>, 'transparent'> = {
        addTag: jest.fn(),
        removeTag: jest.fn(),
        ticketTags: fromJS([
            {name: 'refund'},
            {name: 'angry'},
            {name: 'return'},
        ]),
    }

    it('should display current tags', () => {
        const {container} = render(
            <Provider store={store}>
                <TicketTags {...minProps} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should allow the tag creation to lead agent', async () => {
        mockServer
            .onPost(SEARCH_ENDPOINT)
            .reply(200, {data: [{id: 1, name: 'exchange'}]})
        const {getByText, getByPlaceholderText} = render(
            <Provider store={store}>
                <TicketTags {...minProps} />
            </Provider>
        )

        fireEvent.click(getByText(/add/))
        fireEvent.change(getByPlaceholderText(/Search tags/), {
            target: {value: 'Foo'},
        })
        await waitFor(() => expect(getByText(/Create/i)).toBeTruthy())
    })

    it('should restrict the tag creation to basic agent', async () => {
        mockServer.onPost(SEARCH_ENDPOINT).reply(200, {data: []})

        const {getByText, getByPlaceholderText} = render(
            <Provider
                store={mockStore({
                    currentUser: user.setIn(
                        ['role', 'name'],
                        UserRole.BasicAgent
                    ),
                })}
            >
                <TicketTags {...minProps} />
            </Provider>
        )

        fireEvent.click(getByText(/add/))
        fireEvent.change(getByPlaceholderText(/Search tags/), {
            target: {value: 'Foo'},
        })
        await waitFor(() =>
            expect(getByText(/Couldn't find the tag: Foo/i)).toBeTruthy()
        )
    })
})
