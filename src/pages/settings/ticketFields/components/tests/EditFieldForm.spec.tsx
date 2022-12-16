import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {customField} from 'fixtures/customField'
import client from 'models/api/resources'
import history from 'pages/history'

import EditFieldForm from '../EditFieldForm'

const mockStore = configureMockStore([thunk])()
const mockedServer = new MockAdapter(client)

jest.mock('pages/history')

describe('<EditFieldForm/>', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    it('should render correctly', () => {
        const {container} = render(
            <Provider store={mockStore}>
                <DndProvider backend={HTML5Backend}>
                    <EditFieldForm field={customField} />
                </DndProvider>
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should create custom field if the save button is clicked', async () => {
        mockedServer
            .onPut(`/api/custom-fields/${customField.id}`)
            .reply(200, customField)

        const {findByText, findByLabelText} = render(
            <Provider store={mockStore}>
                <DndProvider backend={HTML5Backend}>
                    <EditFieldForm field={customField} />
                </DndProvider>
            </Provider>
        )

        const nameInput = await findByLabelText(/Name/)
        fireEvent.change(nameInput, {target: {value: 'Updated name'}})

        const saveButton = await findByText(/Save Changes/)
        saveButton.click()

        await waitFor(() => mockedServer.history.put.length > 0)

        expect(mockedServer.history.put.length).toBe(1)
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
                    <EditFieldForm field={customField} />
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
