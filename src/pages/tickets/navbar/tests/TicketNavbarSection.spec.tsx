import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { section } from 'fixtures/section'
import { user } from 'fixtures/users'
import { view } from 'fixtures/views'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'
import { DndProvider } from 'utils/wrappers/DndProvider'

import { TicketNavbarSectionContainer } from '../TicketNavbarSection'
import TicketNavbarView from '../TicketNavbarView'

jest.mock(
    '../TicketNavbarView',
    () =>
        ({ view }: ComponentProps<typeof TicketNavbarView>) => {
            return <div data-testid="TicketNavbarView">{view.name}</div>
        },
)

const minProps = {
    currentUser: fromJS(user),
    notify: jest.fn(),
    onSectionDeleteClick: jest.fn(),
    onSectionRenameClick: jest.fn(),
    sectionElement: {
        data: section,
        type: TicketNavbarElementType.Section,
        children: [view],
    },
    viewUpdated: jest.fn(),
    views: {
        [view.id]: view,
    },
    viewsCount: {
        7: 0,
    },
} as unknown as ComponentProps<typeof TicketNavbarSectionContainer>

describe('<TicketNavbarSection/>', () => {
    it.each([
        ['views expanded', { isExpanded: true }],
        ['views collapsed', { isExpanded: false }],
    ])('should render a section (%s)', (_, props) => {
        const { container } = render(
            <DndProvider backend={HTML5Backend}>
                <TicketNavbarSectionContainer {...minProps} {...props} />
            </DndProvider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the candu link for AI Agent', () => {
        const section = {
            ...minProps.sectionElement.data,
            decoration: {
                emoji: '✨',
            },
            name: 'AI Agent',
        }

        const { container } = render(
            <DndProvider backend={HTML5Backend}>
                <TicketNavbarSectionContainer
                    {...minProps}
                    sectionElement={{
                        ...minProps.sectionElement,
                        data: section,
                    }}
                />
            </DndProvider>,
        )

        const element = container.querySelector('[data-candu-id]')

        // Assert that the element exists and has the correct value
        expect(element).toBeInTheDocument()
        expect(element).toHaveAttribute(
            'data-candu-id',
            'ticket-navbar-ai-agent-section-link-ai-agent',
        )
    })
})
