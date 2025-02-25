import React, { ComponentProps } from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { ACTION_TEMPLATES } from '../../../../../../config'
import { integrationsState } from '../../../../../../fixtures/integrations'
import { MacroActionName } from '../../../../../../models/macroAction/types'
import { RootState } from '../../../../../../state/types'
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
                    (action) => action.name === MacroActionName.AddInternalNote,
                ),
            ],
        }),
        onDelete: jest.fn(),
    }

    const element = document.createElement('div')
    element.setAttribute('id', 'submit-button-div')
    document.body.appendChild(element)

    it('should render the ticket reply macro actions uncollapsed', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <TicketReplyActions {...minProps} />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the ticket reply macro actions collapsed', () => {
        const props: ComponentProps<typeof TicketReplyActions> = {
            ticketId: 1,
            appliedMacro: fromJS({
                actions: ACTION_TEMPLATES.filter((action) => {
                    const actions = [
                        MacroActionName.ForwardByEmail,
                        MacroActionName.AddInternalNote,
                        MacroActionName.ShopifyCancelLastOrder,
                        MacroActionName.ShopifyDuplicateLastOrder,
                        MacroActionName.ShopifyPartialRefundLastOrder,
                        MacroActionName.ShopifyRefundShippingCostLastOrder,
                        MacroActionName.RechargeRefundLastCharge,
                        MacroActionName.RechargeRefundLastOrder,
                    ]
                    return actions.includes(action.name)
                }),
            }),
            onDelete: jest.fn(),
        }

        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <TicketReplyActions {...props} />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should collapse the macro actions', async () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <TicketReplyActions {...minProps} />
            </Provider>,
        )
        const header = screen.getByText('Actions performed')
        const collapsingElement = container.firstChild?.lastChild as HTMLElement

        fireEvent.click(header)
        await waitFor(() => {
            expect(collapsingElement.className).toBe('scrollable collapse')
        })
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call delete action function when the close icon is clicked', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketReplyActions {...minProps} />
            </Provider>,
        )

        fireEvent.click(screen.getByText('close'))
        expect(minProps.onDelete).toHaveBeenCalled()
    })
})
