export const ADD_RULE_START = 'ADD_RULE_START'
export const ADD_RULE_END = 'ADD_RULE_END'
export const DEACTIVATE_RULE = 'DEACTIVATE_RULE'
export const ACTIVATE_RULE = 'ACTIVATE_RULE'
export const REMOVE_RULE = 'REMOVE_RULE'

export const RULES_REQUESTS_POSTS = 'RULES_REQUESTS_POSTS'
export const RULES_RECEIVE_POSTS = 'RULES_RECEIVE_POSTS'

export const RULES_UPDATE_CODE_AST = 'RULES_UPDATE_CODE_AST'
export const RULES_ADD_ACTION_CODE_AST = 'RULES_ADD_ACTION_CODE_AST'
export const RULES_INITIALISE_CODE_AST = 'RULES_INITIALISE_CODE_AST'

// Map between rules and objects in the rule code
export const OBJECT_DEFINITIONS = {
    ticket: 'Ticket',
    message: 'TicketMessage',
    event: 'Event',
    user: 'User'
}

/* Constants for action default state */
const NOTIFY_ACTION_DEFAULT = {
    subject: '{ticket.subject}',
    body_text: '{message.body_text}',
    body_html: '{message.body_html}',
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

const SET_PRIORITY_ACTION_DEFAULT = {
    priority: 'high',
}

export const ACTION_DEFAULT_STATE = {
    notify: NOTIFY_ACTION_DEFAULT,
    addTags: ADD_TAGS_ACTION_DEFAULT,
    setTags: SET_TAGS_ACTION_DEFAULT,
    setStatus: SET_STATUS_ACTION_DEFAULT,
    setPriority: SET_PRIORITY_ACTION_DEFAULT,
}

export const DEFAULT_IF_STATEMENT = {
    type: 'Program',
    sourceType: 'script',
    body: [
        {
            type: 'IfStatement',
            test: {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: 'eq'
                },
                arguments: [
                    {
                        type: 'MemberExpression',
                        computed: false,
                        object: {
                            type: 'Identifier',
                            name: 'ticket'
                        },
                        property: {
                            type: 'Identifier',
                            name: 'status'
                        }
                    },
                    {
                        type: 'Literal',
                        value: 'open',
                        raw: '\'open\''
                    }
                ],
            },
            consequent: {
                body: [],
                type: 'BlockStatement',
            },
            alternate: null,
        },
    ],
}
