import * as actions from '../actions/ticket'
import {Map, List, fromJS} from 'immutable'
import {convertFromHTML, ContentState} from 'draft-js'
import {stateToHTML} from 'draft-js-export-html'
import {renderTemplate} from '../components/utils/template'
import {SOURCE_VALUE_PROP} from '../constants'
import {lastMessage} from '../utils'

const newMessage = (channel, sourceType) => fromJS({
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
    contentState: null,
    channel,
    attachments: List(),
    macros: List()
})

const ticketInitial = Map({
    state: Map({
        potentialRequesters: List(),
        dirty: false,
        loading: false,
        attachmentLoading: false,
        query: ''
    }),
    messages: List(),
    subject: '',
    via: 'helpdesk',
    channel: 'email',
    assignee_user: null,
    status: 'new',
    sender: null,
    requester: null,
    receiver: null,
    priority: 'normal',
    tags: List(),
    newMessage: newMessage('email', 'email')
})

/**
 * Get the most recent message that was not an internal note.
 * @param messages
 * @returns {*}
 */
export function getLastNonInternalNoteMessage(messages) {
    return messages.filter((m) => m.getIn(['source', 'type']) !== 'internal-note').last()
}

/**
 * A utility function that gives the source type we should set on a **new** message based on the
 * source type of the message we're responding to.
 */
function getSourceTypeOfResponse(messages) {
    const lastMsg = getLastNonInternalNoteMessage(messages)
    // some messages don't have sources - failed imports, api, etc..
    if (!lastMsg.get('source')) {
        return 'api'
    }

    switch (lastMsg.getIn(['source', 'type'])) {
        case 'facebook-post':
            return 'facebook-comment'
        case 'internal-note':
            // We never want the new message to be an internal note by default.
            // We get the type of the new message by considering the most recent non-internal note message.
            return getSourceTypeOfResponse(getLastNonInternalNoteMessage(messages))
        default:
            return lastMsg.getIn(['source', 'type'])
    }
}

export function ticket(state = ticketInitial, action) {
    const valueProp = SOURCE_VALUE_PROP[state.getIn(['newMessage', 'source', 'type'])]
    let tags

    switch (action.type) {
        case actions.ADD_ATTACHMENT_START:
            return state.setIn(['state', 'attachmentLoading'], true)

        case actions.ADD_ATTACHMENT_SUCCESS:
            return state.mergeDeep({
                newMessage: {
                    attachments: state.getIn(['newMessage', 'attachments']).concat(action.resp)
                },
                state: {
                    dirty: true,
                    attachmentLoading: false
                }
            })

        case actions.DELETE_ATTACHMENT:
            return state
                .setIn(['newMessage', 'attachments'], state.getIn(['newMessage', 'attachments']).delete(action.index))
                .setIn(['state', 'dirty'], true)

        case actions.RECORD_MACRO:
            return state.setIn(
                ['newMessage', 'macros'],
                state.getIn(['newMessage', 'macros']).push({id: action.macro.get('id')})
            )

        case actions.DELETE_TICKET_MESSAGE_START:
        case actions.SUBMIT_TICKET_START:
            return state.setIn(['state', 'loading'], true)

        case actions.SUBMIT_TICKET_MESSAGE_START:
            return state.setIn(['state', 'loading'], true)

        case actions.SUBMIT_TICKET_ERROR:
            return state.setIn(['state', 'loading'], false)

        case actions.SUBMIT_TICKET_MESSAGE_ERROR:
            return state.setIn(['state', 'loading'], false)

        case actions.SUBMIT_TICKET_SUCCESS: {
            if (action.resp.id !== state.get('id') && state.get('id')) {
                return state
            }

            const newState = state
                .merge(fromJS(action.resp))
                .mergeDeep({
                    state: {
                        dirty: false,
                        loading: false,
                        query: ''
                    }
                })

            return action.resetMessage ? newState.set('newMessage', newMessage(
                action.resp.channel,
                getSourceTypeOfResponse(newState.get('messages'))
            )) : newState
        }

        case actions.SUBMIT_TICKET_MESSAGE_SUCCESS: {
            // If we changed the displayed ticket (e.g. submit and close), we dont want to change the state.
            if (action.resp.ticket_id !== state.get('id') && state.get('id')) {
                return state
            }

            let newState = state
            const respMessage = fromJS(action.resp)

            // We can't just concatenate since we might get duplicates. So we merge on message id.
            const existingIndex = newState.get('messages').findIndex((m) => m.get('id') === respMessage.get('id'))
            if (existingIndex !== -1) {
                newState = newState.setIn(['messages', existingIndex], respMessage)
            } else {
                newState = newState.set('messages', newState.get('messages').push(respMessage))
            }

            newState = newState.mergeDeep({
                state: {
                    dirty: false,
                    loading: false,
                    query: ''
                }
            })

            return action.resetMessage ? newState.set('newMessage', newMessage(
                action.resp.channel,
                getSourceTypeOfResponse(newState.get('messages'))
            )) : newState
        }

        case actions.FETCH_TICKET_SUCCESS: {
            const newState = state.merge(fromJS(action.resp))
            return newState.set('newMessage', newState.get('newMessage').mergeDeep(newMessage(
                action.resp.channel,
                getSourceTypeOfResponse(newState.get('messages'))
            )))
                .mergeDeep({
                    state: {
                        dirty: false,
                        loading: false,
                        query: ''
                    }
                })
        }

        case actions.FETCH_MESSAGE_SUCCESS:
            if (state.get('id') === action.resp.ticket_id) {
                return state.setIn(
                    ['messages', state.get('messages').findIndex(message => message.get('id') === action.resp.id)],
                    fromJS(action.resp)
                )
            }

            return state

        case actions.CLEAR_TICKET:
            return ticketInitial

        /* Macro actions */

        case actions.ADD_TICKET_TAGS: {
            tags = state.get('tags', List())
            const existingTagNames = tags.map((x) => x.get('name'))

            for (const tag of action.args) {
                if (!existingTagNames.includes(tag.get('name'))) {
                    tags = tags.push(Map(tag))
                }
            }

            return state.set('tags', tags)
        }
        case actions.REMOVE_TICKET_TAG:
            return state.set('tags', state.get('tags').delete(action.index))

        case actions.SET_TAGS:
            return state.set('tags', fromJS(action.args.get('tags')))

        case actions.TOGGLE_PRIORITY:
            if (action.args.get('priority')) {
                return state.set('priority', action.args.get('priority'))
            }

            return state.get('priority') === 'normal' ? state.set('priority', 'high') : state.set('priority', 'normal')

        case actions.SET_AGENT:
            return state.set('assignee_user', action.args.get('assignee_user') ? Map(action.args.get('assignee_user')) : null)

        case actions.SET_STATUS:
            if (action.id && action.id !== state.get('id')) {
                return state
            }
            return state.set('status', action.args.get('status'))

        case actions.SET_PUBLIC:
            return state.setIn(['newMessage', 'public'], action.isPublic)

        case actions.SET_SUBJECT:
            return state.set('subject', action.args.get('subject'))

        case actions.SET_SOURCE_TYPE: {
            let newState = state

            if (action.sourceType.startsWith('facebook')) {
                newState = newState.setIn(['newMessage', 'channel'], 'facebook')
            } else if (action.sourceType !== 'internal-note') {
                newState = newState.setIn(['newMessage', 'channel'], action.sourceType)
            } else {
                newState = newState.setIn(['newMessage', 'channel'], lastMessage(state.get('messages').toJS()).source.type)
            }

            return newState
                .setIn(['newMessage', 'source', 'type'], action.sourceType)
                .setIn(['newMessage', 'public'], action.sourceType !== 'internal-note')
        }

        case actions.SET_RESPONSE_TEXT: {
            let contentState = action.args.get('contentState')
            const text = contentState ? contentState.getPlainText() : action.args.get('body_text', '')
            const html = contentState ? stateToHTML(contentState) : action.args.get('body_html', '')
            const sender = action.currentUser.filter(actions.keyIn('email', 'id', 'name'))

            const ticketState = state.toJS()
            const currentUser = sender.toJS()

            const expandedText = fromJS(renderTemplate(text, {
                ticket: ticketState,
                current_user: currentUser
            }))

            const expandedHTML = fromJS(renderTemplate(html, {
                ticket: ticketState,
                current_user: currentUser
            }))

            if (!contentState) {
                // we use text first because it's more stable
                if (expandedText) {
                    contentState = ContentState.createFromText(expandedText)
                } else {
                    // fallback to html
                    contentState = ContentState.createFromBlockArray(convertFromHTML(expandedHTML))
                }
            }

            return state.set('newMessage', state.get('newMessage').merge({
                contentState,
                body_text: expandedText,
                body_html: expandedHTML
            })).setIn(['state', 'dirty'], expandedText !== '' || state.getIn(['state', 'dirty']))
        }

        case actions.SETUP_NEW_TICKET:
            return ticketInitial

        case actions.UPDATE_POTENTIAL_REQUESTERS: {
            const users = []

            for (const channel of action.resp.data) {
                const data = {
                    ...channel.user
                }

                data[valueProp] = channel.address
                data.name = data.name ? data.name : ''

                users.push(data)
            }

            return state
                .setIn(['state', 'potentialRequesters'], fromJS(users))
                .setIn(['state', 'query'], action.query)
        }

        case actions.ADD_RECEIVER: {
            let newState = state

            if (!state.getIn(['newMessage', 'receiver'])) {
                newState = newState.setIn(['newMessage', 'receiver'], fromJS({id: action.receiver.id}))
            }

            if (!state.get('receiver')) {
                newState = newState.set('receiver', fromJS({id: action.receiver.id}))
            }

            if (!state.get('requester')) {
                newState = newState.set('requester', fromJS({id: action.receiver.id}))
            }

            return newState.mergeDeep({
                newMessage: {
                    source: {
                        to: newState.getIn(['newMessage', 'source', 'to']).push(fromJS(action.receiver))
                    }
                },
                state: {
                    query: ''
                }
            })
        }

        case actions.REMOVE_RECEIVER: {
            let newState = state.setIn(
                ['newMessage', 'source', 'to'],
                state.getIn(['newMessage', 'source', 'to']).filter(
                    receiver => receiver.get(valueProp) !== action.prop
                )
            )

            if (!newState.getIn(['newMessage', 'source', 'to']).size) {
                newState = newState.setIn(['newMessage', 'receiver'], null)
            }

            return newState
        }

        case actions.MARK_TICKET_DIRTY:
            return state.setIn(['state', 'dirty'], true)

        case actions.DELETE_TICKET_MESSAGE_SUCCESS:
            return state.set(
                'messages',
                state.get('messages').delete(
                    state.get('messages').findIndex(message => message.get('id') === action.messageId)
                )
            ).setIn(['state', 'loading'], false)

        default:
            return state
    }
}
