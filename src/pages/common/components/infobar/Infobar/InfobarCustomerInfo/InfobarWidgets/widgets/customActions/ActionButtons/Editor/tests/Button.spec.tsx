import React from 'react'
import {fromJS} from 'immutable'
import {render, fireEvent, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {actionFixture} from 'fixtures/infobarCustomActions'
import Button from '../Button'

const mockStore = configureMockStore([thunk])

describe('<Button/>', () => {
    const action = actionFixture()
    const props = {
        onRemove: jest.fn(),
        onOpenForm: jest.fn(),
        button: {label: '{{label}}', action},
        source: fromJS({label: 'should render'}),
        index: 2,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render with correct label', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Button {...props} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call the right callbacks with correct index when clicking on buttons', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <Button {...props} />
            </Provider>
        )

        fireEvent.click(screen.getByText('edit'))
        expect(props.onOpenForm).toHaveBeenCalledWith(props.index)
        fireEvent.click(screen.getByText('delete'))
        expect(props.onRemove).toHaveBeenCalledWith(props.index)
    })
})
