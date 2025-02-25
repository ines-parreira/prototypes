import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { OBJECT_TYPES } from 'custom-fields/constants'
import { ticketInputFieldDefinition } from 'fixtures/customField'
import client from 'models/api/resources'
import history from 'pages/history'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import AddFieldForm from '../AddFieldForm'

const mockStore = configureMockStore([thunk])()
const mockedServer = new MockAdapter(client)
const queryClient = mockQueryClient()

jest.mock('pages/history', () => ({
    ...jest.requireActual<Record<string, unknown>>('pages/history'),
    listen: jest.fn(() => jest.fn()),
}))

describe('<AddFieldForm/>', () => {
    beforeEach(() => {
        mockedServer.reset()
        queryClient.clear()
    })

    it('should render correctly', () => {
        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <DndProvider backend={HTML5Backend}>
                        <AddFieldForm objectType={OBJECT_TYPES.TICKET} />
                    </DndProvider>
                </Provider>
            </QueryClientProvider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should create custom field if the save button is clicked', async () => {
        mockedServer
            .onPost('/api/custom-fields')
            .reply(200, ticketInputFieldDefinition)

        const { findByText, findByLabelText } = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <DndProvider backend={HTML5Backend}>
                        <AddFieldForm objectType={OBJECT_TYPES.TICKET} />
                    </DndProvider>
                </Provider>
            </QueryClientProvider>,
        )

        const nameInput = await findByLabelText(/Name/)
        fireEvent.change(nameInput, { target: { value: 'Test name' } })

        const saveButton = await findByText(/Create field/)
        saveButton.click()

        await waitFor(() => mockedServer.history.post.length > 0)

        expect(mockedServer.history.post.length).toBe(1)
        expect(mockedServer.history).toMatchSnapshot()

        expect(history.push).toHaveBeenNthCalledWith(
            1,
            '/app/settings/ticket-fields',
        )
    })

    it('should go back to listing if the cancel button is clicked', async () => {
        const { findByText } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <DndProvider backend={HTML5Backend}>
                        <AddFieldForm objectType={OBJECT_TYPES.TICKET} />
                    </DndProvider>
                </Provider>
            </QueryClientProvider>,
        )

        const cancelButton = await findByText(/Cancel/)
        cancelButton.click()

        expect(history.push).toHaveBeenNthCalledWith(
            1,
            '/app/settings/ticket-fields',
        )
    })
})
