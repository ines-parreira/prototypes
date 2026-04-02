import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useAgentActivity } from '@gorgias/realtime'

import { TicketMessageSourceType } from 'business/types/ticket'
import { ACTION_TEMPLATES } from 'config'
import { UserRole } from 'config/types/user'
import { MacroActionName } from 'models/macroAction/types'

import { TicketReply } from '../TicketReply'

jest.unmock('business/ticket')

jest.mock('lodash/uniqueId', () => (id: number) => `${id}42`)

jest.mock('draft-js-plugins-editor', () => ({
    __esModule: true,
    default: () => <div>Editor</div>,
    composeDecorators: jest.fn(),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn((flag, defaultValue) => defaultValue),
    withFeatureFlags: jest.fn((Component) => Component),
}))

jest.mock('@gorgias/realtime')
const mockUseAgentActivity = useAgentActivity as jest.Mock

jest.mock('providers/OutboundTranslationProvider', () => ({
    useOutboundTranslationContext: jest.fn().mockReturnValue({
        isTranslationPending: false,
    }),
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
                [answerableSourceType]: { answerable: true },
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

    beforeEach(() => {
        mockUseAgentActivity.mockReturnValue({
            startTyping: jest.fn(),
            stopTyping: jest.fn(),
            getTicketActivity: jest.fn().mockReturnValue({ typing: [] }),
        })
    })

    it('should render the editor', () => {
        const { container } = render(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations: [],
                    }),
                    newMessage: fromJS({ state: {} }),
                })}
            >
                <TicketReply {...minProps} />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the editor with the applied macro actions', () => {
        const { queryByText } = render(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations: [],
                    }),
                    newMessage: fromJS({ state: {} }),
                })}
            >
                <TicketReply
                    {...minProps}
                    appliedMacro={fromJS({
                        actions: [
                            ACTION_TEMPLATES.find(
                                (action) =>
                                    action.name ===
                                    MacroActionName.AddInternalNote,
                            ),
                        ],
                    })}
                />
            </Provider>,
        )

        expect(queryByText(/Send internal note/)).toBeInTheDocument()
    })

    it('should render the editor with the correct warning for agents', () => {
        const store = mockStore({
            currentUser: fromJS({
                role: { name: UserRole.Agent },
            }),
            integrations: fromJS({
                integrations: [
                    {
                        id: 1,
                        type: 'gmail',
                        name: 'Bob At Acme',
                        meta: { address: 'bob@acme.com' },
                        deactivated_datetime: '2025-03-12T00:13:40.385400',
                    },
                ],
                authentication: {
                    gmail: {
                        redirect_uri: '/integrations/gmail/pre-callback',
                    },
                },
            }),
            newMessage: fromJS({
                newMessage: {
                    source: {
                        from: { address: 'bob@acme.com' },
                        type: 'email',
                    },
                },
                state: {},
            }),
        })

        const result = render(
            <Provider store={store}>
                <TicketReply {...minProps} />
            </Provider>,
        )

        expect(result.container).toMatchSnapshot()
    })

    it('should render the editor with the correct warning for admins', () => {
        const store = mockStore({
            currentUser: fromJS({
                role: { name: UserRole.Admin },
            }),
            integrations: fromJS({
                integrations: [
                    {
                        id: 1,
                        type: 'gmail',
                        name: 'Bob At Acme',
                        meta: { address: 'bob@acme.com' },
                        deactivated_datetime: '2025-03-12T00:13:40.385400',
                    },
                ],
                authentication: {
                    gmail: {
                        redirect_uri: '/integrations/gmail/pre-callback',
                    },
                },
            }),
            newMessage: fromJS({
                newMessage: {
                    source: {
                        from: { address: 'bob@acme.com' },
                        type: 'email',
                    },
                },
                state: {},
            }),
        })

        const result = render(
            <Provider store={store}>
                <TicketReply {...minProps} />
            </Provider>,
        )

        expect(result.container).toMatchSnapshot()
    })
})
