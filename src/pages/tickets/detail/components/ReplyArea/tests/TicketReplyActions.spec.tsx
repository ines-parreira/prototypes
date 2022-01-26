import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'

import {ACTION_TEMPLATES} from '../../../../../../config'
import {MacroActionName} from '../../../../../../models/macroAction/types'
import {RootState} from '../../../../../../state/types'
import {integrationsState} from '../../../../../../fixtures/integrations'
import TicketReplyActions from '../TicketReplyActions'

const mockStore = configureMockStore([thunk])

jest.mock('draft-js/lib/generateRandomKey', () => () => '888')

describe('<TicketReplyActions/>', () => {
    const defaultState: Partial<RootState> = {
        integrations: fromJS(integrationsState),
    }

    const minProps: ComponentProps<typeof TicketReplyActions> = {
        ticketId: 1,
        appliedMacro: fromJS({
            actions: [
                ACTION_TEMPLATES.find(
                    (action) => action.name === MacroActionName.AddInternalNote
                ),
            ],
        }),
        onDelete: jest.fn(),
        onUpdate: jest.fn(),
    }

    it('should render the ticket reply macro actions collapsed', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketReplyActions {...minProps} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the ticket reply macro actions', async () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketReplyActions {...minProps} />
            </Provider>
        )
        const header = screen.getByText('Actions performed on send')
        const collapsingElement = container.firstChild?.lastChild as HTMLElement

        fireEvent.click(header)
        await waitFor(() => {
            expect(collapsingElement.className).toBe('collapse show')
        })
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call delete action function when the close icon is clicked', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketReplyActions {...minProps} />
            </Provider>
        )

        fireEvent.click(screen.getByText('close'))
        expect(minProps.onDelete).toHaveBeenCalled()
    })
})
