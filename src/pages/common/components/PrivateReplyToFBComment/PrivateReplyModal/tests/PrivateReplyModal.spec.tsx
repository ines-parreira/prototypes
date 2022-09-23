import React from 'react'

import {render} from '@testing-library/react'

import {Provider} from 'react-redux'

import configureMockStore from 'redux-mock-store'

import {TicketMessageSourceType} from '../../../../../../business/types/ticket'

import * as infobarActions from '../../../../../../state/infobar/actions'

import PrivateReplyModal from '../PrivateReplyModal'

import {RootState, StoreDispatch} from '../../../../../../state/types'

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

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    entities: {rules: {}},
} as RootState)

describe('<PrivateReplyModal/>', () => {
    describe('render', () => {
        it('should render the modal', () => {
            const {container} = render(
                <Provider store={store}>
                    <PrivateReplyModal
                        {...defaultProps}
                        messageCreatedDatetime={
                            'Sun Nov 01 2020 01:01:01 UTC+0000'
                        }
                        isOpen
                        toggle={jest.fn()}
                    />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
