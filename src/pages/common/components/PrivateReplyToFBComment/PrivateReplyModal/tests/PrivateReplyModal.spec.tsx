import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import MockAdapter from 'axios-mock-adapter'

import {fromJS} from 'immutable'
import {SET_INVALID_CUSTOM_FIELDS_TO_ERRORED} from 'state/ticket/constants'
import {TicketMessageSourceType} from 'business/types/ticket'
import * as infobarActions from 'state/infobar/actions'
import client from 'models/api/resources'

import {flushPromises} from 'utils/testing'
import PrivateReplyModal from '../PrivateReplyModal'

jest.mock(
    'pages/common/components/TicketMessageEmbeddedCard/TicketMessageEmbeddedCard.tsx',
    () => () => <div>mocked TicketMessageEmbeddedCard</div>
)

const defaultProps = {
    integrationId: 1,
    messageId: '123',
    ticketMessageId: 1,
    senderId: 1,
    ticketId: 1,
    commentMessage: 'some comment',
    source: {
        type: TicketMessageSourceType.FacebookComment,
        from: {
            address: 'some_from_address',
            name: 'some_from_name',
        },
        to: [
            {
                address: 'some_from_address',
                name: 'some_from_name',
            },
        ],
    },
    sender: {
        id: 123,
        email: 'some_email@foo.com',
        name: 'some_sender_name',
        firstname: 'some_sender_firstname',
        lastname: 'some_sender_lastname',
    },
    isFacebookComment: true,
    executeAction: infobarActions.executeAction,
}

const mockStore = configureMockStore([thunk])
const store = mockStore({
    entities: {rules: {}},
    ticket: fromJS({
        id: defaultProps.ticketId,
    }),
})

const mockedServer = new MockAdapter(client)

describe('<PrivateReplyModal/>', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    it('should render the modal', () => {
        const {container} = render(
            <Provider store={store}>
                <PrivateReplyModal
                    {...defaultProps}
                    messageCreatedDatetime={'Sun Nov 01 2020 01:01:01 UTC+0000'}
                    isOpen
                    toggle={jest.fn()}
                />
            </Provider>
        )
        expect(container.parentNode).toMatchSnapshot()
    })

    it('should dispatch setInvalidCustomFieldsToErrored if missing custom fields when send and closing the modal', async () => {
        mockedServer.onPost('/api/actions/execute/').reply(201, '')
        mockedServer.onPut(`/api/tickets/${defaultProps.ticketId}`).reply(400, {
            error: {msg: 'foo error'},
        })

        render(
            <Provider store={store}>
                <PrivateReplyModal
                    {...defaultProps}
                    messageCreatedDatetime={'Sun Nov 01 2020 01:01:01 UTC+0000'}
                    isOpen
                    toggle={jest.fn()}
                />
            </Provider>
        )

        fireEvent.change(screen.getByRole('textbox'), {
            target: {value: 'some comment'},
        })
        fireEvent.click(screen.getByText(/close/i))

        await flushPromises()

        expect(store.getActions().pop()).toEqual(
            expect.objectContaining({
                type: SET_INVALID_CUSTOM_FIELDS_TO_ERRORED,
            })
        )
    })
})
