import * as actions from '../actions/ticket'
import {Map} from 'immutable'

const ticketsInitial = Map()

export function tickets(state = ticketsInitial, action) {
    switch (action.type) {
        case actions.NEW_TICKET:
            return state
        case actions.FETCH_TICKET_LIST_VIEW_START:
            // here we should probably set the state as fetching (display that something is happening in the UI)
            return state
        case actions.FETCH_TICKET_LIST_VIEW_SUCCESS:
            return Map(action.resp)
        default:
            return state
    }
}

const ticketInitial = Map({
    external_id: null,
    view: 'default',
    status: 'new',
    subject: '',
    body_html: '',
    body_text: '',
    requester: {
        name: '(no name)',
        address: '(no address)'
    },
    sender: {
        name: '(no name)',
        address: '(no address)'
    },
    receivers: {},
    meta: {},
    tags: [],
    messages: [{
        public: true,
        channel: 'helpdesk',
        receivers: [],
        sender: {
            name: '(no name)',
            address: ''
        },
        subject: '',
        body_text: '',
        body_html: ''
    }]
})

export function ticket(state = ticketInitial, action) {
    switch (action.type) {
        case actions.FETCH_TICKET_START:
            return state
        case actions.SUBMIT_TICKET_SUCCESS:
        case actions.FETCH_TICKET_SUCCESS:
            const newMessage = ticketInitial.get('messages')[0]
            action.resp.messages.push(newMessage)
            return Map(action.resp)

        case actions.UPDATE_TICKET_PROPS:
            if (action.props.hasOwnProperty('message')) {
                let messages = state.get('messages')
                for (let message of messages) {
                    if (!message.id) {
                        message.via = 'helpdesk'
                        message.channel = state.get('channel')
                        message.from_agent = true
                        message.sender = action.props.message.sender
                        message.receivers = action.props.message.receivers
                        message.body_text = action.props.message.body_text
                    }
                }
                state.set('messages', messages)
            }
            return state
        case actions.SUBMIT_TICKET_START:
            return state
        default:
            return state
    }
}
