import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {TicketMessageSourceTypes} from '../../../../../../business/ticket.ts'
import TicketReply from '../TicketReply'

jest.unmock('../../../../../../business/ticket.ts')

const mockStore = configureMockStore([thunk])

describe('<TicketReply/>', () => {
    const answerableSourceType = 'email'
    const nonAnswerableSourceType = 'chat'

    const baseNewMessage = {
        public: true,
        source: {
            type: answerableSourceType,
        },
        attachments: [],
    }

    const commonProps = {
        actions: {},
        deleteAttachment: _noop,
        richAreaRef: _noop,
        ticket: fromJS({
            reply_options: {
                [answerableSourceType]: {answerable: true},
                [nonAnswerableSourceType]: {
                    answerable: false,
                    reason: 'You cannot respond.',
                },
                [TicketMessageSourceTypes.FACEBOOK_MESSENGER]: {
                    answerable: true,
                },
            },
        }),
    }

    it('should render the editor', () => {
        const component = shallow(
            <TicketReply
                {...commonProps}
                store={mockStore({
                    newMessage: fromJS({
                        newMessage: baseNewMessage,
                    }),
                })}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })
})
