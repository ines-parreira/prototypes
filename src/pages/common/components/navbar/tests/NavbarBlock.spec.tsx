import {mount, shallow} from 'enzyme'
import React from 'react'
import {DropdownToggle} from 'reactstrap'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'

import {ViewCategoryNavbar, ViewVisibility} from 'models/view/types'

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
        value: ViewVisibility.Public as ViewCategoryNavbar,
    }

    it('should render', () => {
        const component = shallow(
            <DndProvider backend={HTML5Backend}>
                <NavbarBlock {...minProps}>foobar</NavbarBlock>
            </DndProvider>
        )

        expect(component).toMatchSnapshot()
    })

    it('should toggle the menu on clicking the dropdown toggle', () => {
        const component = mount(
            <DndProvider backend={HTML5Backend}>
                <NavbarBlock {...minProps}>foobar</NavbarBlock>
            </DndProvider>
        )

        component.find(DropdownToggle).simulate('click')
        expect(component).toMatchSnapshot()
    })

    it('should render an icon', () => {
        const component = shallow(
            <DndProvider backend={HTML5Backend}>
                <NavbarBlock icon="adjust" {...minProps}>
                    foobar
                </NavbarBlock>
            </DndProvider>
        )

        expect(component).toMatchSnapshot()
    })
})
