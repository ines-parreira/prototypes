import * as actions from '../actions/ticket'
import Immutable, { Map, List, Set } from 'immutable'
import _ from 'lodash'

const ticketInitial = Map({
    messages: List()
})

const newMessage = Map({
    via: 'helpdesk',    
    public: true,
    from_agent: true,    
    receivers: List(),
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
    var keySet = Set(arguments);
    return function (v, k) {
        return keySet.has(k)
    }
}

function getRecipient(messages, sender) {
    for (let message of messages.reverse()) {
        const senderId = message.getIn(['sender', 'id'])
        if (senderId && senderId !== sender.get('id')) {
            return message.get('sender')
        }
    }
    console.error('No recipient')
}

export function ticket(state = ticketInitial, action) {
    switch (action.type) {
        case actions.FETCH_TICKET_START:
        case actions.SUBMIT_TICKET_START:
            return state

        case actions.SUBMIT_TICKET_SUCCESS:
        case actions.FETCH_TICKET_SUCCESS:
            return Immutable
                .fromJS(action.resp)
                .set('newMessage', newMessage)

        /* Macro actions */

        case actions.ADD_TAGS:
            let tags = state.get('tags', List())
            const existingTagNames = tags.map((x) => x.get('name'))

            for (let tag of action.args) {
                if (!existingTagNames.includes(tag.get('name'))) {
                    tags = tags.push(tag)
                }
            }
            return state.set('tags', tags)

        case actions.SET_RESPONSE_TEXT:
            const text = action.args.get(0) || ''
            const sender = action.currentUser.filter(keyIn('email', 'id', 'name'))

            return state.mergeDeep({
                newMessage: {
                    sender: sender,
                    receivers: [getRecipient(state.get('messages'), sender)],
                    body_text: text
                }
            })

        default:
            return state
    }
}
