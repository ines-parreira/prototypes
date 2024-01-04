import React from 'react'
import {render, screen} from '@testing-library/react'
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
        const {container} = render(
            <DndProvider backend={HTML5Backend}>
                <NavbarBlock {...minProps}>foobar</NavbarBlock>
            </DndProvider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should toggle the menu on clicking the dropdown toggle', () => {
        render(
            <DndProvider backend={HTML5Backend}>
                <NavbarBlock {...minProps}>foobar</NavbarBlock>
            </DndProvider>
        )

        screen.getByRole('button').click()

        expect(screen.getByRole('menu').getAttribute('aria-hidden')).toBe(
            'false'
        )
    })

    it('should render an icon', () => {
        render(
            <DndProvider backend={HTML5Backend}>
                <NavbarBlock icon="adjust" {...minProps}>
                    foobar
                </NavbarBlock>
            </DndProvider>
        )

        expect(screen.getByText('adjust'))
    })
})
