import type { ComponentProps } from 'react'
import React from 'react'

import { createEvent, fireEvent, render } from '@testing-library/react'
import { ContentState } from 'draft-js'
//@ts-ignore
import generateRandomKey from 'draft-js/lib/generateRandomKey'
import type { Map as ImmutableMap } from 'immutable'
import { fromJS } from 'immutable'
import _noop from 'lodash/noop'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel, TicketMessageSourceType } from 'business/types/ticket'
import { useOutboundTranslationContext } from 'providers/OutboundTranslationProvider'
import * as channelsService from 'services/channels'
import { convertToHTML, createDraftJSKeyGeneratorMock } from 'utils/editor'
import { sanitizeHtmlForFacebookMessenger } from 'utils/html'

import { TicketReplyEditorContainer } from '../TicketReplyEditor'

jest.mock('providers/OutboundTranslationProvider')

jest.mock('draft-js/lib/generateRandomKey', () =>
    jest.fn().mockReturnValue('mock-key'),
)

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const store = mockStore({
    integrations: fromJS({
        integrations: [],
    }),
    ui: { editor: {} },
})

const mockUseOutboundTranslationContext =
    useOutboundTranslationContext as jest.Mock

describe('TicketReplyEditor component', () => {
    beforeEach(() => {
        const generateKey = createDraftJSKeyGeneratorMock()
        const generateRandomKeyFunction = generateRandomKey as jest.SpyInstance
        generateRandomKeyFunction.mockImplementation(generateKey)
        jest.useRealTimers()

        mockUseOutboundTranslationContext.mockReturnValue({
            ticketIdToDraftIdMap: new Map(),
            translationCache: new Map(),
            getTranslationFromCache: jest.fn(),
            registerTranslationDraft: jest.fn(),
            getCurrentDraftId: jest.fn(),
            isTranslationPending: false,
        })
    })

    const minProps: ComponentProps<typeof TicketReplyEditorContainer> = {
        applyMacro: jest.fn(),
        isNewMessagePublic: true,
        macros: fromJS([]),
        richAreaRef: jest.fn(),
        shouldDisplayQuickReply: false,
        ticket: fromJS({}),
        agents: fromJS([]),
        attachments: fromJS([]),
        newMessage: fromJS({}),
        newMessageType: fromJS({}),
        predictionContext: fromJS({}),
        addAttachments: jest.fn(),
        notify: jest.fn(),
        setResponseText: jest.fn(),
        handleTypingActivity: jest.fn(),
        hasTranslation: false,
        isTranslationPending: false,
    }

    it('should render empty ticket', () => {
        const { container } = render(
            <Provider store={store}>
                <TicketReplyEditorContainer
                    {...minProps}
                    newMessage={fromJS({
                        state: {
                            contentState: ContentState.createFromText(''),
                        },
                        _internal: {
                            loading: {
                                submitMessage: false,
                            },
                        },
                        newMessage: {
                            body_text: '',
                            body_html: '',
                        },
                    })}
                    newMessageType={TicketMessageSourceType.Email}
                />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not allow attachments for instagram comments', () => {
        const { queryByText } = render(
            <Provider store={store}>
                <TicketReplyEditorContainer
                    {...minProps}
                    newMessage={fromJS({
                        state: {
                            contentState: ContentState.createFromText(''),
                        },
                        _internal: {
                            loading: {
                                submitMessage: false,
                            },
                        },
                        newMessage: {
                            body_text: '',
                            body_html: '',
                        },
                    })}
                    newMessageType={TicketMessageSourceType.InstagramComment}
                />
            </Provider>,
        )
        expect(queryByText('attach_file')).not.toBeInTheDocument()
    })

    it('should not allow attachments for instagram mention comments', () => {
        const { queryByText } = render(
            <Provider store={store}>
                <TicketReplyEditorContainer
                    {...minProps}
                    newMessage={fromJS({
                        state: {
                            contentState: ContentState.createFromText(''),
                        },
                        _internal: {
                            loading: {
                                submitMessage: false,
                            },
                        },
                        newMessage: {
                            body_text: '',
                            body_html: '',
                        },
                    })}
                    newMessageType={
                        TicketMessageSourceType.InstagramMentionComment
                    }
                />
            </Provider>,
        )
        expect(queryByText('attach_file')).not.toBeInTheDocument()
    })

    it.each([
        // Simulate having an existing GIF and adding a new attachment
        [fromJS([{ content_type: 'image/gif' }]), [{ type: 'image/jpg' }]],
        // Simulate having an existing attachment and adding a new GIF one
        [fromJS([{ content_type: 'image/jpg' }]), [{ type: 'image/gif' }]],
    ])(
        'should not allow GIF + other attachments for Twitter tweets',
        (existingAttachments, newAttachments) => {
            const notifyMock = jest.fn()

            const { getByLabelText } = render(
                <Provider store={store}>
                    <TicketReplyEditorContainer
                        {...minProps}
                        addAttachments={_noop}
                        newMessage={fromJS({
                            state: {
                                contentState: ContentState.createFromText(''),
                            },
                            _internal: {
                                loading: {
                                    submitMessage: false,
                                },
                            },
                            newMessage: {
                                body_text: '',
                                body_html: '',
                            },
                        })}
                        attachments={existingAttachments}
                        newMessageType={TicketMessageSourceType.TwitterTweet}
                        notify={notifyMock}
                    />
                </Provider>,
            )

            fireEvent.change(getByLabelText('attach_file'), {
                target: { files: newAttachments },
            })

            expect(notifyMock).toBeCalledWith({
                type: 'error',
                status: 'warning',
                message:
                    'When answering to Twitter tweet messages, you can only attach a single GIF or a maximum of 4 pictures.',
            })
        },
    )

    // test for debouncer bug
    // https://github.com/gorgias/gorgias/issues/2510
    it('should not set newMessage value after component is unmounted', (done) => {
        const ticket: ImmutableMap<any, any> = fromJS({
            id: 123,
            events: [],
            messages: [],
            subject: 'Pepperoni Pizza',
            via: 'helpdesk',
            channel: 'email',
            assignee_user: null,
            status: 'open',
            spam: false,
            sender: null,
            customer: null,
            receiver: null,
            priority: 'normal',
            tags: [],
            trashed_datetime: null,
        })

        const newMessage: ImmutableMap<any, any> = fromJS({
            state: {
                contentState: ContentState.createFromText(''),
                selectionState: null,
                cacheAdded: true,
            },
            newMessage: {
                body_text: '',
                body_html: '',
            },
        })
        let newMessageText: string

        const { unmount, container } = render(
            <Provider store={store}>
                <TicketReplyEditorContainer
                    {...minProps}
                    newMessageType={TicketMessageSourceType.Email}
                    newMessage={newMessage}
                    ticket={ticket}
                    setResponseText={(props) => {
                        newMessageText = (
                            props!.get('contentState') as ContentState
                        ).getPlainText()
                    }}
                    shouldDisplayQuickReply={false}
                />
            </Provider>,
        )

        // simulate "onEditorChange" RichField change event
        const editor = container.querySelector('.public-DraftEditor-content')!
        const event = createEvent.paste(editor, {
            clipboardData: {
                types: ['text/plain'],
                getData: () => 'Pizza Pepperoni',
            },
        })
        fireEvent(editor, event)
        fireEvent(editor, event)

        // simulate leaving ticket
        unmount()
        // simulate blank newMessage
        newMessageText = ''

        // needed for lifecycle
        setTimeout(() => {
            // Jest will throw an Timeout error if it fails
            // because expect throw()s
            expect(newMessageText).toBe('')
            done()
        }, 500)
    })

    it('should allow inline image', () => {
        const ticket: ImmutableMap<any, any> = fromJS({
            id: 123,
            events: [],
            messages: [],
            subject: 'Pepperoni Pizza',
            via: 'helpdesk',
            channel: TicketChannel.FacebookMessenger,
            assignee_user: null,
            status: 'open',
            spam: false,
            sender: null,
            customer: null,
            receiver: null,
            priority: 'normal',
            tags: [],
            trashed_datetime: null,
        })

        const newMessage: ImmutableMap<any, any> = fromJS({
            state: {
                contentState: ContentState.createFromText(''),
                selectionState: null,
                cacheAdded: true,
            },
            newMessage: {
                body_text: '',
                body_html: '',
            },
        })

        const { getByText } = render(
            <Provider store={store}>
                <TicketReplyEditorContainer
                    {...minProps}
                    newMessageType={TicketMessageSourceType.FacebookMessenger}
                    newMessage={newMessage}
                    ticket={ticket}
                />
            </Provider>,
        )

        expect(getByText('insert_photo')).toBeInTheDocument()
    })

    it('should render message with inline image', (done) => {
        const ticket: ImmutableMap<any, any> = fromJS({
            id: 123,
            events: [],
            messages: [],
            subject: 'Pepperoni Pizza',
            via: 'helpdesk',
            channel: TicketChannel.FacebookMessenger,
            assignee_user: null,
            status: 'open',
            spam: false,
            sender: null,
            customer: null,
            receiver: null,
            priority: 'normal',
            tags: [],
            trashed_datetime: null,
        })

        const newMessage: ImmutableMap<any, any> = fromJS({
            state: {
                contentState: null,
                selectionState: null,
                cacheAdded: true,
            },
            newMessage: {
                body_text: '',
                body_html: '',
            },
        })
        let newEditorState: ContentState

        const { container } = render(
            <Provider store={store}>
                <TicketReplyEditorContainer
                    {...minProps}
                    newMessageType={TicketMessageSourceType.Aircall}
                    newMessage={newMessage}
                    ticket={ticket}
                    setResponseText={(props) => {
                        newEditorState = props!.get('contentState')
                    }}
                />
            </Provider>,
        )

        let htmlString = `<b>this is an</b> inline image: <img alt="abc" src="https://this-is-a-link-of-image/and-this-is-the-image.png">`
        htmlString = sanitizeHtmlForFacebookMessenger(htmlString)

        // simulate "onEditorChange" RichField change event
        const editor = container.querySelector('.public-DraftEditor-content')!
        const event = createEvent.paste(editor, {
            clipboardData: {
                types: ['text/plain'],
                getData: () => htmlString,
            },
        })
        fireEvent(editor, event)
        fireEvent(editor, event)

        // needed for lifecycle
        setTimeout(() => {
            expect(convertToHTML(newEditorState)).toMatchSnapshot()
            done()
        }, 500)
    })

    it('should not allow "videos", "shopify products" or "discount codes" for new channels', () => {
        jest.spyOn(channelsService, 'isNewChannel').mockReturnValue(true)
        const { queryByText } = render(
            <Provider store={store}>
                <TicketReplyEditorContainer
                    {...minProps}
                    newMessage={fromJS({
                        state: {
                            contentState: ContentState.createFromText(''),
                        },
                        integrations: {
                            integrations: [{ type: 'shopify' }],
                        },
                    })}
                    newMessageType={'tiktok-shop' as TicketMessageSourceType}
                />
            </Provider>,
        )

        expect(queryByText(/insert video/i)).not.toBeInTheDocument()
        expect(queryByText('shopify')).not.toBeInTheDocument()
        expect(queryByText('discount')).not.toBeInTheDocument()
    })

    it('should call onTypingActivity', () => {
        const mockHandleTypingActivity = jest.fn()

        const { container } = render(
            <Provider store={store}>
                <TicketReplyEditorContainer
                    {...minProps}
                    newMessage={fromJS({
                        state: {
                            cacheAdded: true,
                        },
                    })}
                    newMessageType={TicketMessageSourceType.Email}
                    handleTypingActivity={mockHandleTypingActivity}
                />
            </Provider>,
        )

        const editor = container.querySelector('.public-DraftEditor-content')!
        fireEvent.keyDown(editor)

        expect(mockHandleTypingActivity).toHaveBeenCalled()
    })

    describe('getEditorStateFromReducer', () => {
        it('should return editor state with selection pointing to a valid block when content is empty', () => {
            let instance: TicketReplyEditorContainer | null = null

            render(
                <Provider store={store}>
                    <TicketReplyEditorContainer
                        {...minProps}
                        ref={(ref) => {
                            instance = ref
                        }}
                        newMessage={fromJS({
                            state: {
                                contentState:
                                    ContentState.createFromText('hello'),
                            },
                            newMessage: {
                                body_text: 'hello',
                                body_html: '<p>hello</p>',
                            },
                        })}
                        newMessageType={TicketMessageSourceType.Email}
                    />
                </Provider>,
            )

            const emptyProps = {
                ...minProps,
                newMessage: fromJS({
                    state: {
                        contentState: ContentState.createFromText(''),
                    },
                }),
            }

            const resultEditorState =
                instance!.getEditorStateFromReducer(emptyProps)!
            const selection = resultEditorState.getSelection()
            const anchorKey = selection.getAnchorKey()
            const content = resultEditorState.getCurrentContent()

            expect(content.getBlockForKey(anchorKey)).toBeDefined()
        })

        it('should update selection block key when transitioning from non-empty to empty content', () => {
            let instance: TicketReplyEditorContainer | null = null

            render(
                <Provider store={store}>
                    <TicketReplyEditorContainer
                        {...minProps}
                        ref={(ref) => {
                            instance = ref
                        }}
                        newMessage={fromJS({
                            state: {
                                contentState:
                                    ContentState.createFromText('sent message'),
                            },
                            newMessage: {
                                body_text: 'sent message',
                                body_html: '<p>sent message</p>',
                            },
                        })}
                        newMessageType={TicketMessageSourceType.Email}
                    />
                </Provider>,
            )

            const propsWithContent = {
                ...minProps,
                newMessage: fromJS({
                    state: {
                        contentState:
                            ContentState.createFromText('sent message'),
                    },
                }),
            }
            const stateWithContent =
                instance!.getEditorStateFromReducer(propsWithContent)!
            const oldBlockKey = stateWithContent
                .getCurrentContent()
                .getFirstBlock()
                .getKey()

            const propsWithEmptyContent = {
                ...minProps,
                newMessage: fromJS({
                    state: {
                        contentState: ContentState.createFromText(''),
                    },
                }),
            }
            const stateAfterClear = instance!.getEditorStateFromReducer(
                propsWithEmptyContent,
            )!
            const newBlockKey = stateAfterClear
                .getCurrentContent()
                .getFirstBlock()
                .getKey()
            const selectionAnchorKey = stateAfterClear
                .getSelection()
                .getAnchorKey()

            expect(selectionAnchorKey).toBe(newBlockKey)
            expect(selectionAnchorKey).not.toBe(oldBlockKey)
        })
    })
})
