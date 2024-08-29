import React from 'react'
import {Provider} from 'react-redux'
import MockAdapter from 'axios-mock-adapter'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {QueryClientProvider} from '@tanstack/react-query'

import {screen} from '@testing-library/react'
import {
    aiManagedTicketInputFieldDefinition,
    managedProductTicketInputFieldDefinition,
    managedTicketInputFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import client from 'models/api/resources'
import {renderWithRouter} from 'utils/testing'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import EditTicketField from 'pages/settings/ticketFields/EditTicketField'

const mockStore = configureMockStore([thunk])()
const mockedServer = new MockAdapter(client)
const queryClient = mockQueryClient()

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

    it('should render AI Agent managed field', async () => {
        mockedServer
            .onGet('/api/custom-fields/123')
            .reply(200, aiManagedTicketInputFieldDefinition)

        const {findByText} = renderWithRouter(
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
        expect(
            await findByText(
                /This field is managed by Gorgias AI Agent and cannot be edited./im
            )
        )
    })

    it('should render contact_reason managed field', async () => {
        mockedServer
            .onGet('/api/custom-fields/123')
            .reply(200, managedTicketInputFieldDefinition)

        const {getByText, findByText} = renderWithRouter(
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
        expect(
            await findByText(
                /This field is powered by AI and can automatically be filled by Gorgias, /im
            )
        )
        expect(getByText('see this article').getAttribute('href')).toEqual(
            'https://docs.gorgias.com/en-US/273001-a7d86899ce5f4aef81ebbaa301d78b58'
        )
    })

    it('should render product managed field', () => {
        mockedServer
            .onGet('/api/custom-fields/123')
            .reply(200, managedProductTicketInputFieldDefinition)

        renderWithRouter(
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

        expect(
            screen.queryByText(
                /This field is powered by AI and can automatically be filled by Gorgias, /im
            )
        ).not.toBeInTheDocument()
    })

    it('should render not managed field', () => {
        mockedServer
            .onGet('/api/custom-fields/123')
            .reply(200, ticketInputFieldDefinition)

        renderWithRouter(
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
        expect(screen.queryByText('For more details,')).not.toBeInTheDocument()
    })
})
