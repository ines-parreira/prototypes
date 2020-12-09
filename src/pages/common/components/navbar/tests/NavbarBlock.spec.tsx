import {mount, shallow} from 'enzyme'
import React from 'react'
import {DropdownToggle} from 'reactstrap'

import NavbarBlock from '../NavbarBlock'

describe('<NavbarBlock/>', () => {
    const minProps = {
        actions: [
            {
                label: 'foo',
                onClick: jest.fn(),
            },
        ],
        title: 'Foo',
    }

    it('should render', () => {
        const component = shallow(
            <NavbarBlock {...minProps}>foobar</NavbarBlock>
        )

        expect(component).toMatchSnapshot()
    })

    it('should toggle the menu on clicking the dropdown toggle', () => {
        const component = mount(<NavbarBlock {...minProps}>foobar</NavbarBlock>)

        component.find(DropdownToggle).simulate('click')
        expect(component).toMatchSnapshot()
    })
})
