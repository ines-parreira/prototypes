import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { ticketInputFieldDefinition } from 'fixtures/customField'
import client from 'models/api/resources'
import history from 'pages/history'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import EditFieldForm from '../EditFieldForm'

const mockStore = configureMockStore([thunk])()
const mockedServer = new MockAdapter(client)
const queryClient = mockQueryClient()

jest.mock('pages/history', () => ({
    ...jest.requireActual<Record<string, unknown>>('pages/history'),
    listen: jest.fn(() => jest.fn()),
}))

describe('<EditFieldForm/>', () => {
    beforeEach(() => {
        mockedServer.reset()
        queryClient.clear()
    })

    it('should render correctly', () => {
        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <DndProvider backend={HTML5Backend}>
                        <EditFieldForm field={ticketInputFieldDefinition} />
                    </DndProvider>
                </Provider>
            </QueryClientProvider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should create custom field if the save button is clicked', async () => {
        mockedServer
            .onPut(`/api/custom-fields/${ticketInputFieldDefinition.id}`)
            .reply(200, ticketInputFieldDefinition)

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <DndProvider backend={HTML5Backend}>
                        <EditFieldForm field={ticketInputFieldDefinition} />
                    </DndProvider>
                </Provider>
            </QueryClientProvider>,
        )

        const nameInput = screen.getByLabelText(/Name/)
        fireEvent.change(nameInput, { target: { value: 'Updated name' } })

        const saveButton = screen.getByText(/Save/)
        saveButton.click()

        await waitFor(() => mockedServer.history.put.length > 0)

        expect(mockedServer.history.put.length).toBe(1)
        expect(mockedServer.history).toMatchSnapshot()

        expect(history.push).toHaveBeenNthCalledWith(
            1,
            '/app/settings/ticket-fields',
        )
    })

    it('should go back to listing if the cancel button is clicked', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <DndProvider backend={HTML5Backend}>
                        <EditFieldForm field={ticketInputFieldDefinition} />
                    </DndProvider>
                </Provider>{' '}
            </QueryClientProvider>,
        )

        const cancelButton = screen.getByText(/Cancel/)
        cancelButton.click()

        expect(history.push).toHaveBeenNthCalledWith(
            1,
            '/app/settings/ticket-fields',
        )
    })
})
