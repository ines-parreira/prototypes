import React from 'react'
import {fromJS} from 'immutable'
import * as constants from './constants'
import {stripHTML} from '../utils'
import {displayUserNameFromSource} from '../pages/tickets/common/utils'
import {TagLabel} from '../pages/common/utils/labels'

import _isUndefined from 'lodash/isUndefined'

const defaultCell = (fieldName, item) => {
    const value = item.get(fieldName)

    if (_isUndefined(value)) {
        console.error('Invalid field type in view table cell', fieldName)
        return ''
    }

    return value
}

// Each of the following properties are required to create a new view
const baseView = () => fromJS({
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

const config = [{
    name: 'ticket',
    type: 'ticket-list',
    routeItem: 'ticket', // UI route for this object
    routeList: 'tickets', // UI route for the list of those objects
    api: 'tickets', // api endpoint for this object
    singular: 'ticket', // singular version for sentences
    plural: 'tickets', // plural version for sentences
    fields: [
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
            name: 'source',
            title: 'Source',
            path: 'messages.source.to.address',
            filter: {
                type: 'source',
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
                enum: constants.TICKET_STATUSES,
            }
        },
        {
            name: 'via',
            title: 'Via',
            filter: {
                enum: constants.TICKET_VIA,
            }
        },
        {
            name: 'channel',
            title: 'Channel',
            filter: {
                enum: constants.TICKET_CHANNELS,
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
            case 'requester':
                return item.get('requester') || fromJS({})
            case 'assignee':
                return item.get('assignee_user') || fromJS({})
            case 'details': {
                let subject = stripHTML(item.get('subject'))

                // Optionally show how many messages a ticket has in the subject
                const messageCount = item.get('messages_count')
                if (messageCount > 1) {
                    subject = `(${messageCount}) ${subject}`
                }

                const body = stripHTML(item.get('excerpt'))

                if (!body) {
                    return (
                        <div className="ui header">
                            <span className="subject">
                                {subject}
                            </span>
                        </div>
                    )
                }

                return (
                    <div className="ui header">
                        <span className="subject">
                            {subject}
                        </span>
                        <div className="body sub header">
                            {body}
                        </div>
                    </div>
                )
            }
            case 'from': {
                if (!item.get('first_source')) {
                    break
                }

                // get the part of "source" that we want
                const source = item.getIn(['first_source', 'from'], fromJS({})).toJS()

                // display the user based on the message type
                return displayUserNameFromSource(source, item.getIn(['first_source', 'type']))
            }
            case 'source': {
                if (!item.get('first_source')) {
                    break
                }

                let source = item.getIn(['first_source', 'from'], fromJS({}))

                if (!item.get('from_agent')) {
                    source = item.getIn(['first_source', 'to'], fromJS([])).first() || fromJS({})
                }

                // display the user based on the message type
                return displayUserNameFromSource(source.toJS(), item.getIn(['first_source', 'type']))
            }
            case 'tags': {
                return (
                    <div>
                        {
                            item.get('tags', fromJS([]))
                                .map((tag) => (
                                    <TagLabel
                                        key={tag.get('id')}
                                        name={tag.get('name')}
                                        decoration={tag.get('decoration')}
                                    />
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
            fields: ['details', 'channel', 'assignee', 'requester', 'created'],
            type: 'ticket-list',
        })
    },
    searchView: (query) => {
        return baseView().merge({
            name: `Search "${query}"`,
            search: query,
            fields: ['details', 'channel', 'assignee', 'requester', 'created'],
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
}]

export default fromJS(config)
