import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {TicketMessageSourceTypes} from 'business/ticket'
import {MacroActionName} from 'models/macroAction/types'
import {ACTION_TEMPLATES} from 'config'
import {TicketMessageSourceType} from 'business/types/ticket'

import {TicketReplyContainer} from '../TicketReply'

jest.unmock('../../../../../../business/ticket.ts')

jest.mock('lodash/uniqueId', () => (id: number) => `${id}42`)

describe('<TicketReply/>', () => {
    const answerableSourceType = TicketMessageSourceType.Email
    const nonAnswerableSourceType = TicketMessageSourceType.Chat

    const minProps: ComponentProps<typeof TicketReplyContainer> = {
        applyMacro: jest.fn(),
        macros: fromJS({}),
        richAreaRef: jest.fn(),
        shouldDisplayQuickReply: false,
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
        newMessageAttachments: fromJS([]),
        newMessageType: answerableSourceType,
        deleteActionOnApplied: jest.fn(),
        deleteAttachment: jest.fn(),
    }

    it('should render the editor', () => {
        const component = shallow(<TicketReplyContainer {...minProps} />)

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
            />
        )

        expect(component).toMatchSnapshot()
    })
})
