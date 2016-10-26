/**
 * Action related
 */
// remember to keep them uppercase in the array below
export const AVAILABLE_HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE']

/**
 * Timeformat related
 */

export const AVAILABLE_LANGUAGES = [
    {
        localeName: 'en',
        displayName: 'English US'
    },
    {
        localeName: 'fr',
        displayName: 'French'
    },
]

/**
 * View related
 */
export const ACTIVITY_DISPLAY_COUNT = 6

export const TICKET_STATUSES = ['open', 'new', 'closed']

export const BASIC_OPERATORS = {
    eq: {
        label: 'is'
    },
    neq: {
        label: 'is not'
    }
}

export const VIEW_TYPE_CONFIGURATION = {
    'ticket-list': {
        routeItem: 'ticket', // UI route for this object
        routeList: 'tickets', // UI route for the list of those objects
        api: 'tickets', // api endpoint for this object
        singular: 'ticket', // singular version for sentences
        plural: 'tickets' // plural version for sentences
    },
    'user-list': {
        routeItem: 'user',
        routeList: 'users',
        api: 'users',
        singular: 'user',
        plural: 'users'
    }
}

/**
 * Ticket-related
 */
// This is a utility map to get the right property name when setting the source on a message
// Basically will be used in: source.setIn(['source', 'to', {PROPERTY_NAME}], identifier/address)
export const SOURCE_VALUE_PROP = {
    email: 'address',
    chat: 'smooch_id',
    api: null,
    'facebook-message': 'name',
    'facebook-comment': 'name',
    'facebook-post': 'name'
}

export const USER_VALUE_PROP = {
    email: 'email',
    chat: null,
    api: null,
    'facebook-message': 'name',
    'facebook-comment': 'name',
    'facebook-post': 'name'
}

export const USER_CHANNEL_CLASS = {
    email: 'icon mail',
    twitter: 'icon twitter',
    facebook: 'icon facebook square',
    chat: 'icon comments',
    phone: 'icon phone',
}

/**
 * Widget related
 */
export const DEFAULT_SOURCE_PATHS = {
    ticket: [
        'ticket.requester.customer'
    ],
    user: [
        'user.customer'
    ]
}

/**
 * Integration-related
 */
// Semantic icons for integration types.
export const INTEGRATION_TYPE_TO_ICON = {
    email: 'mail icon',
    facebook: 'facebook square icon',
    http: 'feed icon',
    twitter: 'twitter icon',
    segment: 'square icon',
    smooch: 'comments icon'
}

// A list of integration types along with descriptions that will be displayed in the integrations summary
export const INTEGRATION_TYPE_DESCRIPTIONS = [
    // {
    //     type: 'email',
    //     description: 'Connect your support inboxes'
    // },
    {
        type: 'facebook',
        title: 'Facebook',
        description: 'Connect your Facebook pages'
    },
    {
        type: 'smooch',
        title: 'Smooch',
        description: 'Chat with your users'
    },
    {
        type: 'http',
        title: 'HTTP',
        description: 'Connect to anything over HTTP'
    },
    // {
    //     type: 'twitter',
    //     description: 'Connect your twitter account'
    // },
    // {
    //     type: 'segment',
    //     description: 'Sync data with all your apps'
    // }
]

/**
 * Templates for custom actions.
 * Those templates are used by the front-end to generate the UI to create a new action (in the Macros Management).
 * Once it has been filled and saved by the user, it is saved in the Action table.
 * Then, when the macro will be used, the fields with no value will show up to be filled by the agent using the macro.
 */

export const DEFAULT_ACTIONS = [
    'addTags',
    'setStatus',
    'assignUser',
    'setResponseText',
    'setPriority',
    'addAttachments',
    'http',
    // 'http_integration',
    'notify'
]

export const ARGUMENT_TYPES = [
    'email',        // an email input
    'password',     // a password input
    'string',       // a standard text input
    'object',       // a dictionary ( input: textarea )
    'bool',         // a checkbox
    'array'
]

export const ACTION_STATUS = ['pending', 'running', 'success', 'error', 'canceled']


export const ACTION_TEMPLATES = {
    addAttachments: {
        execution: 'front',
        name: 'addAttachments',
        title: '',
        arguments: {
            attachments: {
                type: 'listDict',
                default: []
            }
        }
    },
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
                enum: AVAILABLE_HTTP_METHODS,
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

/**
 * Notifications related
 */
export const NOTIFICATIONS_STYLE_CONFIG = {
    Containers: {
        DefaultStyle: {
            maxWidth: '500px',
            width: 'initial',
            display: 'inline-block'
        },
        tc: {
            left: 0,
            right: 0
        }
    },
    NotificationItem: {
        DefaultStyle: {
            padding: '1em 1.5em',
            fontSize: '1em'
        },
        success: {
            border: '1px solid #A3C293',
            backgroundColor: '#FCFFF5',
            color: '#2C662D'
        },
        error: {
            border: '1px solid #E0B4B4',
            backgroundColor: '#FFF6F6',
            color: '#9F3A38'
        },
        warning: {
            border: '1px solid #C9BA9B',
            backgroundColor: '#FFFA9B',
            color: '#573A08'
        },
        info: {
            border: '1px solid #A9D5DE',
            backgroundColor: '#F8FFFF',
            color: '#276F86'
        }
    },
    Title: {
        DefaultStyle: {
            fontSize: '1.14em'
        },
        success: {
            color: '#1A531B'
        },
        error: {
            color: '#912D2B'
        },
        warning: {
            color: '#794B02'
        },
        info: {
            color: '#0E566C'
        }
    },
    Dismiss: {
        DefaultStyle: {
            display: 'none'
        }
    }
}
