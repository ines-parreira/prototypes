import * as actions from '../actions/ticket'
import Immutable, { Map, List, Set } from 'immutable'
import { renderTemplate } from '../components/utils/template'

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
    channel: 'email'
})

const ticketInitial = Map({
    state: Map({
        potentialRequesters: List(),
        initialized: false
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

    switch (action.type) {
        case actions.SUBMIT_TICKET_SUCCESS:
        case actions.FETCH_TICKET_SUCCESS:
            return state.merge(Immutable.fromJS(action.resp)).set('newMessage', newMessage)

        /* Macro actions */

        case actions.ADD_TICKET_TAGS:
            tags = state.get('tags', List())
            const existingTagNames = tags.map((x) => x.get('name'))
            for (const tag of action.args) {
                if (!existingTagNames.includes(tag.get('name'))) {
                    tags = tags.push(Map(tag))
                }
            }
            return state.set('tags', tags)

        case actions.REMOVE_TICKET_TAG:
            tags = state.get('tags').delete(action.index)
            return state.set('tags', tags)

        case actions.UPDATE_TICKET_TAGS:
            tags = Immutable.fromJS(action.args)
            return state.set('tags', tags)

        case actions.TOGGLE_PRIORITY:
            return state.get('priority') === 'normal' ? state.set('priority', 'high') : state.set('priority', 'normal')

        case actions.SET_AGENT:
            return state.set('assignee_user', Map(action.agent))

        case actions.SET_STATUS:
            return state.set('status', action.status)

        case actions.SET_PUBLIC:
            return state.setIn(['newMessage', 'public'], action.isPublic)

        case actions.SET_SUBJECT:
            return state.set('subject', action.subject)

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

            if (state.getIn(['newMessage', 'receiver', 'id'])) {
                receiver = state.getIn(['newMessage', 'receiver'])
            }

            return state.set('newMessage', state.get('newMessage').merge({
                sender,
                receiver,
                body_text: expandedText,
                body_html: expandedHTML
            }))

        case actions.SETUP_NEW_TICKET:
            return ticketInitial

        case actions.UPDATE_POTENTIAL_REQUESTERS:
            return state.setIn(['state', 'potentialRequesters'], action.potentialRequesters)

        case actions.SET_RECEIVER:
            const newReceiver = { id: action.receiverId }
            newReceiver[action.channel === 'email' || action.channel === 'api' ? 'email' : 'name'] = action.receiverAttr
            return state.setIn(['newMessage', 'receiver'], Map(newReceiver))

        case actions.SET_INITIALIZED:
            return state.setIn(['state', 'initialized'], true)

        default:
            return state
    }
}
