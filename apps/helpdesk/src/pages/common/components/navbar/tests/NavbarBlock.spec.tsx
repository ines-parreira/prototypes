import { userEvent } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { HTML5Backend } from 'react-dnd-html5-backend'

import type { ViewCategoryNavbar } from 'models/view/types'
import { ViewVisibility } from 'models/view/types'
import { DndProvider } from 'utils/wrappers/DndProvider'

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
        const { container } = render(
            <DndProvider backend={HTML5Backend}>
                <NavbarBlock {...minProps}>foobar</NavbarBlock>
            </DndProvider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should toggle the menu on clicking the dropdown toggle', async () => {
        render(
            <DndProvider backend={HTML5Backend}>
                <NavbarBlock {...minProps}>foobar</NavbarBlock>
            </DndProvider>,
        )

        await userEvent.click(screen.getByRole('button'))

        await waitFor(() => {
            expect(screen.getByRole('menu').getAttribute('aria-hidden')).toBe(
                'false',
            )
        })
    })

    it('should render an icon', () => {
        render(
            <DndProvider backend={HTML5Backend}>
                <NavbarBlock icon="adjust" {...minProps}>
                    foobar
                </NavbarBlock>
            </DndProvider>,
        )

        expect(screen.getByText('adjust'))
    })
})
