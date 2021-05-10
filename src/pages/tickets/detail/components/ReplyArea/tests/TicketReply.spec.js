import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {TicketMessageSourceTypes} from '../../../../../../business/ticket.ts'
import {TicketReplyContainer} from '../TicketReply'

jest.unmock('../../../../../../business/ticket.ts')

describe('<TicketReply/>', () => {
    const answerableSourceType = 'email'
    const nonAnswerableSourceType = 'chat'

    const minProps = {
        deleteActionOnApplied: jest.fn(),
        deleteAttachment: jest.fn(),
        richAreaRef: jest.fn(),
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
        updateActionArgsOnApplied: jest.fn(),
    }

    it('should render the editor', () => {
        const component = shallow(
            <TicketReplyContainer
                {...minProps}
                isNewMessagePublic={true}
                newMessageType={answerableSourceType}
                newMessageAttachments={fromJS([])}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
