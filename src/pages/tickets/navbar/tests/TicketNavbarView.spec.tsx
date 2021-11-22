import {render} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'

import {MAX_TICKET_COUNT_PER_VIEW} from '../../../../config/views'
import {view} from '../../../../fixtures/views'
import ViewCount from '../../../common/components/ViewCount/ViewCount'
import ViewName from '../../../common/components/ViewName/ViewName'
import {TicketNavbarViewContainer} from '../TicketNavbarView'

jest.mock(
    '../../../common/components/ViewName/ViewName',
    () =>
        ({view}: ComponentProps<typeof ViewName>) => {
            return <div data-testid="ViewName">{view.get('name')}</div>
        }
)

jest.mock(
    '../../../common/components/ViewCount/ViewCount',
    () =>
        ({view}: ComponentProps<typeof ViewCount>) => {
            return <div data-testid="ViewCount">{view.get('name')}</div>
        }
)

describe('<TicketNavbarView/>', () => {
    const minProps = {
        view,
        activeViewId: 4,
        viewsCount: {
            4: 100,
            7: MAX_TICKET_COUNT_PER_VIEW,
        },
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
