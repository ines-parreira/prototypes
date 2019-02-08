import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import TicketReply from '../TicketReply'
import {TEXT_OR_ATTACHMENT_SOURCE_TYPES} from '../TicketReplyEditor'

const mockStore = configureMockStore([thunk])


describe('TicketReply component', () => {
    const answerableSourceType = 'email'
    const nonAnswerableSourceType = 'chat'

    const baseNewMessage = {
        public: true,
        source: {
            type: answerableSourceType
        },
        attachments: []
    }

    const commonProps = {
        actions: {},
        deleteAttachment: _noop,
        richAreaRef: _noop,
        ticket: fromJS({
            reply_options: {
                [answerableSourceType]: {answerable: true},
                [nonAnswerableSourceType]: {answerable: false, reason: 'You cannot respond.'},
                [TEXT_OR_ATTACHMENT_SOURCE_TYPES[0]]: {answerable: true},
            }
        }),
    }

    it('should render the editor', () => {
        const component = shallow(
            <TicketReply
                {...commonProps}
                store={mockStore({
                    newMessage: fromJS({
                        newMessage: baseNewMessage
                    })
                })}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should render an alert instead of the editor because there is an attachment and it is not allowed to send text ' +
        'AND attachments for this source type', () => {
        const component = shallow(
            <TicketReply
                {...commonProps}
                store={mockStore({
                    newMessage: fromJS({
                        newMessage: {
                            public: true,
                            source: {
                                type: TEXT_OR_ATTACHMENT_SOURCE_TYPES[0]
                            },
                            attachments: ['foo']
                        }
                    })
                })}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should render an alert instead of the editor because the ticket is not repliable on this channel', () => {
        const component = shallow(
            <TicketReply
                {...commonProps}
                store={mockStore({
                    newMessage: fromJS({
                        newMessage: fromJS(baseNewMessage).setIn(['source', 'type'], nonAnswerableSourceType).toJS()
                    })
                })}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })
})
