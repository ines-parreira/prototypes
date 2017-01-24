import * as types from './constants'
import * as userTypes from './../users/constants'
import {Map, List, fromJS} from 'immutable'
import {convertToHTML} from '../../utils'
import * as responseUtils from './responseUtils'
import ticketReplyCache from './ticketReplyCache'
import {
    getReceiversProperties,
} from './selectors'
import {ANSWERABLE_SOURCE_TYPES} from '../../config'

import _isUndefined from 'lodash/isUndefined'
import _get from 'lodash/get'
import _pick from 'lodash/pick'
import _assign from 'lodash/assign'
import _omit from 'lodash/omit'

import {
    getLastNonInternalNoteMessage,
    getSourceTypeOfResponse,
    getChannelFromSourceType,
} from './utils'

export const newMessage = (channel, sourceType) => fromJS({
    via: 'helpdesk',
    public: true,
    from_agent: true,
    receiver: null,
    sender: null,
    source: {
        type: sourceType,
        from: {}, // = ticket.messages[first].from_agent ? ticket.messages[first].source.from : ... .to
        to: [],
        cc: [],
        bcc: [],
    },
    subject: '',
    body_text: '',
    body_html: '',
    channel,
    attachments: [],
    macros: []
})

export const initialState = fromJS({
    state: {
        dirty: false,
        query: '',
        signatureAdded: false,
        forceUpdate: false,
        contentState: null,
        selectionState: null,
        appliedMacro: null,
        latestEventDatetime: null
    },
    _internal: {
        displayHistory: false,
        shouldDisplayHistoryOnNextPage: false,
        loading: {
            addAttachment: false,
            fetchTicket: false,
            submitMessage: false,
            deleteMessage: false,
            updateMessageIds: [] // store the ids of all the messages being updated
        },
    },
    messages: [],
    customer_ratings: [],
    subject: '',
    via: 'helpdesk',
    channel: 'email',
    assignee_user: null,
    status: 'new',
    sender: null,
    requester: null,
    receiver: null,
    priority: 'normal',
    tags: [],
    newMessage: newMessage('email', 'email')
})

export default (state = initialState, action) => {
    let tags

    switch (action.type) {
        case types.ADD_ATTACHMENT_START:
            return state.setIn(['_internal', 'loading', 'addAttachment'], true)

        case types.ADD_ATTACHMENT_SUCCESS: {
            let newState = state

            if (action.ticketId === state.get('id')) {
                newState = newState.mergeDeep({
                    newMessage: {
                        attachments: state.getIn(['newMessage', 'attachments']).concat(action.resp)
                    },
                    state: {
                        dirty: true
                    }
                })
            }

            return newState.setIn(['_internal', 'loading', 'addAttachment'], false)
        }

        case types.ADD_ATTACHMENTS:
            return state.updateIn(
                ['newMessage', 'attachments'],
                fromJS([]),
                (attachements => attachements.concat(action.args.get('attachments').toJS()))
            )

        case types.ADD_ATTACHMENT_ERROR:
            return state.setIn(['_internal', 'loading', 'addAttachment'], false)

        case types.DELETE_ATTACHMENT:
            return state
                .setIn(['newMessage', 'attachments'], state.getIn(['newMessage', 'attachments']).delete(action.index))
                .setIn(['state', 'dirty'], true)

        case types.RECORD_MACRO:
            return state.setIn(
                ['newMessage', 'macros'],
                state.getIn(['newMessage', 'macros']).push({id: action.macro.get('id')})
            )

        case types.SUBMIT_TICKET_MESSAGE_START: {
            return state.mergeDeep({
                state: {
                    dirty: false
                },
                _internal: {
                    loading: {
                        submitMessage: true
                    }
                }
            })
        }

        case types.UPDATE_TICKET_MESSAGE_START: {
            return state.mergeDeep({
                _internal: {
                    loading: {
                        updateMessageIds: [action.messageId]
                    }
                }
            })
        }

        case types.SUBMIT_TICKET_START:
            // Make sure we reset the cache before we send the message
            ticketReplyCache.delete(state.get('id'))
            return state.setIn(['_internal', 'loading', 'submitMessage'], true)

        case types.SUBMIT_TICKET_ERROR:
        case types.SUBMIT_TICKET_MESSAGE_ERROR:
            return state.setIn(['_internal', 'loading', 'submitMessage'], false)

        case types.DELETE_TICKET_MESSAGE_START:
            return state.setIn(['_internal', 'loading', 'deleteMessage'], true)

        case types.DELETE_TICKET_MESSAGE_ERROR:
            return state.setIn(['_internal', 'loading', 'deleteMessage'], false)

        case types.SUBMIT_TICKET_SUCCESS: {
            if (action.resp.id !== state.get('id') && state.get('id')) {
                return state
            }

            // Make sure we reset the cache before we send the message
            ticketReplyCache.delete(state.get('id'))

            const newState = state
                .merge(fromJS(action.resp))
                .mergeDeep({
                    state: {
                        dirty: false,
                        contentState: null,
                        selectionState: null,
                        signatureAdded: false,
                        appliedMacro: null,
                        query: ''
                    }
                })
                .setIn(['_internal', 'loading', 'submitMessage'], false)

            return action.resetMessage ? newState.set('newMessage', newMessage(
                action.resp.channel,
                getSourceTypeOfResponse(newState.get('messages'))
            )) : newState
        }

        case types.SUBMIT_TICKET_MESSAGE_SUCCESS: {
            // Make sure we reset the cache before we send the message
            ticketReplyCache.delete(action.resp.ticket_id)

            // If we changed the displayed ticket (e.g. submit and close), we dont want to change the state.
            if (action.resp.ticket_id !== state.get('id') && state.get('id')) {
                return state
            }

            let newState = state
            const respMessage = fromJS(action.resp)

            // We can't just concatenate since we might get duplicates. So we merge on message id.
            const existingIndex = newState.get('messages').findIndex((m) => m.get('id') === respMessage.get('id'))
            if (~existingIndex) {
                newState = newState.setIn(['messages', existingIndex], respMessage)
            } else {
                newState = newState.set('messages', newState.get('messages').push(respMessage))
            }

            newState = newState.mergeDeep({
                state: {
                    dirty: false,
                    contentState: null,
                    selectionState: null,
                    signatureAdded: false,
                    query: ''
                }
            }).setIn(['_internal', 'loading', 'submitMessage'], false)


            return action.resetMessage ? newState.set('newMessage', newMessage(
                action.resp.channel,
                getSourceTypeOfResponse(newState.get('messages'))
            )) : newState
        }

        case types.FETCH_TICKET_START: {
            if (action.displayLoading) {
                return state.setIn(['_internal', 'loading', 'fetchTicket'], true)
            }
            return state
        }

        case types.FETCH_TICKET_SUCCESS: {
            // if discreet, only update messages
            if (!action.displayLoading) {
                const messages = _get(action, ['resp', 'messages'], [])
                const requesterCustomer = fromJS(_get(action, ['resp', 'requester', 'customer'], {}))

                return state
                    .set('messages', state.get('messages', fromJS([])).mergeDeep(messages))
                    .setIn(['requester', 'customer'], requesterCustomer)
            }

            const newState = state.merge(fromJS(action.resp))
            let sourceType = getSourceTypeOfResponse(newState.get('messages'))

            // if channel is not supported, suggest email answer
            if (!ANSWERABLE_SOURCE_TYPES.includes(sourceType)) {
                sourceType = 'email'
            }

            return newState.set('newMessage', newMessage(
                getChannelFromSourceType(sourceType),
                sourceType
            ))
                .mergeDeep({
                    state: {
                        dirty: false,
                        contentState: null,
                        selectionState: null,
                        signatureAdded: false,
                        query: ''
                    }
                })
                .setIn(['_internal', 'loading', 'fetchTicket'], false)
        }

        case types.FETCH_TICKET_ERROR: {
            return state.setIn(['_internal', 'loading', 'fetchTicket'], false)
        }

        case types.FETCH_MESSAGE_SUCCESS: {
            if (!_isUndefined(state.get('id')) && state.get('id') === action.resp.ticket_id) {
                return state.setIn(
                    ['messages', state.get('messages').findIndex(message => message.get('id') === action.resp.id)],
                    fromJS(action.resp)
                ).setIn(
                    ['_internal', 'loading', 'updateMessageIds'],
                    state.getIn(['_internal', 'loading', 'updateMessageIds']).filter(v => v !== action.resp.id)
                )
            }

            return state
        }

        case types.CLEAR_TICKET: {
            // @todo(martin): re-set `crossTickets` in _internal
            return initialState.setIn(
                ['_internal', 'shouldDisplayHistoryOnNextPage'],
                state.getIn(['_internal', 'shouldDisplayHistoryOnNextPage'])
            )
        }

        /* Macro actions */
        case types.ADD_TICKET_TAGS: {
            tags = state.get('tags', List())
            const existingTagNames = tags.map((x) => x.get('name'))

            let newTags = action.args.get('tags')
            if (newTags) {
                newTags = newTags.split(',').map(t => t.trim())
            } else {
                newTags = []
            }

            for (const tag of newTags) {
                if (!existingTagNames.includes(tag)) {
                    tags = tags.push(Map({name: tag}))
                }
            }
            return state.set('tags', tags)
        }

        case types.REMOVE_TICKET_TAG:
            return state.set('tags', state.get('tags').delete(action.index))

        case types.SET_TAGS:
            return state.set('tags', fromJS(action.args.get('tags')))

        case types.TOGGLE_PRIORITY:
            if (action.args.get('priority')) {
                return state.set('priority', action.args.get('priority'))
            }

            return state.get('priority') === 'normal' ? state.set('priority', 'high') : state.set('priority', 'normal')

        case types.SET_AGENT:
            return state.set(
                'assignee_user',
                action.args.get('assignee_user') ? fromJS(action.args.get('assignee_user')) : null
            )

        case types.SET_STATUS:
            if (action.args.get('id') && action.args.get('id') !== state.get('id')) {
                return state
            }
            return state.set('status', action.args.get('status'))

        case types.SET_PUBLIC:
            return state.setIn(['newMessage', 'public'], action.isPublic)

        case types.SET_SUBJECT:
            return state.set('subject', action.args.get('subject'))

        case types.SET_SOURCE_TYPE: {
            let newState = state

            if (action.sourceType !== 'internal-note') {
                newState = newState.setIn(['newMessage', 'channel'], getChannelFromSourceType(action.sourceType))
            } else {
                // For an internal note, we infer the channel from the last non-internal note message.
                const lastSourceType = getLastNonInternalNoteMessage(state.get('messages')).getIn(['source', 'type'])
                newState = newState.setIn(['newMessage', 'channel'], getChannelFromSourceType(lastSourceType))
            }

            return newState
                .setIn(['newMessage', 'source', 'type'], action.sourceType)
                .setIn(['newMessage', 'public'], action.sourceType !== 'internal-note')
        }

        case types.APPLY_MACRO: {
            ticketReplyCache.set(action.ticketId, {
                macro: action.macro
            })
            return state.setIn(['state', 'appliedMacro'], action.macro)
        }

        case types.CLEAR_APPLIED_MACRO: {
            ticketReplyCache.set(action.ticketId, {
                macro: null
            })
            return state.setIn(['state', 'appliedMacro'], null)
        }

        case types.UPDATE_ACTION_ARGS_ON_APPLIED: {
            const updatedCache = ticketReplyCache
                .get(action.ticketId)
                .setIn(['macro', 'actions', action.actionIndex.toString(), 'arguments'], action.value)
            ticketReplyCache.set(action.ticketId, updatedCache)
            return state.setIn(['state', 'appliedMacro', 'actions', action.actionIndex.toString(), 'arguments'],
                action.value)
        }

        case types.DELETE_ACTION_ON_APPLIED: {
            const cachedMacro = ticketReplyCache.get(action.ticketId)
            if (cachedMacro.get('macro')) {
                const updatedCache = cachedMacro.deleteIn(['macro', 'actions', action.actionIndex.toString()])
                ticketReplyCache.set(action.ticketId, updatedCache)
            }
            return state.deleteIn(['state', 'appliedMacro', 'actions', action.actionIndex.toString()])
        }

        case types.FETCH_TICKET_REPLY_MACRO: {
            const cache = ticketReplyCache.get(action.ticketId).get('macro')
            return state.setIn(['state', 'appliedMacro'], cache)
        }

        case types.SET_RESPONSE_TEXT: {
            let contentState = action.args.get('contentState') || state.getIn(['state', 'contentState'])
            let selectionState = action.args.get('selectionState') || state.getIn(['state', 'selectionState'])
            const appliedMacro = state.getIn(['state', 'appliedMacro'])

            let context = {
                action,
                state,
                contentState,
                selectionState,
                appliedMacro
            }

            context = responseUtils.getCache(context)
            // only deal with signature when email
            if (state.getIn(['newMessage', 'channel']) === 'email') {
                context = responseUtils.addSignature(context)
            }
            context = responseUtils.applyMacro(context)
            responseUtils.updateCache(context)

            contentState = context.contentState
            selectionState = context.selectionState

            const dirty = contentState && contentState.hasText() && !responseUtils.onlySignature(contentState,
                    action.currentUser)
            return context.state.mergeDeep({
                newMessage: {
                    body_text: contentState ? contentState.getPlainText() : '',
                    body_html: contentState ? convertToHTML(contentState) : ''
                },
                state: {
                    dirty,
                    forceUpdate: !!context.forceUpdate,
                    signatureAdded: !!context.signatureAdded
                }
            })
            // not in the mergeDeep because it would be merged with the previous contentState instead of replacing it
                .setIn(['state', 'contentState'], contentState)
                .setIn(['state', 'selectionState'], selectionState)
        }

        case types.SET_RECEIVERS: {
            let newState = state
            const receivers = _pick(action.receivers, getReceiversProperties())
            const replaceAll = action.replaceAll

            const currentSource = newState.getIn(['newMessage', 'source'], fromJS({})).toJS()

            let newReceivers = {}
            if (replaceAll) { // we replace all receivers in source by passed ones
                newReceivers = receivers
            } else { // we merge existing receivers with passed ones
                const currentReceivers = _pick(currentSource, getReceiversProperties())
                newReceivers = _assign(currentReceivers, receivers)
            }

            // removing current receivers from source
            const sourceWithoutReceivers = _omit(currentSource, getReceiversProperties())

            // setting new receivers in source
            newState = newState.setIn(['newMessage', 'source'], fromJS(_assign(sourceWithoutReceivers, newReceivers)))

            // completing receiver property based on receivers source data
            const toReceivers = newState.getIn(['newMessage', 'source', 'to'], fromJS([])).toJS()

            if (toReceivers.length) {
                const firstReceiver = toReceivers[0]
                let storedData = firstReceiver.id
                    ? {id: firstReceiver.id}
                    : {email: firstReceiver.address}
                storedData = fromJS(storedData)

                if (!newState.getIn(['newMessage', 'receiver'])) {
                    newState = newState.setIn(['newMessage', 'receiver'], storedData)
                }
            } else {
                if (!newState.getIn(['newMessage', 'source', 'to']).size) {
                    newState = newState.setIn(['newMessage', 'receiver'], null)
                }
            }

            return newState
        }

        case types.MARK_TICKET_DIRTY:
            return state.setIn(['state', 'dirty'], action.dirty)

        case types.DELETE_TICKET_MESSAGE_SUCCESS:
            return state
                .set(
                    'messages',
                    state.get('messages').delete(
                        state.get('messages').findIndex(message => message.get('id') === action.messageId)
                    )
                )
                .setIn(['_internal', 'loading', 'deleteMessage'], false)

        case types.TOGGLE_HISTORY: {
            const displayHistory = action.state !== undefined
                ? action.state
                : !state.getIn(['_internal', 'displayHistory'])

            return state.setIn(['_internal', 'displayHistory'], displayHistory)
        }

        case types.DISPLAY_HISTORY_ON_NEXT_PAGE:
            return state.setIn(['_internal', 'shouldDisplayHistoryOnNextPage'], fromJS(action.state))

        case userTypes.MERGE_USERS_SUCCESS: {
            if (action.resp && state.getIn(['requester', 'id']) === action.resp.id) {
                return state.set('requester', fromJS(action.resp))
            }
            return state
        }

        default:
            return state
    }
}
