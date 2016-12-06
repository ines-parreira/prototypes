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
export const BASIC_OPERATORS = {
    eq: {
        label: 'is'
    },
    neq: {
        label: 'is not'
    }
}

export const EMPTY_OPERATORS = {
    isEmpty: {
        label: 'is empty'
    },
    isNotEmpty: {
        label: 'is not empty'
    }
}

export const VIEW_TYPE_CONFIGURATION = {
    'ticket-list': {
        type: 'ticket-list',
        routeItem: 'ticket', // UI route for this object
        routeList: 'tickets', // UI route for the list of those objects
        api: 'tickets', // api endpoint for this object
        singular: 'ticket', // singular version for sentences
        plural: 'tickets' // plural version for sentences
    },
    'user-list': {
        type: 'user-list',
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
    phone: 'address',
    'ottspot-call': 'address',
    chat: 'smooch_id',
    api: null,
    'facebook-message': 'name',
    'facebook-comment': 'name',
    'facebook-post': 'name'
}

export const USER_CHANNEL_CLASS = {
    email: 'icon mail',
    twitter: 'icon twitter',
    facebook: 'icon facebook square',
    'facebook-account': 'icon facebook square',
    'facebook-message': 'icon facebook-messenger',
    chat: 'icon comments',
    phone: 'icon phone',
    'ottspot-call': 'icon phone',
}

export const TICKET_STATUSES = ['open', 'new', 'closed']
export const CHANNELS = ['email', 'phone', 'sms', 'chat', 'twitter', 'facebook', 'api']
export const VIA = CHANNELS.concat(['form', 'helpdesk', 'app', 'rule'])
export const ANSWERABLE_SOURCE_TYPES = ['email', 'chat', 'facebook-post', 'facebook-comment', 'facebook-message']

/**
 * Widget related
 */
export const DEFAULT_SOURCE_PATHS = {
    ticket: [
        'ticket.requester.customer',
        // 'ticket.requester.customer._shopify',
    ],
    user: [
        'user.customer',
        // 'user.customer._shopify',
    ]
}

/**
 * Integration-related
 */

// A list of integration types along with descriptions that will be displayed in the integrations summary
export const INTEGRATION_TYPE_DESCRIPTIONS = [
    {
        type: 'facebook',
        title: 'Facebook',
        description: 'Create tickets when your customers post on your page or contact you on Messenger',
        image: 'integrations/facebook.png',
    },
    {
        type: 'smooch',
        title: 'Chat',
        description: 'Add a chat on your website',
        image: 'integrations/chat.png',
    },
    {
        type: 'http',
        title: 'HTTP',
        description: 'Connect any application to Gorgias',
        image: 'integrations/http.png',
    },
    {
        type: 'shopify',
        title: 'Shopify',
        description: 'Display customer profiles & orders next to tickets. Edit orders with macros',
        image: 'integrations/shopify.png',
    },
    {
        title: 'WooCommerce',
        description: 'Display customer profiles & orders next to tickets. Edit orders with macros',
        url: 'http://help.gorgias.io/en/latest/src/helpdesk/01-integrations.html#woocommerce',
        image: 'integrations/woocommerce.png',
    },
    {
        title: 'Salesforce',
        description: 'Display customer information next to tickets',
        url: 'http://help.gorgias.io/en/latest/src/helpdesk/01-integrations.html#salesforce',
        image: 'integrations/salesforce.png',
    },
    {
        title: 'Shipstation',
        description: 'Display shipping info next to tickets',
        url: 'http://help.gorgias.io/en/latest/src/helpdesk/01-integrations.html#shipstation',
        image: 'integrations/shipstation.png',
    },
    {
        title: 'Slack',
        description: 'Post notifications on Slack when tickets are created or updated',
        url: 'http://help.gorgias.io/en/latest/src/helpdesk/01-integrations.html#slack',
        image: 'integrations/slack.png',
    },
    {
        title: 'Zapier',
        description: 'Trigger zaps with macros',
        url: 'http://help.gorgias.io/en/latest/src/helpdesk/01-integrations.html#zapier',
        image: 'integrations/zapier.png',
    }
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
    'notify'
]

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
                type: 'string'
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
            form: {
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
            json: {
                type: 'dict',
                format: 'json'
            },
            content_type: {
                type: 'string',
                default: 'application/json'
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

export const VIEW_FIELDS = {
    'ticket-list': [
        // temporary disable priority in views
        // {
        //     name: 'priority',
        //     title: 'Priority',
        // },
        {
            name: 'details',
            title: 'Details',
        },
        {
            name: 'subject',
            title: 'Subject',
        },
        {
            name: 'from',
            title: 'From',
        },
        {
            name: 'to',
            title: 'To',
            path: 'receiver.channels.address',
            filter: {
                doc_type: 'user_channel',
                queryPath: 'query.multi_match.query',  // lodash set syntax: https://lodash.com/docs#set
                query: {
                    _source: ['id', 'address'],
                    size: 10,
                    query: {
                        multi_match: {
                            query: '',
                            fuzziness: 3,
                            fields: ['address']
                        }
                    }
                }
            }
        },
        {
            name: 'tags',
            title: 'Tags',
            path: 'tags.name', // specify if different from name and if used in filters
            filter: {
                doc_type: 'tag',
                queryPath: 'stringQuery',
                query: {
                    field: 'name',
                    stringQuery: ''
                }
            }
        },
        {
            name: 'requester',
            title: 'Requester',
            path: 'requester.id',
            filter: {
                doc_type: 'user',
                queryPath: 'query.multi_match.query',  // lodash set syntax: https://lodash.com/docs#set
                query: {
                    _source: ['id', 'name', 'email'],
                    size: 10,
                    query: {
                        multi_match: {
                            query: '',
                            fuzziness: 3,
                            fields: ['name', 'email']
                        }
                    }
                }
            }
        },
        {
            name: 'assignee',
            title: 'Assignee',
            path: 'assignee_user.id',
            filter: {
                doc_type: 'user',
                queryPath: 'query.multi_match.query',  // lodash set syntax: https://lodash.com/docs#set
                query: {
                    _source: ['id', 'name', 'email'],
                    size: 10,
                    query: {
                        multi_match: {
                            query: '',
                            fuzziness: 3,
                            fields: ['name', 'email']
                        }
                    },
                    filter: {
                        bool: {
                            should: [
                                {
                                    match: {
                                        'roles.name': 'agent'
                                    }
                                },
                                {
                                    match: {
                                        'roles.name': 'admin'
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            name: 'status',
            title: 'Status',
            filter: {
                enum: TICKET_STATUSES
            }
        },
        {
            name: 'via',
            title: 'Via',
            filter: {
                enum: VIA
            }
        },
        {
            name: 'channel',
            title: 'Channel',
            filter: {
                enum: CHANNELS
            }
        },
        {
            name: 'created',
            title: 'Created',
            path: 'created_datetime',
            filter: {
                sort: {
                    created_datetime: 'desc'
                }
            }
        },
        {
            name: 'updated',
            title: 'Updated',
            path: 'updated_datetime',
            filter: {
                sort: {
                    updated_datetime: 'desc'
                }
            }
        },
    ],
    'user-list': [
        {
            name: 'name',
            title: 'Name',
        },
        {
            name: 'email',
            title: 'Email',
        },
        {
            name: 'roles',
            title: 'Role',
            path: 'roles.name',
            filter: {
                enum: ['user', 'agent', 'admin']
            }
        },
        {
            name: 'created',
            title: 'Created',
            path: 'created_datetime',
            filter: {
                sort: {
                    created_datetime: 'desc'
                }
            }
        },
        {
            name: 'updated',
            title: 'Updated',
            path: 'updated_datetime',
            filter: {
                sort: {
                    updated_datetime: 'desc'
                }
            }
        },
    ]
}
/**
 * Notification uids for known notifications
 */
export const NOTIFICATION_UIDS = {
    freeMinLimitReached: 2,
    freeDefaultLimitReached: 3,
    accountDeactivated: 4,
    accountDeactivatedCardUpdated: 5,
}
