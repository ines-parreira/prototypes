import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {List, Map, fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'

import {UserRole} from 'config/types/user'
import {agents} from 'fixtures/agents'
import client from 'models/api/resources'
import {SEARCH_ENDPOINT} from 'models/search/resources'

import TagSearchDropdown from '../TagSearchDropdown'

const mockStore = configureMockStore([thunk])

describe('<TagSearchDropdown />', () => {
    let mockServer: MockAdapter

    const user = fromJS(fromJS(agents[0])) as Map<any, any>
    const store = mockStore({
        currentUser: user,
    })

    beforeEach(() => {
        mockServer = new MockAdapter(client)
    })

    const props = {
        addTag: jest.fn(),
        shouldBindKeys: false,
        ticketTags: fromJS([
            {name: 'refund'},
            {name: 'angry'},
            {name: 'return'},
            {name: 'customer'},
        ]) as List<Map<any, any>>,
    }

    it('should display tags not already assigned to ticket', async () => {
        mockServer.onPost(SEARCH_ENDPOINT).reply(200, {
            data: [
                {id: 1, name: 'exchange'},
                {id: 1, name: 'refund'},
                {id: 1, name: 'return'},
                {id: 1, name: 'product'},
            ],
        })

        const {getByText, queryByText} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
            </Provider>
        )
        fireEvent.click(getByText(/Add tags/))

        await waitFor(() => {
            expect(queryByText('product')).toBeInTheDocument()
            expect(queryByText('exchange')).toBeInTheDocument()
            expect(queryByText('refund')).not.toBeInTheDocument()
            expect(queryByText('return')).not.toBeInTheDocument()
        })
    })

    it('should allow the tag creation to lead agent', async () => {
        mockServer
            .onPost(SEARCH_ENDPOINT)
            .reply(200, {data: [{id: 1, name: 'exchange'}]})
        const {getByText, getByPlaceholderText} = render(
            <Provider store={store}>
                <TagSearchDropdown {...props} />
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
                <TagSearchDropdown {...props} />
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
