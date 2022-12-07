import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'

import {fromJS} from 'immutable'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import AddVideo from '../AddVideo'

const minProps = {
    getEditorState: jest.fn(),
    setEditorState: jest.fn(),
}

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('<AddVideo/>', () => {
    let store = mockStore({})
    beforeEach(() => {
        jest.clearAllMocks()
        store = mockStore({ticket: fromJS({id: 1})})
    })

    it('should not render when the popover is closed', () => {
        const {container} = render(
            <Provider store={store}>
                <AddVideo {...minProps} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should render the popover when the button is clicked', () => {
        const {container} = render(
            <Provider store={store}>
                <AddVideo {...minProps} />
            </Provider>
        )
        fireEvent.click(screen.getByText(/video/i))
        expect(container).toMatchSnapshot()
    })

    it('should enable the submit button only when providing a valid url', () => {
        render(
            <Provider store={store}>
                <AddVideo {...minProps} />
            </Provider>
        )
        fireEvent.click(screen.getByText(/video/i))

        expect(
            screen.getByText('Insert Video').getAttribute('disabled')
        ).toBeDefined()

        fireEvent.change(screen.getByPlaceholderText('External video URL'), {
            target: {value: 'toto'},
        })
        expect(
            screen.getByText('Insert Video').getAttribute('disabled')
        ).toBeDefined()

        fireEvent.change(screen.getByPlaceholderText('External video URL'), {
            target: {value: 'https://www.youtube.com/watch?v=4sLFpe-xbhk'},
        })
        expect(
            screen.getByText('Insert Video').getAttribute('disabled')
        ).toBeNull()
    })
})
