export const ADD_RULE_START = 'ADD_RULE_START'
export const ADD_RULE_END = 'ADD_RULE_END'
export const DEACTIVATE_RULE = 'DEACTIVATE_RULE'
export const ACTIVATE_RULE = 'ACTIVATE_RULE'
export const REMOVE_RULE = 'REMOVE_RULE'

export const UPDATE_ORDER_START = 'UPDATE_ORDER_START'
export const UPDATE_ORDER_ERROR = 'UPDATE_ORDER_ERROR'

export const RULES_REQUESTS_POSTS = 'RULES_REQUESTS_POSTS'
export const RULES_RECEIVE_POSTS = 'RULES_RECEIVE_POSTS'

export const RULES_UPDATE_CODE_AST = 'RULES_UPDATE_CODE_AST'
export const RULES_INITIALISE_CODE_AST = 'RULES_INITIALISE_CODE_AST'

export const UPDATE_RULE_START = 'UPDATE_RULE_START'
export const UPDATE_RULE_SUCCESS = 'UPDATE_RULE_SUCCESS'
export const UPDATE_RULE_ERROR = 'UPDATE_RULE_ERROR'

export const RESET_RULE_SUCCESS = 'RESET_RULE_SUCCESS'

export const RULE_UPDATED = 'RULE_UPDATED'

// Map between rules and objects in the rule code
export const OBJECT_DEFINITIONS = {
    ticket: 'Ticket',
    message: 'TicketMessage',
}

/* Constants for action default state */
const NOTIFY_ACTION_DEFAULT = {
    subject: '{ticket.subject}',
    body_text: '{message.body_text}',
    body_html: '{message.body_html}',
}

const SEND_EMAIL_ACTION_DEFAULT = {
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body_text: '',
    body_html: '',
}

const REPLY_TO_TICKET_ACTION_DEFAULT = {
    body_text: '',
    body_html: '',
}

const ADD_TAGS_ACTION_DEFAULT = {
    tags: '',
}

const SET_TAGS_ACTION_DEFAULT = {
    tags: '',
}

const SET_STATUS_ACTION_DEFAULT = {
    status: 'closed',
}

const SET_SUBJECT_ACTION_DEFAULT = {
    subject: '',
}

const APPLY_MACRO_ACTION_DEFAULT = {
    macro: '',
}

const ASSIGN_USER_ACTION_DEFAULT = {
    assignee_user: '', // means unassigned
}

const ASSIGN_TEAM_ACTION_DEFAULT = {
    assignee_team: '', // means unassigned
}

const SNOOZE_ACTION_DEFAULT = {
    snooze_timedelta: '1d',
}

export const ACTION_DEFAULT_STATE = {
    applyMacro: APPLY_MACRO_ACTION_DEFAULT,
    sendEmail: SEND_EMAIL_ACTION_DEFAULT,
    notify: NOTIFY_ACTION_DEFAULT,
    addTags: ADD_TAGS_ACTION_DEFAULT,
    setTags: SET_TAGS_ACTION_DEFAULT,
    setStatus: SET_STATUS_ACTION_DEFAULT,
    setSubject: SET_SUBJECT_ACTION_DEFAULT,
    setAssignee: ASSIGN_USER_ACTION_DEFAULT,
    setTeamAssignee: ASSIGN_TEAM_ACTION_DEFAULT,
    replyToTicket: REPLY_TO_TICKET_ACTION_DEFAULT,
    snoozeTicket: SNOOZE_ACTION_DEFAULT,
}

export const DEFAULT_STATEMENT = {
    type: 'Program',
    sourceType: 'script',
    body: [],
}
