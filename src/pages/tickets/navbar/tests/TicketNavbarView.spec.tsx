import {render} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'

import {MAX_TICKET_COUNT_PER_VIEW} from 'config/views'
import {user as currentUserFixture} from 'fixtures/users'
import {view} from 'fixtures/views'
import ViewCount from 'pages/common/components/ViewCount/ViewCount'
import ViewName from 'pages/common/components/ViewName/ViewName'
import {mockStore} from 'utils/testing'

import TicketNavbarView from '../TicketNavbarView'

jest.mock(
    'pages/common/components/ViewName/ViewName',
    () =>
        ({viewName}: ComponentProps<typeof ViewName>) => {
            return <div data-testid="ViewName">{viewName}</div>
        }
)

jest.mock(
    'pages/common/components/ViewCount/ViewCount',
    () =>
        ({viewCount}: ComponentProps<typeof ViewCount>) => {
            return <div data-testid="ViewCount">{viewCount}</div>
        }
)

describe('<TicketNavbarView/>', () => {
    const minProps = {
        view,
        viewCount: MAX_TICKET_COUNT_PER_VIEW,
    }

    const store = {
        entities: {},
        ui: {views: {activeViewId: 4}},
        currentUser: fromJS(currentUserFixture),
    }

    it('should render', () => {
        const {container} = render(
            <DndProvider backend={HTML5Backend}>
                <Provider store={mockStore(store as any)}>
                    <TicketNavbarView {...minProps} />
                </Provider>
            </DndProvider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
