import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { MacroActionName } from 'models/macroAction/types'
import { Action, ActionStatus } from 'models/ticket/types'
import * as NewMessageActions from 'state/newMessage/actions'
import * as TicketActions from 'state/ticket/actions'
import { StoreDispatch } from 'state/types'
import { getActionTemplate, stripErrorMessage } from 'utils'

import Error from '../Error'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

const defaultProps = {
    error: 'Test error message',
    retryTooltipMessage: 'Retry to send the message.',
    ticketId: 123,
    message: fromJS({
        _internal: {
            status: 'error',
            loading: {
                submitNewMessage: false,
            },
        },
    }),
    messageId: 456,
    messageActions: [],
    retry: true,
    force: true,
    cancel: true,
}

jest.mock('state/ticket/actions', () => ({
    updateTicketMessage: jest
        .fn()
        .mockReturnValue({ type: 'UPDATE_TICKET_MESSAGE' }),
    deleteMessage: jest.fn().mockReturnValue({ type: 'DELETE_MESSAGE' }),
    deleteTicketPendingMessage: jest
        .fn()
        .mockReturnValue({ type: 'DELETE_TICKET_PENDING_MESSAGE' }),
}))

jest.mock('state/newMessage/actions', () => ({
    retrySubmitTicketMessage: jest
        .fn()
        .mockImplementation((message) => (dispatch: StoreDispatch) => {
            return Promise.resolve().then(() => {
                dispatch({ type: 'RETRY_SUBMIT_TICKET_MESSAGE' })
                return message
            })
        }),
}))

jest.mock('utils', () => ({
    getActionTemplate: jest.fn((name) => {
        if (name === 'http') {
            return { title: 'HTTP hook' }
        }
        return null
    }),
    stripErrorMessage: jest.fn((msg) => msg.toLowerCase()),
    sanitizeHtmlDefault: jest.fn((html) => html),
}))

describe('Error', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders with error message and action buttons', () => {
        render(
            <Provider
                store={mockStore({
                    newMessage: fromJS({
                        _internal: {
                            loading: {
                                submitNewMessage: false,
                            },
                        },
                    }),
                })}
            >
                <Error {...defaultProps} />
            </Provider>,
        )

        expect(screen.getByText('Test error message')).toBeInTheDocument()
        expect(screen.getByText('Retry')).toBeInTheDocument()
        expect(screen.getByText('Send Anyway')).toBeInTheDocument()
        expect(screen.getByText('Cancel Message')).toBeInTheDocument()
    })

    it('handles retry action for existing message', () => {
        render(
            <Provider
                store={mockStore({
                    newMessage: fromJS({
                        _internal: {
                            loading: {
                                submitNewMessage: false,
                            },
                        },
                    }),
                })}
            >
                <Error {...defaultProps} />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Retry'))
        expect(TicketActions.updateTicketMessage).toHaveBeenCalledWith(
            123,
            456,
            {},
            'retry',
        )
    })

    it('handles retry action for new message with setStatus', async () => {
        const setStatus = jest.fn()
        const props = {
            ...defaultProps,
            messageId: 0,
            setStatus,
            message: fromJS({
                _internal: {
                    status: 'error',
                    loading: {
                        submitNewMessage: false,
                    },
                },
            }),
        }

        const store = mockStore({
            newMessage: fromJS({
                _internal: {
                    loading: {
                        submitNewMessage: false,
                    },
                },
            }),
        })

        render(
            <Provider store={store}>
                <Error {...props} />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Retry'))
        expect(NewMessageActions.retrySubmitTicketMessage).toHaveBeenCalledWith(
            props.message,
        )

        await new Promise(process.nextTick)

        expect(setStatus).toHaveBeenCalledWith('error')
    })

    it('handles retry action for new message without setStatus', async () => {
        const props = {
            ...defaultProps,
            messageId: 0,
        }

        render(
            <Provider
                store={mockStore({
                    newMessage: fromJS({
                        _internal: {
                            loading: {
                                submitNewMessage: false,
                            },
                        },
                    }),
                })}
            >
                <Error {...props} />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Retry'))
        expect(NewMessageActions.retrySubmitTicketMessage).toHaveBeenCalled()
        await Promise.resolve() // Wait for the Promise to resolve
    })

    it('handles cancel action for existing message', () => {
        render(
            <Provider
                store={mockStore({
                    newMessage: fromJS({
                        _internal: {
                            loading: {
                                submitNewMessage: false,
                            },
                        },
                    }),
                })}
            >
                <Error {...defaultProps} />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Cancel Message'))
        expect(TicketActions.deleteMessage).toHaveBeenCalledWith(123, 456)
    })

    it('handles cancel action for new message', () => {
        const props = {
            ...defaultProps,
            messageId: 0,
        }

        render(
            <Provider
                store={mockStore({
                    newMessage: fromJS({
                        _internal: {
                            loading: {
                                submitNewMessage: false,
                            },
                        },
                    }),
                })}
            >
                <Error {...props} />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Cancel Message'))
        expect(TicketActions.deleteTicketPendingMessage).toHaveBeenCalled()
    })

    it('handles force action', () => {
        render(
            <Provider
                store={mockStore({
                    newMessage: fromJS({
                        _internal: {
                            loading: {
                                submitNewMessage: false,
                            },
                        },
                    }),
                })}
            >
                <Error {...defaultProps} />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Send Anyway'))
        expect(TicketActions.updateTicketMessage).toHaveBeenCalledWith(
            123,
            456,
            {},
            'force',
        )
    })

    it('displays message actions when they exist', () => {
        const messageActions: Action[] = [
            {
                name: MacroActionName.Http,
                status: ActionStatus.Error,
                title: 'Test Action',
                type: 'http',
                response: {
                    msg: 'Action failed message',
                    status_code: 400,
                    response: 'Bad Request',
                },
            },
        ]

        render(
            <Provider
                store={mockStore({
                    newMessage: fromJS({
                        _internal: {
                            loading: {
                                submitNewMessage: false,
                            },
                        },
                    }),
                })}
            >
                <Error {...defaultProps} messageActions={messageActions} />
            </Provider>,
        )

        expect(screen.getByText('Find out why?')).toBeInTheDocument()
        fireEvent.click(screen.getByText('Find out why?'))
        expect(screen.getByText(/The action/)).toBeInTheDocument()
    })

    it('toggles message actions visibility', () => {
        const messageActions: Action[] = [
            {
                name: MacroActionName.Http,
                status: ActionStatus.Error,
                title: 'Test Action',
                type: 'http',
                response: {
                    msg: 'Action failed message',
                    status_code: 400,
                    response: 'Bad Request',
                },
            },
        ]

        const { container } = render(
            <Provider
                store={mockStore({
                    newMessage: fromJS({
                        _internal: {
                            loading: {
                                submitNewMessage: false,
                            },
                        },
                    }),
                })}
            >
                <Error {...defaultProps} messageActions={messageActions} />
            </Provider>,
        )

        expect(container.firstChild).not.toHaveClass('showActions')

        const toggleButton = screen.getByText('Find out why?')
        fireEvent.click(toggleButton)
        expect(container.firstChild).toHaveClass('showActions')

        fireEvent.click(toggleButton)
        expect(container.firstChild).not.toHaveClass('showActions')
    })

    it('updates loading state when submitNewMessage changes', () => {
        const { rerender } = render(
            <Provider
                store={mockStore({
                    newMessage: fromJS({
                        _internal: {
                            loading: {
                                submitNewMessage: true,
                            },
                        },
                    }),
                })}
            >
                <Error {...defaultProps} />
            </Provider>,
        )

        const retryButton = screen.getByRole('button', { name: 'Retry' })
        fireEvent.click(retryButton)
        expect(retryButton).toHaveAttribute('aria-disabled', 'true')
        expect(retryButton).toHaveClass('ui-button-isdisabled-a432')

        rerender(
            <Provider
                store={mockStore({
                    newMessage: fromJS({
                        _internal: {
                            loading: {
                                submitNewMessage: false,
                            },
                        },
                    }),
                })}
            >
                <Error {...defaultProps} />
            </Provider>,
        )

        const updatedRetryButton = screen.getByRole('button', { name: 'Retry' })
        expect(updatedRetryButton).not.toHaveAttribute('aria-disabled', 'true')
        expect(updatedRetryButton).not.toHaveClass('ui-button-isdisabled-a432')
    })

    it('does not show Find out why? link when there are no error responses', () => {
        const messageActions: Action[] = [
            {
                name: MacroActionName.Http,
                status: ActionStatus.Success,
                title: 'Test Action',
                type: 'http',
                response: {
                    msg: 'Action succeeded',
                    status_code: 200,
                    response: 'OK',
                },
            },
        ]

        render(
            <Provider
                store={mockStore({
                    newMessage: fromJS({
                        _internal: {
                            loading: {
                                submitNewMessage: false,
                            },
                        },
                    }),
                })}
            >
                <Error {...defaultProps} messageActions={messageActions} />
            </Provider>,
        )

        expect(screen.queryByText('Find out why?')).not.toBeInTheDocument()
    })

    it('displays error message with template title when available', () => {
        const messageActions: Action[] = [
            {
                name: MacroActionName.Http,
                status: ActionStatus.Error,
                title: 'Test Action',
                type: 'http',
                response: {
                    msg: 'Action Failed Message',
                    status_code: 400,
                    response: 'Bad Request',
                },
            },
        ]

        render(
            <Provider
                store={mockStore({
                    newMessage: fromJS({
                        _internal: {
                            loading: {
                                submitNewMessage: false,
                            },
                        },
                    }),
                })}
            >
                <Error {...defaultProps} messageActions={messageActions} />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Find out why?'))

        // Verify template title and transformed message
        expect(getActionTemplate).toHaveBeenCalledWith(MacroActionName.Http)
        expect(stripErrorMessage).toHaveBeenCalledWith('Action Failed Message')
        expect(screen.getByText(/HTTP hook/)).toBeInTheDocument()
        expect(screen.getByText(/action failed message/)).toBeInTheDocument()
    })

    it('displays error message without template title when template not found', () => {
        const messageActions: Action[] = [
            {
                name: 'UnknownAction' as MacroActionName,
                status: ActionStatus.Error,
                title: 'Test Action',
                type: 'unknown',
                response: {
                    msg: 'Action Failed Message',
                    status_code: 400,
                    response: 'Bad Request',
                },
            },
        ]

        render(
            <Provider
                store={mockStore({
                    newMessage: fromJS({
                        _internal: {
                            loading: {
                                submitNewMessage: false,
                            },
                        },
                    }),
                })}
            >
                <Error {...defaultProps} messageActions={messageActions} />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Find out why?'))

        // Verify template is not found and message is still transformed
        expect(getActionTemplate).toHaveBeenCalledWith('UnknownAction')
        expect(stripErrorMessage).toHaveBeenCalledWith('Action Failed Message')

        const errorItem = screen.getByRole('listitem')
        expect(errorItem).toHaveClass('actionError')

        // Check that the template title is empty
        const boldElements = errorItem.querySelectorAll('b')
        expect(boldElements[0]).toHaveTextContent('')
        expect(boldElements[1]).toHaveTextContent('action failed message')

        // Check the text content is properly structured
        const textContent = errorItem.textContent
        expect(textContent?.replace(/\s+/g, ' ').trim()).toBe(
            'The action failed because action failed message.',
        )
    })

    it('renders error message with correct formatting and structure', () => {
        const messageActions: Action[] = [
            {
                name: MacroActionName.Http,
                status: ActionStatus.Error,
                title: 'Test Action',
                type: 'http',
                response: {
                    msg: 'Connection timeout',
                    status_code: 400,
                    response: 'Bad Request',
                },
            },
        ]

        render(
            <Provider
                store={mockStore({
                    newMessage: fromJS({
                        _internal: {
                            loading: {
                                submitNewMessage: false,
                            },
                        },
                    }),
                })}
            >
                <Error {...defaultProps} messageActions={messageActions} />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Find out why?'))

        const errorItem = screen.getByRole('listitem')
        expect(errorItem).toHaveClass('actionError')

        // Check the exact text content and structure
        const boldElements = errorItem.querySelectorAll('b')
        expect(boldElements).toHaveLength(2)
        expect(boldElements[0]).toHaveTextContent('HTTP hook')
        expect(boldElements[1]).toHaveTextContent('connection timeout')

        // Verify the complete text structure including spaces
        expect(errorItem).toHaveTextContent(
            'The action HTTP hook failed because connection timeout.',
        )
    })
})
