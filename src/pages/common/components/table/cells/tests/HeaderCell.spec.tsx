import {shallow} from 'enzyme'
import React from 'react'

import HeaderCell from '../HeaderCell'

describe('<HeaderCell/>', () => {
    const mockOnClick = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render', () => {
        const component = shallow(<HeaderCell className="foo">Foo</HeaderCell>)

        expect(component).toMatchSnapshot()
    })

    it('should call onClick when clicked', () => {
        const component = shallow(
            <HeaderCell onClick={mockOnClick}>Foo</HeaderCell>
        )

        component.simulate('click')
        expect(mockOnClick).toHaveBeenNthCalledWith(1)
    })
})
