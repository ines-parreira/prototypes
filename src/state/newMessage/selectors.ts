import {ContentState} from 'draft-js'
import {fromJS, Map, List} from 'immutable'
import {createSelector} from 'reselect'

import {
    TicketMessageSourceType,
    TicketChannel,
} from '../../business/types/ticket'
import {IntegrationType} from '../../models/integration/types'
import {isImmutable, createImmutableSelector} from '../../utils'
import {getChannelSignature} from '../integrations/selectors'
import {isForwardedMessage} from '../ticket/utils'
import {RootState} from '../types'

import {NewMessageState, ReceiverProperty} from './types'

export const getReceiversProperties = () => Object.values(ReceiverProperty)

export const getNewMessageState = (state: RootState): NewMessageState =>
    state.newMessage || fromJS({})

export const getLoading = createImmutableSelector<
    RootState,
    Map<any, any>,
    NewMessageState
>(
    getNewMessageState,
    (state) =>
        (state.getIn(['_internal', 'loading']) || fromJS({})) as Map<any, any>
)

// in props usage
// ex: isMerging: isLoading('merge')(state)
export const isLoading = (name: string) =>
    createSelector<RootState, boolean, Map<any, any>>(
        getLoading,
        (loading) => loading.get(name, false) as boolean
    )

// in component usage
// ex: isLoading: makeIsLoading(state)   then : const isMerging = isLoading('merge')
export const makeIsLoading = (state: RootState) => (name: string) =>
    isLoading(name)(state)

export const isDirty = createSelector<RootState, boolean, NewMessageState>(
    getNewMessageState,
    (state) => state.getIn(['state', 'dirty'], false) as boolean
)

export const isCacheAdded = createSelector<RootState, boolean, NewMessageState>(
    getNewMessageState,
    (state) => state.getIn(['state', 'cacheAdded'], false) as boolean
)

export const isNewMessageEmailExtraAdded = createSelector<
    RootState,
    boolean,
    NewMessageState
>(
    getNewMessageState,
    (state) => state.getIn(['state', 'emailExtraAdded'], false) as boolean
)

export const getNewMessage = createImmutableSelector<
    RootState,
    Map<any, any>,
    NewMessageState
>(
    getNewMessageState,
    (state) => (state.get('newMessage') || fromJS({})) as Map<any, any>
)

export const getNewMessageContentState = createImmutableSelector<
    RootState,
    ContentState,
    NewMessageState
>(
    getNewMessageState,
    (state) => state.getIn(['state', 'contentState']) as ContentState
)

export const getNewMessageType = createSelector<
    RootState,
    TicketMessageSourceType,
    Map<any, any>
>(
    getNewMessage,
    (state) =>
        (state.getIn(['source', 'type']) as TicketMessageSourceType) ||
        TicketMessageSourceType.Email
)

export const getNewMessageChannel = createSelector<
    RootState,
    TicketChannel,
    Map<any, any>
>(
    getNewMessage,
    (state) => (state.get('channel') as TicketChannel) || TicketChannel.Email
)

export const getNewMessageSource = createImmutableSelector<
    RootState,
    Map<any, any>,
    Map<any, any>
>(
    getNewMessage,
    (state) => (state.get('source') || fromJS({})) as Map<any, any>
)

export const getNewMessageAttachments = createImmutableSelector<
    RootState,
    List<any>,
    Map<any, any>
>(
    getNewMessage,
    (state) => (state.get('attachments') || fromJS([])) as List<any>
)

export const isNewMessagePublic = createImmutableSelector<
    RootState,
    boolean,
    Map<any, any>
>(getNewMessage, (state) => (state.get('public') as boolean) || false)

export const isForward = createSelector<RootState, boolean, Map<any, any>>(
    getNewMessage,
    (message) => isForwardedMessage(message)
)

// in props usage
// property like 'to', 'from', 'cc', etc.
// ex: newMessageTo: getNewMessageSourceProperty('to')(state)
export const getNewMessageSourceProperty = (property: string) =>
    createImmutableSelector<RootState, Map<any, any>, Map<any, any>>(
        getNewMessageSource,
        (state) => (state.get(property) || fromJS({})) as Map<any, any>
    )

// in component usage
// ex: newMessageSourceProperty: makeGetNewMessageSourceProperty(state)
// then : const newMessageTo = newMessageSourceProperty('to')
export const makeGetNewMessageSourceProperty =
    (state: RootState) => (property: string) =>
        getNewMessageSourceProperty(property)(state)

export const getMandatoryContactProperties = () => () => {
    return [ReceiverProperty.To]
}

export const getOptionalContactProperties =
    (sourceType: TicketMessageSourceType) => () => {
        return sourceType === TicketMessageSourceType.Email
            ? [ReceiverProperty.Cc, ReceiverProperty.Bcc]
            : []
    }

// return all contact properties (mandatory + optional) for a source type
export const getContactProperties = (sourceType: TicketMessageSourceType) =>
    createImmutableSelector<
        RootState,
        ReceiverProperty[],
        ReceiverProperty[],
        ReceiverProperty[]
    >(
        getMandatoryContactProperties(),
        getOptionalContactProperties(sourceType),
        (mandatory, optional) => mandatory.concat(optional)
    )

export const getNewMessageMandatoryContactProperties = createImmutableSelector<
    RootState,
    ReceiverProperty[],
    ReceiverProperty[]
>(getMandatoryContactProperties(), (contactProperties) => contactProperties)

export const getNewMessageContactProperties = createImmutableSelector<
    RootState,
    ReceiverProperty[],
    TicketMessageSourceType
>(getNewMessageType, (sourceType) =>
    getContactProperties(sourceType)({} as RootState)
)

// true if mandatory contact properties (such as 'to') are not empty for current new message
export const areNewMessageContactPropertiesFulfilled = createImmutableSelector<
    RootState,
    boolean,
    ReceiverProperty[],
    ReturnType<typeof makeGetNewMessageSourceProperty>
>(
    getNewMessageMandatoryContactProperties,
    makeGetNewMessageSourceProperty,
    (mandatoryProperties, getFromSource) => {
        return mandatoryProperties.every((property) => {
            const value = getFromSource(property)
            return isImmutable(value) ? !value.isEmpty() : !!value
        })
    }
)

// return all recipients values merged in an immutable array
export const getNewMessageRecipients = createImmutableSelector<
    RootState,
    List<any>,
    ReceiverProperty[],
    ReturnType<typeof makeGetNewMessageSourceProperty>
>(
    getNewMessageContactProperties,
    makeGetNewMessageSourceProperty,
    (recipientProperties, getFromSource) => {
        return (
            recipientProperties
                //@ts-ignore ignoring the always true condition
                .filter((prop) => prop !== 'from')
                .reduce((result: List<any>, prop) => {
                    const recipients = getFromSource(prop)
                    let nextResult = result
                    recipients.forEach((recipient) => {
                        nextResult = result.push(fromJS(recipient))
                    })
                    return nextResult
                }, fromJS([]))
        )
    }
)

export const hasNewMessageRecipients = createSelector<
    RootState,
    boolean,
    List<any>
>(getNewMessageRecipients, (recipients) => !recipients.isEmpty())

export const hasAttachments = createSelector<RootState, boolean, Map<any, any>>(
    getNewMessage,
    (message) =>
        !((message.get('attachments') || fromJS([])) as List<any>).isEmpty()
)

// Determine if the new message is ready to be sent
export const isReady = createSelector<
    RootState,
    boolean,
    Map<any, any>,
    boolean,
    boolean,
    boolean,
    boolean
>(
    getNewMessage,
    hasNewMessageRecipients,
    hasAttachments,
    isNewMessagePublic,
    isForward,
    (
        newMessage,
        hasRecipients,
        hasAttachments,
        isNewMessagePublic,
        isForward
    ) => {
        const hasText = /\S/.test((newMessage.get('body_text') as string) || '')
        return (
            (hasText || hasAttachments || isForward) &&
            (hasRecipients || !isNewMessagePublic)
        )
    }
)

export const getNewMessageSignature = (state: RootState): Map<any, any> => {
    const sourceType = getNewMessageType(state)
    const sourceFrom = getNewMessageSourceProperty('from')(state)
    return getChannelSignature(
        sourceType as unknown as IntegrationType,
        sourceFrom.get('address')
    )(state)
}
