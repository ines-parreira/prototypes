import * as actions from '../actions/ticket'
import Immutable, { Map, List, Set } from 'immutable'

const ticketInitial = Map({
    messages: List(),
    priority: false,
    agent: ''
})

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
    // TODO: Implement channel selection widget
    channel: 'email',
})

function keyIn(/*...keys*/) {
    const keySet = Set(arguments);
    return function (v, k) {
        return keySet.has(k)
    }
}

function getRecipient(messages, sender) {
    for (const message of messages.reverse()) {
        const senderId = message.getIn(['sender', 'id'])
        if (senderId && senderId !== sender.get('id')) {
            return message.get('sender')
        }
    }
    console.error('No recipient')
    return null
}

export function ticket(state = ticketInitial, action) {
    let tags

    switch (action.type) {
        case actions.SUBMIT_TICKET_SUCCESS:
        case actions.FETCH_TICKET_SUCCESS:
            return Immutable.fromJS(action.resp).set('newMessage', newMessage)

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

        case actions.SET_RESPONSE_TEXT:
            const text = action.args.get('body_text') || ''
            const sender = action.currentUser.filter(keyIn('email', 'id', 'name'))

            return state.mergeDeep({
                newMessage: {
                    sender,
                    receiver: getRecipient(state.get('messages'), sender),
                    body_text: text
                }
            })

        default:
            return state
    }
}
