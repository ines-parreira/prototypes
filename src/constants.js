// View related

export const CELL_WIDTH = 60

export const TICKET_STATUSES = ['open', 'new', 'closed']

export const BASIC_OPERATORS = {
    eq: {
        label: 'is'
    },
    neq: {
        label: 'is not'
    }
}

export const DEFAULT_ACTIONS = [
    'addTags',
    'setStatus',
    'assignUser',
    'setResponseText',
    'setPriority',
    'http',
    'http_integration',
    'notify'
]

/**
 * Templates for custom actions.
 * Those templates are used by the front-end to generate the UI to create a new action (in the Macros Management).
 * Once it has been filled and saved by the user, it is saved in the Action table.
 * Then, when the macro will be used, the fields with no value will show up to be filled by the agent using the macro.
 */

export const ARGUMENT_TYPES = [
    'email',        // an email input
    'password',     // a password input
    'string',       // a standard text input
    'object',       // a dictionary ( input: textarea )
    'bool'          // a checkbox
]

export const ACTION_STATUS = ['pending', 'running', 'success', 'error', 'canceled']

export const ACTION_TEMPLATES = {
    setStatus: {
        execution: 'front',
        name: 'setStatus',
        title: '',
        arguments: {
            status: {
                type: 'string',
                enum: ['new', 'open', 'closed'],
                default: 'new'
            }
        }
    },
    addTags: {
        execution: 'front',
        name: 'addTags',
        title: '',
        arguments: {
            tags: {
                type: 'array'
            }
        }
    },
    setResponseText: {
        execution: 'front',
        name: 'setResponseText',
        title: '',
        arguments: {
            body_text: {
                type: 'string',
                default: ''
            },
            body_html: {
                type: 'string',
                format: 'html',
                default: ''
            }
        }
    },
    assignUser: {
        execution: 'front',
        name: 'assignUser',
        title: '',
        arguments: {
            assignee_user_id: {
                type: 'integer'
            }
        }
    },
    setPriority: {
        execution: 'front',
        name: 'setPriority',
        title: '',
        arguments: {
            priority: {
                type: 'string',
                enum: ['normal', 'high'],
                default: 'high'
            }
        }
    },
    http: {
        execution: 'back',
        name: 'http',
        title: '',
        arguments: {
            method: {
                type: 'string',
                enum: ['GET', 'PUT', 'POST', 'DELETE'],
                default: 'GET',
            },
            url: {
                type: 'string',
                format: 'url'
            },
            headers: {
                type: 'listDict',
                default: [],
                items: {
                    schema: {
                        key: {
                            type: 'string'
                        },
                        value: {
                            type: 'string'
                        },
                        editable: {
                            type: 'bool'
                        }
                    },
                    type: 'object'
                }
            },
            params: {
                type: 'listDict',
                default: [],
                items: {
                    schema: {
                        key: {
                            type: 'string'
                        },
                        value: {
                            type: 'string'
                        },
                        editable: {
                            type: 'bool'
                        }
                    },
                    type: 'object'
                }
            },
            contentType: {
                type: 'string',
                value: 'application/json'  // immutable since 'value' is set
            }
        }
    },
    httpIntegration: {
        execution: 'back',
        name: 'httpIntegration',
        title: '',
        arguments: {
            integration_id: {
                type: 'integer',
                choice: '{state.integrations.http}'
            }
        }
    },
    notify: {
        execution: 'back',
        name: 'notify',
        title: '',
        arguments: {
            email: {
                type: 'string',
                format: 'email',
                default: '{ticket.assignee_user.email}'
            },
            subject: {
                type: 'string',
                default: '{ticket.subject}',
                editable: true
            },
            content: {
                type: 'string',
                default: '{ticket.body_html}',
                editable: true
            }
        }
    }
}
