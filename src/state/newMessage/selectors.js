import {fromJS} from 'immutable'
import {createSelector} from 'reselect'
import {isImmutable, createImmutableSelector} from '../../utils'

export const getReceiversProperties = () => ['to', 'cc', 'bcc']

export const getNewMessageState = state => state.newMessage || fromJS({})

export const getLoading = createImmutableSelector(
    [getNewMessageState],
    state => state.getIn(['_internal', 'loading']) || fromJS({})
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

export const getNewMessage = createImmutableSelector(
    [getNewMessageState],
    state => state.get('newMessage') || fromJS({})
)

export const getNewMessageType = createSelector(
    [getNewMessage],
    state => state.getIn(['source', 'type']) || 'email'
)

export const getNewMessageChannel = createSelector(
    [getNewMessage],
    state => state.get('channel') || 'email'
)

export const getNewMessageSource = createImmutableSelector(
    [getNewMessage],
    state => state.get('source') || fromJS({})
)

export const isNewMessagePublic = createImmutableSelector(
    [getNewMessage],
    state => state.get('public') || false
)

export const isForward = (() => {
    const isForwardedMessage = require('../ticket/utils').isForwardedMessage
    return createSelector(
        [getNewMessage],
        message => isForwardedMessage(message)
    )
})()

// in props usage
// property like 'to', 'from', 'cc', etc.
// ex: newMessageTo: getNewMessageSourceProperty('to')(state)
export const getNewMessageSourceProperty = property => createImmutableSelector(
    [getNewMessageSource],
    state => state.get(property) || fromJS({})
)

// in component usage
// ex: newMessageSourceProperty: makeGetNewMessageSourceProperty(state)
// then : const newMessageTo = newMessageSourceProperty('to')
export const makeGetNewMessageSourceProperty = state => property => getNewMessageSourceProperty(property)(state)

export const getMandatoryContactProperties = (sourceType) => () => { // eslint-disable-line no-unused-vars
    return ['to']
}

export const getOptionalContactProperties = (sourceType) => () => {
    return sourceType === 'email' ? ['cc', 'bcc'] : []
}

// return all contact properties (mandatory + optional) for a source type
export const getContactProperties = sourceType => createImmutableSelector(
    [getMandatoryContactProperties(sourceType), getOptionalContactProperties(sourceType)],
    (mandatory, optional) => mandatory.concat(optional)
)

export const getNewMessageMandatoryContactProperties = createImmutableSelector(
    [getNewMessageType],
    sourceType => getMandatoryContactProperties(sourceType)()
)

export const getNewMessageContactProperties = createImmutableSelector(
    [getNewMessageType],
    sourceType => getContactProperties(sourceType)()
)

// true if mandatory contact properties (such as 'to') are not empty for current new message
export const areNewMessageContactPropertiesFulfilled = createImmutableSelector(
    [getNewMessageMandatoryContactProperties, makeGetNewMessageSourceProperty],
    (mandatoryProperties, getFromSource) => {
        return mandatoryProperties.every((property => {
            const value = getFromSource(property)
            return isImmutable(value) ? !value.isEmpty() : !!value
        }))
    }
)

// return all recipients values merged in an immutable array
export const getNewMessageRecipients = createImmutableSelector(
    [getNewMessageContactProperties, makeGetNewMessageSourceProperty],
    (recipientProperties, getFromSource) => {
        return recipientProperties.filter(prop => prop !== 'from')
            .reduce((result, prop) => {
                const recipients = getFromSource(prop)
                recipients.forEach(recipient => {
                    result = result.push(fromJS(recipient))
                })
                return result
            }, fromJS([]))
    }
)

export const hasNewMessageRecipients = createSelector(
    [getNewMessageRecipients],
    recipients => !recipients.isEmpty()
)

export const hasAttachments = createSelector(
    [getNewMessage],
    message => !(message.get('attachments') || fromJS([])).isEmpty()
)

// Determine if the new message is ready to be sent
export const isReady = createSelector(
    [getNewMessage, hasNewMessageRecipients, hasAttachments, isNewMessagePublic, isForward],
    (newMessage, hasRecipients, hasAttachments, isNewMessagePublic, isForward) => {
        return (newMessage.get('body_text') || hasAttachments || isForward)
            && (hasRecipients || !isNewMessagePublic)
    }
)
