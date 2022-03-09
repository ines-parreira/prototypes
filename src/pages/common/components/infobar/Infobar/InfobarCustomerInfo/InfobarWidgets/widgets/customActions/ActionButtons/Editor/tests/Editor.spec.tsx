import React from 'react'
import {render, fireEvent, screen, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {actionFixture} from '../../../../../../../../../../../../fixtures/infobarCustomActions'
import {Editor} from '../Editor'

const mockStore = configureMockStore([thunk])

describe('<Editor/>', () => {
    const actionMock = jest.fn()
    const buildActionMock =
        (actionName: string) =>
        (...args: any) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            actionMock(actionName, ...args)
    const action = actionFixture()

    const props = {
        buttons: [
            {label: 'I am in snapshots', action},
            {label: 'I am in snapshots too', action},
        ],
        templatePath: 'some.template',
        templateAbsolutePath: ['some', 'absolute', 'template'],
        source: fromJS({}),
        startWidgetEdition: buildActionMock('startWidgetEdition'),
        updateCustomActions: buildActionMock('updateCustomActions'),
        removeEditedWidget: buildActionMock('removeEditedWidget'),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render with buttons and "add button" button', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Editor {...props} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })
    it('should open modal when clicking on "add button" button', async () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Editor {...props} />
            </Provider>
        )
        fireEvent.click(screen.getByRole('button', {name: 'add Add Button'}))
        await waitFor(() => {
            expect(screen.queryByRole('button', {name: 'Save'})).toBeTruthy()
        })
    })
    it('should close the modal when clicking "Cancel"', async () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Editor {...props} />
            </Provider>
        )
        fireEvent.click(screen.getByRole('button', {name: 'add Add Button'}))
        await screen.findByRole('button', {name: 'Save'})
        fireEvent.click(screen.getByRole('button', {name: 'Cancel'}))
        await waitFor(() => {
            expect(screen.queryByRole('button', {name: 'Save'})).toBeFalsy()
        })
    })
    it('should call the correct callbacks when removing a button', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Editor {...props} />
            </Provider>
        )
        fireEvent.click(screen.getAllByText('close')[1])
        expect(actionMock.mock.calls).toMatchSnapshot()
    })
    it('should call the correct callbacks when submitting a new button', async () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Editor {...props} />
            </Provider>
        )
        fireEvent.click(screen.getByRole('button', {name: 'add Add Button'}))
        await screen.findByRole('button', {name: 'Save'})
        fireEvent.change(screen.getByLabelText('Button title'), {
            target: {value: 'ok'},
        })
        fireEvent.click(screen.getByRole('button', {name: 'Save'}))
        expect(actionMock.mock.calls).toMatchSnapshot()
    })
    it('should call the correct callbacks when submitting a edited button', async () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Editor {...props} />
            </Provider>
        )
        fireEvent.click(screen.getAllByText('settings')[1])
        await screen.findByRole('button', {name: 'Save'})
        fireEvent.click(screen.getByRole('button', {name: 'Save'}))
        expect(actionMock.mock.calls).toMatchSnapshot()
    })
})
