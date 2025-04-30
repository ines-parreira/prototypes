import { render, screen } from '@testing-library/react'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { Navigation } from 'components/Navigation/Navigation'
import { ViewCategoryNavbar, ViewVisibility } from 'models/view/types'
import { DndProvider } from 'utils/wrappers/DndProvider'

import { TicketNavbarBlockV2 } from '../v2/TicketNavbarBlockV2'

describe('<TicketNavbarBlockV2/>', () => {
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

    it('should toggle the menu on clicking the dropdown toggle', () => {
        render(
            <DndProvider backend={HTML5Backend}>
                <Navigation.Root>
                    <TicketNavbarBlockV2 {...minProps}>
                        foobar
                    </TicketNavbarBlockV2>
                </Navigation.Root>
            </DndProvider>,
        )

        screen.getByRole('button', { name: 'add' }).click()

        expect(screen.getByRole('menu').getAttribute('aria-hidden')).toBe(
            'false',
        )
    })

    it('should render an icon', () => {
        render(
            <DndProvider backend={HTML5Backend}>
                <Navigation.Root>
                    <TicketNavbarBlockV2 icon="adjust" {...minProps}>
                        foobar
                    </TicketNavbarBlockV2>
                </Navigation.Root>
            </DndProvider>,
        )

        expect(screen.getByText('adjust'))
    })
})
