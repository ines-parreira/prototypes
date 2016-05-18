import * as actions from '../actions/ticket'
import Immutable, { Map, List, Set } from 'immutable'
import { renderTemplate } from '../components/utils/template'
import moment from 'moment'

const newMessage = Map({
    via: 'helpdesk',
    public: true,
    from_agent: true,
    receiver: Map({
        name: '(no name)',
        id: null,
    }),
    sender: Map({
        name: '(no name)',
        id: null,
    }),
    subject: '',
    body_text: '',
    body_html: '',
    channel: 'email',
    attachments: List(),
    macros: List()
})

const ticketInitial = Map({
    state: Map({
        potentialRequesters: List(),
        query: '',
        dirty: false,
        loading: false,
        attachmentLoading: false
    }),
    messages: List(),
    subject: '',
    via: 'helpdesk',
    channel: 'email',
    assignee_user: null,
    status: 'new',
    sender: null,
    requester: Map({
        id: null,
        name: null,
        email: null
    }),
    receiver: null,
    priority: 'normal',
    tags: List(),
    newMessage
})

function keyIn(/*...keys*/) {
    const keySet = Set(arguments);
    return function (v, k) {
        return keySet.has(k)
    }
}

function getRecipient(messages, sender) {
    let res = null

    for (const message of messages.reverse()) {
        const senderId = message.getIn(['sender', 'id'])
        if (senderId && senderId !== sender.get('id')) {
            return message.get('sender')
        }
        const receiverId = message.getIn(['receiver', 'id'])
        if (receiverId && receiverId !== sender.get('id')) {
            res = message.get('receiver')
        }
    }

    if (!res) { console.error('No recipient') }
    return res
}

export function ticket(state = ticketInitial, action) {
    let tags
    let newState = state

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
            return state.mergeDeep({
                newMessage: {
                    macros: state.getIn(['newMessage', 'macros']).push({ id: action.macro.get('id') })
                }
            })

        case actions.DELETE_TICKET_MESSAGE_START:
        case actions.SUBMIT_TICKET_START:
            return state.setIn(['state', 'loading'], true)

        case actions.SUBMIT_TICKET_ERROR:
            return state.setIn(['state', 'loading'], false)

        case actions.SUBMIT_TICKET_SUCCESS:
        case actions.FETCH_TICKET_SUCCESS:
            return state.merge(Immutable.fromJS(action.resp)).set('newMessage', newMessage).mergeDeep({
                state: {
                    dirty: false,
                    loading: false
                }
            })

        case actions.FETCH_MESSAGE_SUCCESS:
            if (state.get('id') === action.resp.ticket_id) {
                return state.setIn(
                    ['messages', state.get('messages').findIndex(message => message.get('id') === action.resp.id)],
                    Immutable.fromJS(action.resp)
                )
            }

            return state

        /* Macro actions */

        case actions.ADD_TICKET_TAGS:
            tags = state.get('tags', List())
            const existingTagNames = tags.map((x) => x.get('name'))
            for (const tag of action.args) {
                if (!existingTagNames.includes(tag.get('name'))) {
                    tags = tags.push(Map(tag))
                }
            }

            return state.merge({
                tags,
                state: state.get('state').merge({ dirty: true })
            })

        case actions.REMOVE_TICKET_TAG:
            tags = state.get('tags').delete(action.index)
            return state.merge({
                tags,
                state: state.get('state').merge({ dirty: true })
            })

        case actions.TOGGLE_PRIORITY:
            if (action.args.get('priority')) {
                return state.merge({
                    priority: action.args.get('priority'),
                    state: state.get('state').merge({ dirty: true })
                })
            }

            newState = state.get('priority') === 'normal' ? state.set('priority', 'high') : state.set('priority', 'normal')
            return newState.setIn(['state', 'dirty'], true)

        case actions.SET_AGENT:
            return state.merge({
                assignee_user: Map(action.args.get('assignee_user')),
                state: state.get('state').merge({ dirty: true })
            })

        case actions.SET_STATUS:
            return state.merge({
                status: action.args.get('status'),
                state: state.get('state').merge({ dirty: true })
            })

        case actions.SET_PUBLIC:
            return state.setIn(['newMessage', 'public'], action.isPublic)

        case actions.SET_SUBJECT:
            return state.merge({
                subject: action.subject,
                state: state.get('state').merge({ dirty: true })
            })

        case actions.SET_RESPONSE_TEXT:
            const text = action.args.get('body_text') || action.args.get(0) || ''
            const html = action.args.get('body_html') || action.args.get(1) || ''
            const sender = action.currentUser.filter(keyIn('email', 'id', 'name'))

            const ticketState = state.toJS()
            const currentUser = sender.toJS()

            const expandedText = Immutable.fromJS(renderTemplate(text, {
                ticket: ticketState,
                current_user: currentUser
            }))

            const expandedHTML = Immutable.fromJS(renderTemplate(html, {
                ticket: ticketState,
                current_user: currentUser
            }))

            let receiver = getRecipient(state.get('messages'), sender)

            if (state.getIn(['newMessage', 'receiver', 'id']) || state.getIn(['newMessage', 'receiver', 'email'])) {
                receiver = state.getIn(['newMessage', 'receiver'])
            }

            return state.set('newMessage', state.get('newMessage').merge({
                sender,
                receiver,
                body_text: expandedText,
                body_html: expandedHTML
            })).setIn(['state', 'dirty'], expandedText !== '' || state.getIn(['state', 'dirty']))

        case actions.SETUP_NEW_TICKET:
            return ticketInitial

        case actions.UPDATE_POTENTIAL_REQUESTERS:
            return state
                .setIn(['state', 'potentialRequesters'], action.potentialRequesters)
                .setIn(['state', 'query'], action.query)

        case actions.SET_RECEIVER:
            const newReceiver = {}

            if (!isNaN(action.receiverId)) {
                newReceiver.id = action.receiverId
            }

            newReceiver[action.channel === 'email' || action.channel === 'api' ? 'email' : 'name'] = action.receiverAttr
            return state.setIn(['newMessage', 'receiver'], Map(newReceiver))

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
