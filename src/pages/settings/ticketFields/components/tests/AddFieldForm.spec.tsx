import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import MockAdapter from 'axios-mock-adapter'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {customField} from 'fixtures/customField'
import client from 'models/api/resources'
import history from 'pages/history'

import AddFieldForm from '../AddFieldForm'

const mockStore = configureMockStore([thunk])()
const mockedServer = new MockAdapter(client)

jest.mock('pages/history')

describe('<AddFieldForm/>', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    it('should render correctly', () => {
        const {container} = render(
            <Provider store={mockStore}>
                <DndProvider backend={HTML5Backend}>
                    <AddFieldForm objectType="Ticket" priority={1} />
                </DndProvider>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should create custom field if the save button is clicked', async () => {
        mockedServer.onPost('/api/custom-fields').reply(200, customField)

        const {findByText, findByLabelText} = render(
            <Provider store={mockStore}>
                <DndProvider backend={HTML5Backend}>
                    <AddFieldForm objectType="Ticket" priority={1} />
                </DndProvider>
            </Provider>
        )

        const nameInput = await findByLabelText(/Name/)
        fireEvent.change(nameInput, {target: {value: 'Test name'}})

        const saveButton = await findByText(/Save Changes/)
        saveButton.click()

        await waitFor(() => mockedServer.history.post.length > 0)

        expect(mockedServer.history.post.length).toBe(1)
        expect(mockedServer.history).toMatchSnapshot()

        expect(history.push).toHaveBeenNthCalledWith(
            1,
            '/app/settings/ticket-fields'
        )
    })

    it('should go back to listing if the cancel button is clicked', async () => {
        const {findByText} = render(
            <Provider store={mockStore}>
                <DndProvider backend={HTML5Backend}>
                    <AddFieldForm objectType="Ticket" priority={1} />
                </DndProvider>
            </Provider>
        )

        const cancelButton = await findByText(/Cancel/)
        cancelButton.click()

        expect(history.push).toHaveBeenNthCalledWith(
            1,
            '/app/settings/ticket-fields'
        )
    })
})
