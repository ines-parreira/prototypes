import {shallow} from 'enzyme'
import React from 'react'

import TableBodyRow from '../TableBodyRow'

describe('<TableBodyRow/>', () => {
    const mockOnClick = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render', () => {
        const component = shallow(
            <TableBodyRow className="foo">Foo</TableBodyRow>
        )

        expect(component).toMatchSnapshot()
    })

    it('should call onClick when clicked', () => {
        const component = shallow(
            <TableBodyRow onClick={mockOnClick}>Foo</TableBodyRow>
        )

        expect(component).toMatchSnapshot()
        component.simulate('click')
        expect(mockOnClick).toHaveBeenNthCalledWith(1)
    })
})
