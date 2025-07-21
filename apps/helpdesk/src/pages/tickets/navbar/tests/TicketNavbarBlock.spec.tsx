import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { Navigation } from 'components/Navigation/Navigation'
import { View, ViewCategoryNavbar, ViewVisibility } from 'models/view/types'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'
import { DndProvider } from 'utils/wrappers/DndProvider'

import { TicketNavbarBlock } from '../TicketNavbarBlock'
import { TicketNavbarElement } from '../TicketNavbarContent'

describe('<TicketNavbarBlock/>', () => {
    const minProps = {
        actions: [
            {
                label: 'foo',
                onClick: jest.fn(),
            },
        ],
        title: 'Foo',
        elements: [] as TicketNavbarElement[],
        value: ViewVisibility.Public as ViewCategoryNavbar,
    }

    it('should toggle the menu on clicking the dropdown toggle', async () => {
        render(
            <DndProvider backend={HTML5Backend}>
                <Navigation.Root>
                    <TicketNavbarBlock {...minProps}>foobar</TicketNavbarBlock>
                </Navigation.Root>
            </DndProvider>,
        )

        await userEvent.click(screen.getByRole('button', { name: 'add' }))

        expect(screen.getByRole('menu').getAttribute('aria-hidden')).toBe(
            'false',
        )
    })

    it('should render an icon', () => {
        render(
            <DndProvider backend={HTML5Backend}>
                <Navigation.Root>
                    <TicketNavbarBlock icon="adjust" {...minProps}>
                        foobar
                    </TicketNavbarBlock>
                </Navigation.Root>
            </DndProvider>,
        )

        expect(screen.getByText('adjust'))
    })

    it('should not render section content when elements array is empty', async () => {
        const { getAllByRole } = render(
            <DndProvider backend={HTML5Backend}>
                <Navigation.Root>
                    <TicketNavbarBlock {...minProps}>foobar</TicketNavbarBlock>
                </Navigation.Root>
            </DndProvider>,
        )

        await userEvent.click(getAllByRole('button')[0])

        expect(screen.queryByText('foobar')).not.toBeInTheDocument()
    })

    it('should render section content when elements array has items', async () => {
        const propsWithElements = {
            ...minProps,
            elements: [
                {
                    type: TicketNavbarElementType.View,
                    data: {
                        id: 1,
                        name: 'Test View',
                        visibility: ViewVisibility.Public,
                    } as View,
                },
            ] as TicketNavbarElement[],
        }

        const { getAllByRole } = render(
            <DndProvider backend={HTML5Backend}>
                <Navigation.Root>
                    <TicketNavbarBlock {...propsWithElements}>
                        foobar
                    </TicketNavbarBlock>
                </Navigation.Root>
            </DndProvider>,
        )

        await userEvent.click(getAllByRole('button')[0])

        expect(screen.getByText('foobar')).toBeInTheDocument()
    })
})
