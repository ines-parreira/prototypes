import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'

import {TicketMessageSourceTypes} from '../../../../../../business/ticket.ts'
import {TicketReplyContainer} from '../TicketReply'

jest.unmock('../../../../../../business/ticket.ts')

describe('<TicketReply/>', () => {
    const answerableSourceType = 'email'
    const nonAnswerableSourceType = 'chat'

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
            <TicketReplyContainer
                {...commonProps}
                isNewMessagePublic={true}
                newMessageType={answerableSourceType}
                newMessageAttachments={fromJS([])}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
