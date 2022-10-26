// Update a message (retry failed actions or sending, or force sending)
import {TicketChannel} from '../../business/types/ticket'

export const UPDATE_TICKET_MESSAGE_START = 'UPDATE_TICKET_MESSAGE_START'
export const UPDATE_TICKET_MESSAGE_SUCCESS = 'UPDATE_TICKET_MESSAGE_SUCCESS'
export const UPDATE_TICKET_MESSAGE_ERROR = 'UPDATE_TICKET_MESSAGE_ERROR'

export const DELETE_TICKET_ERROR = 'DELETE_TICKET_ERROR'

export const TICKET_MESSAGE_DELETED = 'TICKET_MESSAGE_DELETED'

// Reply to a ticket
export const SUBMIT_TICKET_SUCCESS = 'SUBMIT_TICKET_SUCCESS'

// Fetching a single ticket life-cycle
export const FETCH_TICKET_START = 'FETCH_TICKET_START'
export const FETCH_TICKET_SUCCESS = 'FETCH_TICKET_SUCCESS'
export const FETCH_TICKET_ERROR = 'FETCH_TICKET_ERROR'

export const CLEAR_TICKET = 'CLEAR_TICKET'

export const FETCH_TICKET_REPLY_MACRO = 'FETCH_TICKET_REPLY_MACRO'

export const TICKET_PARTIAL_UPDATE_START = 'TICKET_PARTIAL_UPDATE_START'
export const TICKET_PARTIAL_UPDATE_SUCCESS = 'TICKET_PARTIAL_UPDATE_SUCCESS'
export const TICKET_PARTIAL_UPDATE_ERROR = 'TICKET_PARTIAL_UPDATE_ERROR'

export const DISPLAY_TICKET_AUDIT_LOG_EVENTS = 'DISPLAY_TICKET_AUDIT_LOG_EVENTS'
export const HIDE_TICKET_AUDIT_LOG_EVENTS = 'HIDE_TICKET_AUDIT_LOG_EVENTS'

export const ADD_TICKET_AUDIT_LOG_EVENTS = 'ADD_TICKET_AUDIT_LOG_EVENTS'
export const REMOVE_TICKET_AUDIT_LOG_EVENTS = 'REMOVE_TICKET_AUDIT_LOG_EVENTS'

// Macro actions
export const ADD_TICKET_TAGS = 'addTags'
export const SET_SPAM_START = 'setSpamStart'
export const SET_SPAM_SUCCESS = 'setSpamSuccess'
export const SET_TRASHED_START = 'setTrashedStart'
export const SET_TRASHED_SUCCESS = 'setTrashedSuccess'
export const SET_STATUS = 'setStatus'
export const SET_AGENT = 'setAssignee'
export const SET_TEAM = 'setTeamAssignee'
export const SET_SUBJECT = 'setSubject'
export const SNOOZE_TICKET = 'snoozeTicket'
export const ADD_INTERNAL_NOTE = 'addInternalNote'
export const SEND_EMAIL = 'sendEmail'

export const SET_CUSTOMER = 'setCustomer'

export const REMOVE_TICKET_TAG = 'REMOVE_TICKET_TAG'
export const SET_TICKET_MESSAGE_REQUEST = 'SET_TICKET_MESSAGE_REQUEST'
export const SET_TICKET_MESSAGE_REQUEST_ERROR =
    'SET_TICKET_MESSAGE_REQUEST_ERROR'
export const REMOVE_TICKET_MESSAGE_REQUEST = 'REMOVE_TICKET_MESSAGE_REQUEST'
export const REMOVE_TICKET_MESSAGE_REQUEST_ERROR =
    'REMOVE_TICKET_MESSAGE_REQUEST_ERROR'

export const UPDATE_ACTION_ARGS_ON_APPLIED = 'UPDATE_ACTION_ARGS_ON_APPLIED'
export const DELETE_ACTION_ON_APPLIED = 'DELETE_ACTION_ON_APPLIED'
export const APPLY_MACRO = 'APPLY_MACRO'
export const CLEAR_APPLIED_MACRO = 'CLEAR_APPLIED_MACRO'
export const SET_TOP_RANK_MACRO_STATE = 'SET_TOP_RANK_MACRO_STATE'

export const MARK_TICKET_DIRTY = 'MARK_TICKET_DIRTY'

export const DELETE_TICKET_MESSAGE_SUCCESS = 'DELETE_TICKET_MESSAGE_SUCCESS'
export const DELETE_TICKET_MESSAGE_ERROR = 'DELETE_TICKET_MESSAGE_ERROR'

export const DELETE_TICKET_PENDING_MESSAGE = 'DELETE_TICKET_PENDING_MESSAGE'

export const SEND_INTENT_FEEDBACK_SUCCESS = 'SEND_INTENT_FEEDBACK_SUCCESS'

export const TOGGLE_HISTORY = 'TOGGLE_HISTORY'

// State-related
export const DISPLAY_HISTORY_ON_NEXT_PAGE = 'DISPLAY_HISTORY_ON_NEXT_PAGE'

// Merge events from sockets updates coming from server
export const MERGE_TICKET = 'MERGE_TICKET'
export const MERGE_CUSTOMER = 'MERGE_CUSTOMER'
export const MERGE_CUSTOMER_EXTERNAL_DATA = 'MERGE_CUSTOMER_EXTERNAL_DATA'

export const TICKET_CHANNEL_NAMES: Record<TicketChannel, string> =
    Object.freeze({
        [TicketChannel.Aircall]: 'Aircall',
        [TicketChannel.Api]: 'Api',
        [TicketChannel.Chat]: 'Chat',
        [TicketChannel.Email]: 'Email',
        [TicketChannel.Facebook]: 'Facebook',
        [TicketChannel.FacebookMention]: 'Facebook Mention',
        [TicketChannel.FacebookMessenger]: 'Facebook Messenger',
        [TicketChannel.FacebookRecommendations]: 'Facebook Recommendations',
        [TicketChannel.InstagramAdComment]: 'Instagram Ad Comment',
        [TicketChannel.InstagramComment]: 'Instagram Comment',
        [TicketChannel.InstagramMention]: 'Instagram Mention',
        [TicketChannel.InstagramDirectMessage]: 'Instagram Direct Message',
        [TicketChannel.Phone]: 'Phone',
        [TicketChannel.Sms]: 'Sms',
        [TicketChannel.Twitter]: 'Twitter',
        [TicketChannel.TwitterDirectMessage]: 'Twitter Direct Message',
        [TicketChannel.YotpoReview]: 'Yotpo Review',
        [TicketChannel.HelpCenter]: 'Help Center',
    })

export const EMPTY_SENDER = {name: '', address: ''}

// Chat-related
export const SET_TYPING_ACTIVITY_SHOPPER = 'SET_TYPING_ACTIVITY_SHOPPER'
export const TYPING_ACTIVITY_SHOPPER_TIMEOUT_MS = 4000
