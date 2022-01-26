import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {TicketMessageSourceTypes} from '../../../../../../business/ticket.ts'
import {TicketReplyContainer} from '../TicketReply.tsx'
import {MacroActionName} from '../../../../../../models/macroAction/types'
import {ACTION_TEMPLATES} from '../../../../../../config'

jest.unmock('../../../../../../business/ticket.ts')

describe('<TicketReply/>', () => {
    const answerableSourceType = 'email'
    const nonAnswerableSourceType = 'chat'

    const minProps = {
        deleteActionOnApplied: jest.fn(),
        deleteAttachment: jest.fn(),
        richAreaRef: jest.fn(),
        ticket: fromJS({
            id: 1,
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

    it('should render the editor with the applied macro actions', () => {
        const component = shallow(
            <TicketReplyContainer
                {...minProps}
                appliedMacro={fromJS({
                    actions: [
                        ACTION_TEMPLATES.find(
                            (action) =>
                                action.name === MacroActionName.AddInternalNote
                        ),
                    ],
                })}
                isNewMessagePublic={true}
                newMessageType={answerableSourceType}
                newMessageAttachments={fromJS([])}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
