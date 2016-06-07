import * as actions from '../actions/ticket'
import {Map, List, Set, fromJS} from 'immutable'
import {convertToRaw, convertFromHTML, ContentState} from 'draft-js'
import {stateToHTML} from 'draft-js-export-html'
import {renderTemplate} from '../components/utils/template'

const newMessage = Map({
    via: 'helpdesk',
    public: true,
    from_agent: true,
    receiver: Map({
        name: '(no name)',
        id: null
    }),
    sender: Map({
        name: '(no name)',
        id: null
    }),
    source: Map({}),
    subject: '',
    body_text: '',
    body_html: '',
    contentState: null,
    channel: 'email',
    attachments: List(),
    macros: List()
})

const ticketInitial = Map({
    state: Map({
        potentialRequesters: List(),
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

function keyIn(...keys) {
    const keySet = Set(keys)
    return (v, k) => keySet.has(k)
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

    return res
}

export function ticket(state = ticketInitial, action) {
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

        case actions.SUBMIT_TICKET_ERROR:
            return state.setIn(['state', 'loading'], false)

        case actions.SUBMIT_TICKET_SUCCESS:
        case actions.FETCH_TICKET_SUCCESS:
            return state.merge(fromJS(action.resp)).set('newMessage', newMessage).mergeDeep({
                state: {
                    dirty: false,
                    loading: false
                }
            })

        case actions.TICKET_PARTIAL_UPDATE_SUCCESS:
            if (action.resp.id === state.get('id')) {
                return state.merge(fromJS(action.resp))
            }

            return state

        case actions.FETCH_MESSAGE_SUCCESS:
            if (state.get('id') === action.resp.ticket_id) {
                return state.setIn(
                    ['messages', state.get('messages').findIndex(message => message.get('id') === action.resp.id)],
                    fromJS(action.resp)
                )
            }

            return state

        /* Macro actions */

        case actions.ADD_TICKET_TAGS:
        {
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
            return state.set('assignee_user', Map(action.args.get('assignee_user')))

        case actions.SET_STATUS:
            return state.set('status', action.args.get('status'))

        case actions.SET_PUBLIC:
            return state.setIn(['newMessage', 'public'], action.isPublic)

        case actions.SET_SUBJECT:
            return state.set('subject', action.args.get('subject'))

        case actions.SET_RESPONSE_TEXT:
        {
            let contentState = action.args.get('contentState')
            const text = contentState ? contentState.getPlainText() : action.args.get('body_text', '')
            const html = contentState ? stateToHTML(contentState) : action.args.get('body_html', '')

            const sender = action.currentUser.filter(keyIn('email', 'id', 'name'))

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
                contentState = ContentState.createFromText(expandedText)
            }

            let receiver = getRecipient(state.get('messages'), sender)

            if (state.getIn(['newMessage', 'receiver', 'id']) || state.getIn(['newMessage', 'receiver', 'email'])) {
                receiver = state.getIn(['newMessage', 'receiver'])
            }

            const channel = state.get('channel', 'email');

            return state.set('newMessage', state.get('newMessage').merge({
                sender,
                receiver,
                channel,
                contentState,
                body_text: expandedText,
                body_html: expandedHTML
            })).setIn(['state', 'dirty'], expandedText !== '' || state.getIn(['state', 'dirty']))
        }
        case actions.SET_SOURCE_TYPE:
            return state.setIn(['newMessage', 'source', 'type'], action.source_type)

        case actions.SETUP_NEW_TICKET:
            return ticketInitial

        case actions.UPDATE_POTENTIAL_REQUESTERS:
            return state
                .setIn(['state', 'potentialRequesters'], fromJS(action.resp.data))
                .setIn(['state', 'query'], action.query)

        case actions.SET_RECEIVER:
            return state.setIn(['newMessage', 'receiver'], fromJS(action.receiver))

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
