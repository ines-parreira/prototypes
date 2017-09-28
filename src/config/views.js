import React from 'react'
import {fromJS} from 'immutable'

import * as ticketConfig from './ticket'
import TICKET_LANGUAGES from './ticketLanguages'
import {stripHTML, getLanguageDisplayName} from '../utils'
import {TagLabel} from '../pages/common/utils/labels'

import _isUndefined from 'lodash/isUndefined'

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
    id: 0,
    name: 'New view',
    slug: 'new-view',
    order_by: 'updated_datetime',
    display_order: 1,
    created_datetime: new Date(),
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
            name: 'requester',
            title: 'Requester',
            path: 'requester.id',
            filter: {
                type: 'user',
            }
        },
        {
            name: 'assignee',
            title: 'Assignee',
            path: 'assignee_user.id',
            filter: {
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
                enum: TICKET_LANGUAGES.map(lang => lang.localeName)
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
        }
    ],
    cell: (fieldName, item) => {
        switch (fieldName) {
            case 'created':
                return item.get('created_datetime')
            case 'updated':
                return item.get('updated_datetime')
            case 'requester':
                return item.get('requester') || fromJS({})
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
                    .map(inte => {
                        if (!inte) {
                            return ''
                        }
                        if (['email', 'gmail'].includes(inte.get('type'))) {
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
                                .map((tag) => (
                                    <TagLabel
                                        key={tag.get('id')}
                                        decoration={tag.get('decoration')}
                                    >
                                        {tag.get('name')}
                                    </TagLabel>
                                ))
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
            fields: ['details', 'channel', 'assignee', 'status', 'requester', 'created'],
            type: 'ticket-list',
        })
    },
    searchView: (query) => {
        return baseView().merge({
            name: `Search "${query}"`,
            search: query,
            fields: ['details', 'channel', 'assignee', 'status', 'requester', 'created', 'updated'],
            type: 'ticket-list',
        })
    },
}, {
    name: 'user',
    type: 'user-list',
    routeItem: 'user',
    routeList: 'users',
    api: 'users',
    singular: 'user',
    plural: 'users',
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
            name: 'roles',
            title: 'Role',
            path: 'roles.name',
            filter: {
                enum: ['user', 'agent', 'admin'],
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
    ],
    cell: (fieldName, item) => {
        switch (fieldName) {
            case 'created':
                return item.get('created_datetime')
            case 'updated':
                return item.get('updated_datetime')
            case 'roles':
                return item.get('roles', fromJS([]))
            default: {
                return defaultCell(fieldName, item)
            }
        }
    },
    newView: () => {
        return baseView().merge({
            fields: ['name', 'email', 'roles', 'created'],
            type: 'user-list',
        })
    },
    searchView: (query) => {
        return baseView().merge({
            name: `Search "${query}"`,
            search: query,
            fields: ['name', 'email', 'roles', 'created'],
            type: 'user-list',
        })
    },
}])

export const getConfigByName = (name) => {
    const config = views.find(item => item.get('name') === name)

    if (!config) {
        console.error(`There is no view configuration for name "${name}"`)
        return fromJS({})
    }

    return config
}

export const getConfigByType = (type) => {
    const config = views.find(item => item.get('type') === type)

    if (!config) {
        console.error(`There is no view configuration for type "${type}"`)
        return fromJS({})
    }

    return config
}
