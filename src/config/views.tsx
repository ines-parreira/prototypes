import React from 'react'
import {fromJS, Map, List} from 'immutable'
import _isUndefined from 'lodash/isUndefined'

import {EMAIL_INTEGRATION_TYPES} from '../constants/integration'
import {BASE_VIEW_ID} from '../constants/view'
import {OrderDirection} from '../models/api/types'
import {ViewField, ViewType} from '../state/views/types'
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
export const MAX_TICKET_COUNT_PER_VIEW = 5000

export const defaultCell = (fieldName: string, item: Map<any, any>) => {
    const value = item.get(fieldName) as Maybe<string>

    if (_isUndefined(value)) {
        console.error('Invalid field type in view table cell', fieldName)
        return ''
    }

    return value
}

// Each of the following properties are required to create a new view
export const baseView = () =>
    fromJS({
        id: BASE_VIEW_ID,
        name: 'New view',
        slug: 'new-view',
        order_by: 'updated_datetime',
        display_order: 1,
        created_datetime: getMomentUtcISOString(),
        order_dir: OrderDirection.Desc,
        filters: '',
        filters_ast: {
            sourceType: 'script',
            body: [],
            loc: {
                end: {
                    line: 0,
                    column: 0,
                },
                start: {
                    line: 0,
                    column: 0,
                },
            },
            type: 'Program',
        },
    }) as Map<any, any>

export const defaultMergeTicketsView = (
    ticketId: number,
    searchQuery?: string,
    customerId?: Maybe<number>
) => {
    const filters = customerId
        ? `neq(ticket.id, ${ticketId}) && eq(ticket.customer.id, ${customerId})`
        : `neq(ticket.id, ${ticketId})`

    return fromJS({
        id: BASE_VIEW_ID,
        search: customerId ? null : searchQuery,
        fields: [
            ViewField.Details,
            ViewField.Customer,
            ViewField.Channel,
            ViewField.Created,
        ],
        filters,
        filters_ast: getAST(filters),
        order_by: 'created_datetime',
        order_dir: OrderDirection.Desc,
        type: ViewType.TicketList,
        slug: 'merge-tickets',
    }) as Map<any, any>
}

export const views = fromJS([
    {
        name: 'ticket',
        type: ViewType.TicketList,
        routeItem: 'ticket', // UI route for this object
        routeList: 'tickets', // UI route for the list of those objects
        api: 'tickets', // api endpoint for this object
        singular: 'ticket', // singular version for sentences
        plural: 'tickets', // plural version for sentences
        mainField: 'details', // mandatory field (+ where are displayed bulk actions)
        fields: [
            {
                name: ViewField.Details,
                title: 'Details',
            },
            {
                name: ViewField.Subject,
                title: 'Subject',
            },
            {
                name: ViewField.Integrations,
                title: 'Integration',
                path: 'messages.integration_id',
                filter: {
                    type: 'integration',
                },
                dropdown: {
                    width: '350px',
                },
            },
            {
                name: ViewField.Tags,
                title: 'Tags',
                path: 'tags.name', // specify if different from name and if used in filters
                filter: {
                    type: 'tag',
                },
            },
            {
                name: ViewField.Customer,
                title: 'Customer',
                path: 'customer.id',
                filter: {
                    type: 'customer',
                },
            },
            {
                name: ViewField.AssigneeTeam,
                title: 'Assignee team',
                path: 'assignee_team.id',
                filter: {
                    type: 'team',
                },
            },
            {
                name: ViewField.Assignee,
                title: 'Assignee user',
                path: 'assignee_user.id',
                filter: {
                    // TODO(customers-migration): replace with `user` when we updated our search REST API.
                    type: 'agent',
                },
            },
            {
                name: ViewField.Status,
                title: 'Status',
                filter: {
                    enum: ticketConfig.STATUSES,
                },
            },
            {
                name: ViewField.Language,
                title: 'Language',
                filter: {
                    enum: TICKET_LANGUAGES.map((lang) => lang.localeName),
                },
            },
            {
                name: ViewField.Channel,
                title: 'Channel',
                filter: {
                    enum: ticketConfig.CHANNELS,
                },
            },
            {
                name: ViewField.Created,
                title: 'Created',
                path: 'created_datetime',
                filter: {
                    sort: {
                        created_datetime: 'desc',
                    },
                },
            },
            {
                name: ViewField.Updated,
                title: 'Updated',
                path: 'updated_datetime',
                filter: {
                    sort: {
                        updated_datetime: 'desc',
                    },
                },
            },
            {
                name: ViewField.LastMessage,
                title: 'Last message',
                path: 'last_message_datetime',
                filter: {
                    sort: {
                        last_message_datetime: 'desc',
                    },
                },
            },
            {
                name: ViewField.LastReceivedMessage,
                title: 'Last received message',
                path: 'last_received_message_datetime',
                filter: {
                    sort: {
                        last_received_message_datetime: 'desc',
                    },
                },
            },
            {
                name: ViewField.Closed,
                title: 'Closed',
                path: 'closed_datetime',
                filter: {
                    sort: {
                        closed_datetime: 'desc',
                    },
                },
            },
            {
                name: ViewField.Snooze,
                title: 'Snooze',
                path: 'snooze_datetime',
                filter: {
                    sort: {
                        snooze_datetime: 'desc',
                    },
                },
            },
        ],
        cell: (fieldName: ViewField, item: Map<any, any>) => {
            switch (fieldName) {
                case ViewField.Created:
                    return (item.get('created_datetime') as string) || ''
                case ViewField.Updated:
                    return (item.get('updated_datetime') as string) || ''
                case ViewField.Closed:
                    return (item.get('closed_datetime') as string) || ''
                case ViewField.Snooze:
                    return (item.get('snooze_datetime') as string) || ''
                case ViewField.LastMessage:
                    return (item.get('last_message_datetime') as string) || ''
                case ViewField.LastReceivedMessage:
                    return (
                        (item.get(
                            'last_received_message_datetime'
                        ) as string) || ''
                    )
                case ViewField.Customer:
                    return (item.get('customer') as Map<any, any>) || fromJS({})
                case ViewField.AssigneeTeam:
                    return (
                        (item.get('assignee_team') as Map<any, any>) ||
                        fromJS({})
                    )
                case ViewField.Assignee:
                    return (
                        (item.get('assignee_user') as Map<any, any>) ||
                        fromJS({})
                    )
                case ViewField.Language: {
                    return getLanguageDisplayName(
                        item.get('language')
                    ) as string
                }
                case ViewField.Details: {
                    let subject = stripHTML(item.get('subject'))

                    // Optionally show how many messages a ticket has in the subject
                    const messageCount = item.get('messages_count') as number
                    if (messageCount > 1) {
                        subject = `(${messageCount}) ${subject || ''}`
                    }

                    const body = stripHTML(item.get('excerpt'))

                    return (
                        <div
                            style={{
                                marginTop: '-5px',
                                marginBottom: '-5px',
                            }}
                        >
                            <div className="subject">{subject}</div>
                            {!!body && (
                                <div className="description">{body}</div>
                            )}
                        </div>
                    )
                }
                case ViewField.Integrations: {
                    return (item.get('integrations', fromJS([])) as List<any>)
                        .map((inte: Maybe<Map<any, any>>) => {
                            if (!inte) {
                                return ''
                            }
                            if (
                                EMAIL_INTEGRATION_TYPES.includes(
                                    inte.get('type')
                                )
                            ) {
                                return `${inte.get('name', '') as string} <${
                                    inte.get('address', '') as string
                                }>`
                            }
                            return inte.get('name', '') as string
                        })
                        .join(', ')
                }
                case ViewField.Tags: {
                    return (
                        <div className="d-flex">
                            {(item.get('tags', fromJS([])) as List<any>)
                                .sort(
                                    ((a: Map<any, any>, b: Map<any, any>) =>
                                        (a.get(
                                            'name'
                                        ) as string).toLowerCase() >
                                        (b.get(
                                            'name'
                                        ) as string).toLowerCase()) as any
                                )
                                .map((tag: Map<any, any>) => {
                                    const {
                                        TagLabel,
                                        //eslint-disable-next-line @typescript-eslint/no-var-requires
                                    } = require('../pages/common/utils/labels') // require cycle
                                    return (
                                        <TagLabel
                                            key={tag.get('id')}
                                            decoration={tag.get('decoration')}
                                        >
                                            {tag.get('name')}
                                        </TagLabel>
                                    )
                                })}
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
                fields: [
                    ViewField.Details,
                    ViewField.Channel,
                    ViewField.Assignee,
                    ViewField.Status,
                    ViewField.Customer,
                    ViewField.Created,
                    ViewField.LastMessage,
                ],
                type: ViewType.TicketList,
                order_by: 'last_message_datetime',
            })
        },
        searchView: (query: string, filters?: string) => {
            const searchView = baseView().merge({
                name: `Search "${query}"`,
                search: query,
                fields: [
                    ViewField.Details,
                    ViewField.Channel,
                    ViewField.Assignee,
                    ViewField.Status,
                    ViewField.Customer,
                    ViewField.Created,
                    ViewField.LastMessage,
                ],
                type: ViewType.TicketList,
                order_by: 'last_message_datetime',
            })

            if (filters) {
                return searchView.merge({
                    filters,
                    filters_ast: getAST(filters),
                })
            }

            return searchView
        },
    },
    {
        name: 'customer',
        type: ViewType.CustomerList,
        routeItem: 'customer',
        routeList: 'customers',
        // TODO(customers-migration): update when we created REST API to search for customers in a view
        api: 'customers',
        singular: 'customer',
        plural: 'customers',
        mainField: 'name',
        fields: [
            {
                name: ViewField.Name,
                title: 'Name',
            },
            {
                name: ViewField.Email,
                title: 'Email',
            },
            {
                name: ViewField.Created,
                title: 'Created',
                path: 'created_datetime',
                filter: {
                    sort: {
                        created_datetime: 'desc',
                    },
                },
            },
            {
                name: ViewField.Updated,
                title: 'Updated',
                path: 'updated_datetime',
                filter: {
                    sort: {
                        updated_datetime: 'desc',
                    },
                },
            },
        ],
        cell: (fieldName: ViewField, item: Map<any, any>) => {
            switch (fieldName) {
                case ViewField.Name:
                    return (
                        (item.get('name') as string) ||
                        `Customer #${item.get('id') as number}`
                    )
                case ViewField.Created:
                    return item.get('created_datetime') as string
                case ViewField.Updated:
                    return item.get('updated_datetime') as string
                default: {
                    return defaultCell(fieldName, item)
                }
            }
        },
        newView: () => {
            return baseView().merge({
                fields: [ViewField.Name, ViewField.Email, ViewField.Created],
                type: ViewType.CustomerList,
            })
        },
        searchView: (query: string, filters?: string) => {
            const searchView = baseView().merge({
                name: `Search "${query}"`,
                search: query,
                fields: [ViewField.Name, ViewField.Email, ViewField.Created],
                type: ViewType.CustomerList,
            })

            if (filters) {
                return searchView.merge({
                    filters,
                    filters_ast: getAST(filters),
                })
            }

            return searchView
        },
    },
]) as List<any>

export const getConfigByName = (name: string) => {
    const config = views.find(
        (item: Map<any, any>) => item.get('name') === name
    ) as Maybe<Map<any, any>>

    if (!config) {
        console.error(`There is no view configuration for name "${name}"`)
        return fromJS({}) as Map<any, any>
    }

    return config
}

export const getConfigByType = (type: string) => {
    const config = views.find(
        (item: Map<any, any>) => item.get('type') === type
    ) as Maybe<Map<any, any>>

    if (!config) {
        console.error(`There is no view configuration for type "${type}"`)
        return fromJS({}) as Map<any, any>
    }

    return config
}
