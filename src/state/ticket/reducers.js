import * as actions from './actions'
import * as types from './constants'
import {SUBMIT_ACTIVITY_SUCCESS} from '../activity/constants'
import {Map, List, fromJS} from 'immutable'
import {convertFromHTML, ContentState} from 'draft-js'
import {stateToHTML} from 'draft-js-export-html'
import {renderTemplate} from '../../pages/common/utils/template'
import _isUndefined from 'lodash/isUndefined'
import {
    getLastNonInternalNoteMessage,
    getSourceTypeOfResponse,
    getChannelFromSourceType
} from './utils'

export const newMessage = (channel, sourceType) => fromJS({
    via: 'helpdesk',
    public: true,
    from_agent: true,
    receiver: null,
    sender: null,
    source: {
        type: sourceType,
        from: {}, // = ticket.messages[first].from_agent ? ticket.messages[first].source.from : ... .to
        to: []
    },
    subject: '',
    body_text: '',
    body_html: '',
    channel,
    attachments: [],
    macros: []
})

export const initialState = fromJS({
    state: {
        dirty: false,
        loading: false,
        attachmentLoading: false,
        query: '',
        fromMacro: false,
        contentState: null,
        latestEventDatetime: null,
        displayHistory: false
    },
    _internal: {
        crossTickets: {
            // Used to pass information from one ticketView to another without using the URL
            displayHistory: false
        },
        userHistory: {
            triedLoading: false,
            isLoading: false,
            hasHistory: false,
            tickets: [],
            events: []
        }
    },
    messages: [],
    customer_ratings: [],
    subject: '',
    via: 'helpdesk',
    channel: 'email',
    assignee_user: null,
    status: 'new',
    sender: null,
    requester: null,
    receiver: null,
    priority: 'normal',
    tags: [],
    newMessage: newMessage('email', 'email')
})

export default (state = initialState, action) => {
    let tags

    switch (action.type) {
        case types.ADD_ATTACHMENT_START:
            return state.setIn(['state', 'attachmentLoading'], true)

        case types.ADD_ATTACHMENT_SUCCESS:
            return state.mergeDeep({
                newMessage: {
                    attachments: state.getIn(['newMessage', 'attachments']).concat(action.resp)
                },
                state: {
                    dirty: true,
                    attachmentLoading: false
                }
            })

        case types.DELETE_ATTACHMENT:
            return state
                .setIn(['newMessage', 'attachments'], state.getIn(['newMessage', 'attachments']).delete(action.index))
                .setIn(['state', 'dirty'], true)

        case types.RECORD_MACRO:
            return state.setIn(
                ['newMessage', 'macros'],
                state.getIn(['newMessage', 'macros']).push({id: action.macro.get('id')})
            )

        case types.RECEIVED_MACRO:
            return state.setIn(['state', 'fromMacro'], false)

        case types.SUBMIT_TICKET_MESSAGE_START: {
            let newState = state.mergeDeep({
                state: {
                    loading: true,
                    dirty: false
                }
            })

            // if the ticket is un-assigned,
            // auto-assign it to the current user.
            if (!newState.getIn(['assignee_user', 'email'])) {
                const sender = action.currentUser.filter(actions.keyIn('email', 'id', 'name'))

                newState = newState.set('assignee_user', sender)
            }

            return newState
        }

        case types.SUBMIT_TICKET_START:
        case types.DELETE_TICKET_MESSAGE_START:
            return state.setIn(['state', 'loading'], true)
        case types.SUBMIT_TICKET_ERROR:
        case types.SUBMIT_TICKET_MESSAGE_ERROR:
            return state.setIn(['state', 'loading'], false)

        case types.SUBMIT_TICKET_SUCCESS: {
            if (action.resp.id !== state.get('id') && state.get('id')) {
                return state
            }

            const newState = state
                .merge(fromJS(action.resp))
                .mergeDeep({
                    state: {
                        dirty: false,
                        loading: false,
                        contentState: null,
                        fromMacro: false,
                        query: ''
                    }
                })

            return action.resetMessage ? newState.set('newMessage', newMessage(
                action.resp.channel,
                getSourceTypeOfResponse(newState.get('messages'))
            )) : newState
        }

        case types.SUBMIT_TICKET_MESSAGE_SUCCESS: {
            // If we changed the displayed ticket (e.g. submit and close), we dont want to change the state.
            if (action.resp.ticket_id !== state.get('id') && state.get('id')) {
                return state
            }

            let newState = state
            const respMessage = fromJS(action.resp)

            // We can't just concatenate since we might get duplicates. So we merge on message id.
            const existingIndex = newState.get('messages').findIndex((m) => m.get('id') === respMessage.get('id'))
            if (~existingIndex) {
                newState = newState.setIn(['messages', existingIndex], respMessage)
            } else {
                newState = newState.set('messages', newState.get('messages').push(respMessage))
            }

            newState = newState.mergeDeep({
                state: {
                    dirty: false,
                    loading: false,
                    contentState: null,
                    fromMacro: false,
                    query: ''
                }
            })

            return action.resetMessage ? newState.set('newMessage', newMessage(
                action.resp.channel,
                getSourceTypeOfResponse(newState.get('messages'))
            )) : newState
        }

        case types.FETCH_TICKET_SUCCESS: {
            const newState = state.merge(fromJS(action.resp))
            const sourceType = getSourceTypeOfResponse(newState.get('messages'))

            return newState.set('newMessage', newState.get('newMessage')
                .mergeDeep(newMessage(
                    getChannelFromSourceType(sourceType),
                    sourceType
                )))
                .mergeDeep({
                    state: {
                        dirty: false,
                        loading: false,
                        query: ''
                    }
                })
        }

        case types.FETCH_MESSAGE_SUCCESS:
            if (!_isUndefined(state.get('id')) && state.get('id') === action.resp.ticket_id) {
                return state.setIn(
                    ['messages', state.get('messages').findIndex(message => message.get('id') === action.resp.id)],
                    fromJS(action.resp)
                )
            }

            return state

        case types.CLEAR_TICKET:
            return initialState.setIn(['_internal', 'crossTickets'], state.getIn(['_internal', 'crossTickets']))

        /* Macro actions */
        case types.ADD_TICKET_TAGS: {
            tags = state.get('tags', List())
            const existingTagNames = tags.map((x) => x.get('name'))

            for (const tag of action.args) {
                if (!existingTagNames.includes(tag.get('name'))) {
                    tags = tags.push(Map(tag))
                }
            }

            return state.set('tags', tags)
        }
        case types.REMOVE_TICKET_TAG:
            return state.set('tags', state.get('tags').delete(action.index))

        case types.SET_TAGS:
            return state.set('tags', fromJS(action.args.get('tags')))

        case types.TOGGLE_PRIORITY:
            if (action.args.get('priority')) {
                return state.set('priority', action.args.get('priority'))
            }

            return state.get('priority') === 'normal' ? state.set('priority', 'high') : state.set('priority', 'normal')

        case types.SET_AGENT:
            return state.set('assignee_user', action.args.get('assignee_user') ? fromJS(action.args.get('assignee_user')) : null)

        case types.SET_STATUS:
            if (action.args.get('id') && action.args.get('id') !== state.get('id')) {
                return state
            }
            return state.set('status', action.args.get('status'))

        case types.SET_PUBLIC:
            return state.setIn(['newMessage', 'public'], action.isPublic)

        case types.SET_SUBJECT:
            return state.set('subject', action.args.get('subject'))

        case types.SET_SOURCE_TYPE: {
            let newState = state

            if (action.sourceType !== 'internal-note') {
                newState = newState.setIn(['newMessage', 'channel'], getChannelFromSourceType(action.sourceType))
            } else {
                // For an internal note, we infer the channel from the last non-internal note message.
                const lastSourceType = getLastNonInternalNoteMessage(state.get('messages')).getIn(['source', 'type'])
                newState = newState.setIn(['newMessage', 'channel'], getChannelFromSourceType(lastSourceType))
            }

            return newState
                .setIn(['newMessage', 'source', 'type'], action.sourceType)
                .setIn(['newMessage', 'public'], action.sourceType !== 'internal-note')
        }

        case types.SET_RESPONSE_TEXT: {
            let contentState = action.args.get('contentState')
            let text = ''
            let html = ''
            let blocks = []

            if (action.fromMacro) {
                const ticketState = state.toJS()
                const sender = action.currentUser.filter(actions.keyIn('email', 'id', 'name'))
                const currentUser = sender.toJS()

                text = renderTemplate(action.args.get('body_text', ''), {
                    ticket: ticketState,
                    current_user: currentUser
                })

                html = renderTemplate(action.args.get('body_html', ''), {
                    ticket: ticketState,
                    current_user: currentUser
                })

                if (text) {
                    blocks = ContentState.createFromText(text).getBlocksAsArray()
                } else {
                    blocks = convertFromHTML(html)
                }


                if (state.getIn(['state', 'contentState']) && state.getIn(['state', 'contentState']).hasText()) {
                    blocks = state.getIn(['state', 'contentState']).getBlocksAsArray().concat(blocks)
                }

                contentState = ContentState.createFromBlockArray(blocks)
            }

            text = contentState.getPlainText()
            html = stateToHTML(contentState)

            return state.mergeDeep({
                newMessage: {
                    body_text: text,
                    body_html: html
                },
                state: {
                    fromMacro: action.fromMacro,
                    dirty: text !== ''
                }
            }).setIn(['state', 'contentState'], contentState)
            // not in the mergeDeep because it would be merged with the previous contentState instead of replacing it
        }

        case types.SETUP_NEW_TICKET:
            return initialState

        case types.SET_RECEIVERS: {
            let newState = state
            const receivers = action.receivers

            newState = newState.setIn(['newMessage', 'source', 'to'], fromJS(receivers))

            if (receivers.length) {
                const firstReceiver = receivers[0]
                let storedData = firstReceiver.id
                    ? {id: firstReceiver.id}
                    : {email: firstReceiver.address}
                storedData = fromJS(storedData)

                if (!newState.getIn(['newMessage', 'receiver'])) {
                    newState = newState.setIn(['newMessage', 'receiver'], storedData)
                }

                if (!newState.get('receiver')) {
                    newState = newState.set('receiver', storedData)
                }

                if (!newState.get('requester')) {
                    newState = newState.set('requester', storedData)
                }
            } else {
                if (!newState.getIn(['newMessage', 'source', 'to']).size) {
                    newState = newState.setIn(['newMessage', 'receiver'], null)
                }
            }

            return newState
        }

        case types.MARK_TICKET_DIRTY:
            return state.setIn(['state', 'dirty'], action.dirty)

        case types.DELETE_TICKET_MESSAGE_SUCCESS:
            return state.set(
                'messages',
                state.get('messages').delete(
                    state.get('messages').findIndex(message => message.get('id') === action.messageId)
                )
            ).setIn(['state', 'loading'], false)

        case types.FETCH_USER_TICKETS_START:
        case types.FETCH_USER_EVENTS_START:
            return state.mergeDeep({
                _internal: {
                    userHistory: {
                        isLoading: true,
                        triedLoading: true
                    }
                }
            })

        case types.FETCH_USER_TICKETS_SUCCESS:
            if (state.getIn(['requester', 'id']) !== action.userId) {
                return state
            }

            return state.mergeDeep({
                _internal: {
                    userHistory: {
                        tickets: action.resp.data,
                        isLoading: false,
                        hasHistory: state.getIn(['_internal', 'userHistory', 'hasHistory']) || !!(action.resp.meta.item_count - 1)
                    }
                }
            })

        case types.FETCH_USER_EVENTS_SUCCESS:
            return state.mergeDeep({
                _internal: {
                    userHistory: {
                        events: action.resp.data,
                        isLoading: false,
                        hasHistory: state.getIn(['_internal', 'userHistory', 'hasHistory']) || !!action.resp.meta.item_count
                    }
                }
            })

        case types.TOGGLE_HISTORY:
            return state.setIn(['state', 'displayHistory'], action.state !== undefined ?
                action.state :
                !state.getIn(['state', 'displayHistory'])
            )

        case types.SET_CROSS_TICKETS:
            return state.setIn(['_internal', 'crossTickets'], fromJS(action.state))

        case SUBMIT_ACTIVITY_SUCCESS: {
            // See if we have an event for our ticket
            const event = fromJS(action.resp.events).find((e) => (
                e.get('object_type') === 'Ticket' && e.get('object_id') === state.get('id')
            ))
            if (event) {
                const latestEventDatetime = state.getIn(['state', 'latestEventDatetime'])
                const eventDatetime = event.get('created_datetime')
                let newState = state.setIn(['state', 'latestEventDatetime'], eventDatetime)

                if (latestEventDatetime && eventDatetime !== latestEventDatetime) {
                    let newMessages = event.getIn(['object', 'messages'])
                    if (newMessages) {
                        newMessages = newMessages.sort((a, b) => new Date(a.get('created_datetime')) - new Date(b.get('created_datetime')))
                    }
                    newState = newState.set('messages', newMessages)
                }
                return newState
            }
            return state
        }

        default:
            return state
    }
}
