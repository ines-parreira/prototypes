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

    it('should render in small size', () => {
        const component = shallow(
            <HeaderCell className="foo" size="small">
                Foo
            </HeaderCell>
        )

        expect(component).toMatchSnapshot()
    })

    it('should render in smallest size', () => {
        const component = shallow(
            <HeaderCell className="foo" size="smallest">
                Foo
            </HeaderCell>
        )

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
