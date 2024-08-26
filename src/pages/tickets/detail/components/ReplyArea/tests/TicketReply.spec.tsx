import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {MacroActionName} from 'models/macroAction/types'
import {ACTION_TEMPLATES} from 'config'
import {TicketMessageSourceType} from 'business/types/ticket'

import {TicketReply} from '../TicketReply'

jest.unmock('business/ticket')

jest.mock('lodash/uniqueId', () => (id: number) => `${id}42`)

jest.mock('draft-js-plugins-editor', () => ({
    __esModule: true,
    default: () => <div>Editor</div>,
    composeDecorators: jest.fn(),
}))

const mockStore = configureMockStore([thunk])

describe('<TicketReply />', () => {
    const answerableSourceType = TicketMessageSourceType.Email
    const nonAnswerableSourceType = TicketMessageSourceType.Chat

    const minProps: ComponentProps<typeof TicketReply> = {
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
                [TicketMessageSourceType.FacebookMessenger]: {
                    answerable: true,
                },
            },
        }),
    }

    it('should render the editor', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations: [],
                    }),
                    newMessage: fromJS({state: {}}),
                })}
            >
                <TicketReply {...minProps} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the editor with the applied macro actions', () => {
        const {queryByText} = render(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations: [],
                    }),
                    newMessage: fromJS({state: {}}),
                })}
            >
                <TicketReply
                    {...minProps}
                    appliedMacro={fromJS({
                        actions: [
                            ACTION_TEMPLATES.find(
                                (action) =>
                                    action.name ===
                                    MacroActionName.AddInternalNote
                            ),
                        ],
                    })}
                />
            </Provider>
        )

        expect(queryByText(/Send internal note/)).toBeInTheDocument()
    })
})
