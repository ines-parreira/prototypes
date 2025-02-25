import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'

import { MAX_TICKET_COUNT_PER_VIEW } from 'config/views'
import { user as currentUserFixture } from 'fixtures/users'
import { view } from 'fixtures/views'
import useViewId from 'hooks/useViewId'
import { View } from 'models/view/types'
import ViewCount from 'pages/common/components/ViewCount/ViewCount'
import ViewName from 'pages/common/components/ViewName/ViewName'
import { mockStore } from 'utils/testing'

import TicketNavbarView from '../TicketNavbarView'

jest.mock('hooks/useViewId', () => jest.fn())
const useViewIdMock = useViewId as jest.Mock

jest.mock(
    'pages/common/components/ViewName/ViewName',
    () =>
        ({ viewName }: ComponentProps<typeof ViewName>) => {
            return <div data-testid="ViewName">{viewName}</div>
        },
)

jest.mock(
    'pages/common/components/ViewCount/ViewCount',
    () =>
        ({ viewCount }: ComponentProps<typeof ViewCount>) => {
            return <div data-testid="ViewCount">{viewCount}</div>
        },
)

jest.mock('../TicketNavbarViewLink', () => ({ view }: { view: View }) => (
    <span>{view.name}</span>
))

describe('<TicketNavbarView/>', () => {
    const minProps = {
        view,
        viewCount: MAX_TICKET_COUNT_PER_VIEW,
    }

    const store = {
        entities: {},
        ui: { views: { activeViewId: 4 } },
        currentUser: fromJS(currentUserFixture),
    }

    beforeEach(() => {
        useViewIdMock.mockReturnValue(123)
    })

    it('should render', () => {
        const { container } = render(
            <DndProvider backend={HTML5Backend}>
                <Provider store={mockStore(store as any)}>
                    <TicketNavbarView {...minProps} />
                </Provider>
            </DndProvider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
