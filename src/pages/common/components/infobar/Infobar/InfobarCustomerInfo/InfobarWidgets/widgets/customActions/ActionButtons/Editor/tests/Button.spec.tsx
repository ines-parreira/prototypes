import React from 'react'
import {fromJS} from 'immutable'
import {render, fireEvent, screen} from '@testing-library/react'

import {HttpMethod} from '../../../../../../../../../../../../models/api/types'
import Button from '../Button'

describe('<Button/>', () => {
    const action = {
        method: HttpMethod.Get,
        url: '',
        headers: [],
        params: [],
        body: {},
    }

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
        const {container} = render(<Button {...props} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call the right callbacks with correct index when clicking on buttons', () => {
        render(<Button {...props} />)

        fireEvent.click(screen.getByText('settings'))
        expect(props.onOpenForm).toHaveBeenCalledWith(props.index)
        fireEvent.click(screen.getByText('close'))
        expect(props.onRemove).toHaveBeenCalledWith(props.index)
    })
})
