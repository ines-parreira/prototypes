import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

export const getReceiversProperties = () => ['to', 'cc', 'bcc']

export const getTicketState = state => state.ticket || fromJS({})

export const getTicket = createSelector(
    [getTicketState],
    state => state
        .delete('_internal')
        .delete('state')
        .delete('newMessage') || fromJS({})
)

export const getLoading = createSelector(
    [getTicketState],
    state => state.getIn(['_internal', 'loading'], fromJS({}))
)

// in props usage
// ex: isMerging: isLoading('merge')(state)
export const isLoading = name => createSelector(
    [getLoading],
    loading => loading.get(name, false)
)

// in component usage
// ex: isLoading: makeIsLoading(state)   then : const isMerging = isLoading('merge')
export const makeIsLoading = state => name => isLoading(name)(state)

export const getMessages = createSelector(
    [getTicketState],
    state => state.get('messages', fromJS([]))
)

export const getNewMessage = createSelector(
    [getTicketState],
    state => state.get('newMessage', fromJS({}))
)

export const getNewMessageType = createSelector(
    [getNewMessage],
    state => state.getIn(['source', 'type']) || 'email'
)

export const getNewMessageChannel = createSelector(
    [getNewMessage],
    state => state.get('channel') || 'email'
)

export const getNewMessageSource = createSelector(
    [getNewMessage],
    state => state.get('source', fromJS({}))
)

// in props usage
// property like 'to', 'from', 'cc', etc.
// ex: newMessageTo: getNewMessageSourceProperty('to')(state)
export const getNewMessageSourceProperty = property => createSelector(
    [getNewMessageSource],
    state => state.get(property, fromJS({}))
)

// in component usage
// ex: newMessageSourceProperty: makeGetNewMessageSourceProperty(state)
// then : const newMessageTo = newMessageSourceProperty('to')
export const makeGetNewMessageSourceProperty = state => property => getNewMessageSourceProperty(property)(state)

export const getNewMessageRecipients = (state) => {
    const recipientProperties = ['to', 'cc', 'bcc']

    return recipientProperties.reduce((result, prop) => {
        const recipients = getNewMessageSourceProperty(prop)(state)
        recipients.forEach(recipient => {
            result = result.push(fromJS(recipient))
        })
        return result
    }, fromJS([]))
}

export const hasNewMessageRecipients = createSelector(
    [getNewMessageRecipients],
    recipients => !recipients.isEmpty()
)
