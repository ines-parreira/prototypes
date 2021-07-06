import React from 'react'
import {render} from '@testing-library/react'

import CreateFirst from '../CreateFirst'
describe('<CreateFirst/>', () => {
    const mockedOnClick = jest.fn()

    const props = {
        title: 'Title',
        description: 'Description',
        buttonText: 'Button',
        onClick: mockedOnClick,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display the component correctly', () => {
        const {container} = render(<CreateFirst {...props} />)
        expect(container).toMatchSnapshot()
    })
})
