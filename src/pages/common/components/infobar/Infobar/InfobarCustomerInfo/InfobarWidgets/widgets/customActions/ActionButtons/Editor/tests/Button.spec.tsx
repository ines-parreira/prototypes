import React from 'react'
import {fromJS} from 'immutable'
import {render, fireEvent, screen} from '@testing-library/react'

import EditableButton from '../Button'

describe('<EditableButton/>', () => {
    const props = {
        onRemove: jest.fn(),
        onOpenForm: jest.fn(),
        button: {label: '{{label}}'},
        source: fromJS({label: 'should render'}),
        index: 2,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render with correct label', () => {
        const {container} = render(<EditableButton {...props} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call the right callbacks with correct index when clicking on buttons', () => {
        render(<EditableButton {...props} />)

        fireEvent.click(screen.getByText('settings'))
        expect(props.onOpenForm).toHaveBeenCalledWith(props.index)
        fireEvent.click(screen.getByText('close'))
        expect(props.onRemove).toHaveBeenCalledWith(props.index)
    })
})
