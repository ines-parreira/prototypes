import {render} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {fromJS} from 'immutable'

import {MAX_TICKET_COUNT_PER_VIEW} from '../../../../config/views'
import {view} from '../../../../fixtures/views'
import ViewCount from '../../../common/components/ViewCount/ViewCount'
import ViewName from '../../../common/components/ViewName/ViewName'
import {TicketNavbarViewContainer} from '../TicketNavbarView'
import {user as currentUserFixture} from '../../../../fixtures/users'

jest.mock(
    '../../../common/components/ViewName/ViewName',
    () =>
        ({viewName}: ComponentProps<typeof ViewName>) => {
            return <div data-testid="ViewName">{viewName}</div>
        }
)

jest.mock(
    '../../../common/components/ViewCount/ViewCount',
    () =>
        ({viewCount}: ComponentProps<typeof ViewCount>) => {
            return <div data-testid="ViewCount">{viewCount}</div>
        }
)

describe('<TicketNavbarView/>', () => {
    const minProps = {
        view,
        activeViewId: 4,
        viewCount: MAX_TICKET_COUNT_PER_VIEW,
        currentUser: fromJS(currentUserFixture),
    } as unknown as ComponentProps<typeof TicketNavbarViewContainer>

    it('should render', () => {
        const {container} = render(
            <DndProvider backend={HTML5Backend}>
                <TicketNavbarViewContainer {...minProps} />
            </DndProvider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
