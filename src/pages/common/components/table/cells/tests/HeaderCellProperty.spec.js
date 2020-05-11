//@flow
import {shallow} from 'enzyme'
import React from 'react'

import {ORDER_DIRECTION} from '../../../../../../models/api'
import HeaderCell from '../HeaderCell'
import HeaderCellProperty from '../HeaderCellProperty'

describe('<HeaderCellProperty/>', () => {
    const minProps = {
        title: 'foo',
    }

    it('should render', () => {
        const component = shallow(
            <HeaderCellProperty
                {...minProps}
                className="foo"
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render children', () => {
        const component = shallow(
            <HeaderCellProperty {...minProps}>
                Bar
            </HeaderCellProperty>
        )

        expect(component).toMatchSnapshot()
    })

    it('should render sorted property', () => {
        const component = shallow(
            <HeaderCellProperty
                {...minProps}
                direction={ORDER_DIRECTION.ASC}
                isOrderedBy
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should call onClick when clicked', () => {
        const mockOnClick = jest.fn()
        const component = shallow(
            <HeaderCellProperty
                {...minProps}
                onClick={mockOnClick}
            />
        )

        component.find(HeaderCell).simulate('click')
        expect(mockOnClick).toHaveBeenNthCalledWith(1)
    })
})
