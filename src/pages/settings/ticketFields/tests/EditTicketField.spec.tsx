import React from 'react'
import {Provider} from 'react-redux'
import MockAdapter from 'axios-mock-adapter'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {QueryClientProvider} from '@tanstack/react-query'

import {ticketInputFieldDefinition} from 'fixtures/customField'
import client from 'models/api/resources'
import {renderWithRouter} from 'utils/testing'

import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import EditTicketField from '../EditTicketField'

const mockStore = configureMockStore([thunk])()
const mockedServer = new MockAdapter(client)
const queryClient = createTestQueryClient()

describe('<EditTicketField/>', () => {
    beforeEach(() => {
        mockedServer.reset()
        queryClient.clear()
    })

    it('should render', async () => {
        mockedServer
            .onGet('/api/custom-fields/123')
            .reply(200, ticketInputFieldDefinition)

        const {container, findByText} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <EditTicketField />
                </Provider>
            </QueryClientProvider>,

            {
                path: '/ticket-fields/:id/edit',
                route: '/ticket-fields/123/edit',
            }
        )
        expect(container.firstChild).toMatchSnapshot()

        await findByText(ticketInputFieldDefinition.label)
        expect(container.firstChild).toMatchSnapshot()
    })
})
