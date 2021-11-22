import {render} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {fromJS} from 'immutable'

import {section} from '../../../../fixtures/section'
import {user} from '../../../../fixtures/users'
import {view} from '../../../../fixtures/views'
import {TicketNavbarSectionContainer} from '../TicketNavbarSection'
import TicketNavbarView from '../TicketNavbarView'
import {TicketNavbarElementType} from '../TicketNavbar'

jest.mock(
    '../TicketNavbarView',
    () =>
        ({view}: ComponentProps<typeof TicketNavbarView>) => {
            return <div data-testid="TicketNavbarView">{view.name}</div>
        }
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
} as unknown as ComponentProps<typeof TicketNavbarSectionContainer>

describe('<TicketNavbarSection/>', () => {
    it.each([
        ['views expanded', {isExpanded: true}],
        ['views collapsed', {isExpanded: false}],
    ])('should render a section (%s)', (_, props) => {
        const {container} = render(
            <DndProvider backend={HTML5Backend}>
                <TicketNavbarSectionContainer {...minProps} {...props} />
            </DndProvider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
