import React from 'react'
import {fromJS} from 'immutable'
import _isUndefined from 'lodash/isUndefined'

import {EMAIL_INTEGRATION_TYPES} from '../constants/integration'
import {BASE_VIEW_ID} from '../constants/view'
import {getAST, getLanguageDisplayName, stripHTML} from '../utils'
import {getMomentUtcISOString} from '../utils/date'

import * as ticketConfig from './ticket'
import TICKET_LANGUAGES from './ticketLanguages'


// Expiration times for views counts (second).
// After this period, we will ask for a new count.
export const ACTIVE_VIEW_COUNT_TIMEOUT = 10
export const RECENT_VIEWS_COUNTS_TIMEOUT = 10

// Number of maximum recent views we store in the reducer and local storage.
// View counts will only be calculated periodically for these views.
export const MAX_RECENT_VIEWS = 8

// Maximum number of tickets we count per view
export const MAX_TICKET_COUNT_PER_VIEW = 10000

export const defaultCell = (fieldName, item) => {
    const value = item.get(fieldName)

    if (_isUndefined(value)) {
        console.error('Invalid field type in view table cell', fieldName)
        return ''
    }

    return value
}

// Each of the following properties are required to create a new view
export const baseView = () => fromJS({
    id: BASE_VIEW_ID,
    name: 'New view',
    slug: 'new-view',
    order_by: 'updated_datetime',
    display_order: 1,
    created_datetime: getMomentUtcISOString(),
    order_dir: 'desc',
    filters: '',
    filters_ast: {
        sourceType: 'script',
        body: [],
        loc: {
            end: {
                line: 0,
                column: 0
            },
            start: {
                line: 0,
                column: 0
            }
        },
        type: 'Program'
    }
})

export const defaultMergeTicketsView = (ticketId, searchQuery, customerId) => {
    let filters = customerId
        ? `neq(ticket.id, ${ticketId}) && eq(ticket.customer.id, ${customerId})`
        : `neq(ticket.id, ${ticketId})`

    return fromJS({
        id: BASE_VIEW_ID,
        search: customerId ? null : searchQuery,
        fields: ['details', 'customer', 'channel', 'created'],
        filters,
        filters_ast: getAST(filters),
        order_by: 'created_datetime',
        order_dir: 'desc',
        type: 'ticket-list',
        slug: 'merge-tickets'
    })
}

export const views = fromJS([{
    name: 'ticket',
    type: 'ticket-list',
    routeItem: 'ticket', // UI route for this object
    routeList: 'tickets', // UI route for the list of those objects
    api: 'tickets', // api endpoint for this object
    singular: 'ticket', // singular version for sentences
    plural: 'tickets', // plural version for sentences
    mainField: 'details', // mandatory field (+ where are displayed bulk actions)
    fields: [
        {
            name: 'details',
            title: 'Details',
        },
        {
            name: 'subject',
            title: 'Subject',
        },
        {
            name: 'integrations',
            title: 'Integration',
            path: 'messages.integration_id',
            filter: {
                type: 'integration',
            },
            dropdown: {
                width: '350px'
            }
        },
        {
            name: 'tags',
            title: 'Tags',
            path: 'tags.name', // specify if different from name and if used in filters
            filter: {
                type: 'tag',
            }
        },
        {
            name: 'customer',
            title: 'Customer',
            path: 'customer.id',
            filter: {
                type: 'customer',
            },
        },
        {
            name: 'assignee_team',
            title: 'Assignee team',
            path: 'assignee_team.id',
            filter: {
                type: 'team',
            }
        },
        {
            name: 'assignee',
            title: 'Assignee user',
            path: 'assignee_user.id',
            filter: {
                // TODO(customers-migration): replace with `user` when we updated our search REST API.
                type: 'agent',
            }
        },
        {
            name: 'status',
            title: 'Status',
            filter: {
                enum: ticketConfig.STATUSES,
            }
        },
        {
            name: 'language',
            title: 'Language',
            filter: {
                enum: TICKET_LANGUAGES.map((lang) => lang.localeName)
            }
        },
        {
            name: 'channel',
            title: 'Channel',
            filter: {
                enum: ticketConfig.CHANNELS,
            }
        },
        {
            name: 'created',
            title: 'Created',
            path: 'created_datetime',
            filter: {
                sort: {
                    created_datetime: 'desc',
                }
            }
        },
        {
            name: 'updated',
            title: 'Updated',
            path: 'updated_datetime',
            filter: {
                sort: {
                    updated_datetime: 'desc',
                }
            }
        },
        {
            name: 'last_message',
            title: 'Last message',
            path: 'last_message_datetime',
            filter: {
                sort: {
                    last_message_datetime: 'desc',
                }
            }
        },
        {
            name: 'last_received_message',
            title: 'Last received message',
            path: 'last_received_message_datetime',
            filter: {
                sort: {
                    last_received_message_datetime: 'desc',
                }
            }
        },
        {
            name: 'closed',
            title: 'Closed',
            path: 'closed_datetime',
            filter: {
                sort: {
                    closed_datetime: 'desc',
                }
            }
        },
        {
            name: 'snooze',
            title: 'Snooze',
            path: 'snooze_datetime',
            filter: {
                sort: {
                    snooze_datetime: 'desc',
                }
            }
        }
    ],
    cell: (fieldName, item) => {
        switch (fieldName) {
            case 'created':
                return item.get('created_datetime') || ''
            case 'updated':
                return item.get('updated_datetime') || ''
            case 'closed':
                return item.get('closed_datetime') || ''
            case 'snooze':
                return item.get('snooze_datetime') || ''
            case 'last_message':
                return item.get('last_message_datetime') || ''
            case 'last_received_message':
                return item.get('last_received_message_datetime') || ''
            case 'customer':
                return item.get('customer') || fromJS({})
            case 'assignee_team':
                return item.get('assignee_team') || fromJS({})
            case 'assignee':
                return item.get('assignee_user') || fromJS({})
            case 'language': {
                return getLanguageDisplayName(item.get('language'))
            }
            case 'details': {
                let subject = stripHTML(item.get('subject'))

                // Optionally show how many messages a ticket has in the subject
                const messageCount = item.get('messages_count')
                if (messageCount > 1) {
                    subject = `(${messageCount}) ${subject}`
                }

                const body = stripHTML(item.get('excerpt'))

                return (
                    <div
                        style={{
                            marginTop: '-5px',
                            marginBottom: '-5px',
                        }}
                    >
                        <div className="subject">
                            {subject}
                        </div>
                        {
                            !!body && (
                                <div className="description">
                                    {body}
                                </div>
                            )
                        }
                    </div>
                )
            }
            case 'integrations': {
                return item.get('integrations', fromJS([]))
                    .map((inte) => {
                        if (!inte) {
                            return ''
                        }
                        if (EMAIL_INTEGRATION_TYPES.includes(inte.get('type'))) {
                            return `${inte.get('name', '')} <${inte.get('address', '')}>`
                        }
                        return inte.get('name', '')
                    })
                    .join(', ')
            }
            case 'tags': {
                return (
                    <div className="d-flex">
                        {
                            item.get('tags', fromJS([]))
                                .sort((a, b) => a.get('name').toLowerCase() > b.get('name').toLowerCase())
                                .map((tag) => {
                                    const {TagLabel} = require('../pages/common/utils/labels') // require cycle
                                    return (
                                        <TagLabel
                                            key={tag.get('id')}
                                            decoration={tag.get('decoration')}
                                        >
                                            {tag.get('name')}
                                        </TagLabel>
                                    )
                                })
                        }
                    </div>
                )
            }
            default: {
                return defaultCell(fieldName, item)
            }
        }
    },
    newView: () => {
        return baseView().merge({
            fields: ['details', 'channel', 'assignee', 'status', 'customer', 'created', 'last_message'],
            type: 'ticket-list',
            order_by: 'last_message_datetime',
        })
    },
    searchView: (query) => {
        return baseView().merge({
            name: `Search "${query}"`,
            search: query,
            fields: ['details', 'channel', 'assignee', 'status', 'customer', 'created', 'last_message'],
            type: 'ticket-list',
            order_by: 'last_message_datetime',
        })
    },
}, {
    name: 'customer',
    type: 'customer-list',
    routeItem: 'customer',
    routeList: 'customers',
    // TODO(customers-migration): update when we created REST API to search for customers in a view
    api: 'customers',
    singular: 'customer',
    plural: 'customers',
    mainField: 'name',
    fields: [
        {
            name: 'name',
            title: 'Name',
        },
        {
            name: 'email',
            title: 'Email',
        },
        {
            name: 'created',
            title: 'Created',
            path: 'created_datetime',
            filter: {
                sort: {
                    created_datetime: 'desc',
                }
            }
        },
        {
            name: 'updated',
            title: 'Updated',
            path: 'updated_datetime',
            filter: {
                sort: {
                    updated_datetime: 'desc',
                }
            }
        },
    ],
    cell: (fieldName, item) => {
        switch (fieldName) {
            case 'name':
                return item.get('name') || `Customer #${item.get('id')}`
            case 'created':
                return item.get('created_datetime')
            case 'updated':
                return item.get('updated_datetime')
            default: {
                return defaultCell(fieldName, item)
            }
        }
    },
    newView: () => {
        return baseView().merge({
            fields: ['name', 'email', 'created'],
            type: 'customer-list',
        })
    },
    searchView: (query) => {
        return baseView().merge({
            name: `Search "${query}"`,
            search: query,
            fields: ['name', 'email', 'created'],
            type: 'customer-list',
        })
    },
}])

export const getConfigByName = (name) => {
    const config = views.find((item) => item.get('name') === name)

    if (!config) {
        console.error(`There is no view configuration for name "${name}"`)
        return fromJS({})
    }

    return config
}

export const getConfigByType = (type) => {
    const config = views.find((item) => item.get('type') === type)

    if (!config) {
        console.error(`There is no view configuration for type "${type}"`)
        return fromJS({})
    }

    return config
}
