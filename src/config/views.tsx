import { fromJS, List, Map } from 'immutable'
import _isUndefined from 'lodash/isUndefined'

import { fromAST } from 'common/utils'
import ticketLanguages from 'config/ticketLanguages'
import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import { BASE_VIEW_ID } from 'constants/view'
import { OrderDirection } from 'models/api/types'
import {
    EntityType,
    ViewField,
    ViewType,
    ViewVisibility,
} from 'models/view/types'
import { trimWithEllipsisBeforeTheHighlight } from 'pages/common/components/Spotlight/helpers'
import TicketTags from 'pages/tickets/detail/components/TicketDetails/TicketTags'
import { getChannels } from 'services/channels'
import { STATUSES } from 'tickets/common/config'
import { fieldPath, getAST, getLanguageDisplayName, stripHTML } from 'utils'
import { getMomentUtcISOString } from 'utils/date'
import { sanitizeHtmlDefault } from 'utils/html'

import { TicketChannel } from '../business/types/ticket'

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
    fromAST({
        id: BASE_VIEW_ID,
        name: 'New view',
        slug: 'new-view',
        order_by: 'updated_datetime',
        created_datetime: getMomentUtcISOString(),
        order_dir: OrderDirection.Desc,
        filters: '',
        filters_ast: getAST(''),
    }) as Map<any, any>

export const defaultMergeTicketsView = (
    ticketId: number,
    searchQuery?: string,
    customerId?: Maybe<number>,
) => {
    const filters = customerId
        ? `neq(ticket.id, ${ticketId}) && eq(ticket.customer.id, ${customerId})`
        : `neq(ticket.id, ${ticketId})`

    return fromAST({
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

export const defaultCustomerView = {
    name: EntityType.Customer,
    type: ViewType.CustomerList,
    routeItem: 'customer',
    routeList: 'customers',
    // TODO(customers-migration): update when we created REST API to search for customers in a view
    api: 'customers',
    singular: 'customer',
    plural: 'customers',
    mainField: ViewField.Name,
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
            title: 'Creation date',
            path: 'created_datetime',
            filter: {
                sort: {
                    created_datetime: 'desc',
                },
            },
        },
    ],
    cell: (fieldName: ViewField, item: Map<any, any>) => {
        switch (fieldName) {
            case ViewField.Name: {
                const nameOrNameWithHighlight =
                    (item.getIn(['highlights', 'name', 0]) as string) ??
                    (item.get('name') as string)

                return (
                    <span
                        className="customer-name-with-highlight"
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtmlDefault(
                                nameOrNameWithHighlight ||
                                    `Customer #${item.get('id') as number}`,
                            ),
                        }}
                    />
                )
            }
            case ViewField.Email: {
                const emailOrEmailWithHighlight =
                    (item.getIn(['highlights', 'email', 0]) as string) ??
                    (item.get('email') as string)

                return (
                    <span
                        className="customer-email-with-highlight"
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtmlDefault(
                                emailOrEmailWithHighlight,
                            ),
                        }}
                    />
                )
            }
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
                filters_ast: fromAST(getAST(filters)),
            })
        }

        return searchView
    },
}

export const defaultTicketView = {
    name: EntityType.Ticket,
    type: ViewType.TicketList,
    routeItem: 'ticket', // UI route for this object
    routeList: 'tickets', // UI route for the list of those objects
    api: 'tickets', // api endpoint for this object
    singular: 'ticket', // singular version for sentences
    plural: 'tickets', // plural version for sentences
    mainField: ViewField.Details, // mandatory field (+ where are displayed bulk actions)
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
            name: ViewField.TicketId,
            title: 'ID',
        },
        {
            name: ViewField.Status,
            title: 'Status',
            filter: {
                enum: STATUSES,
            },
        },
        {
            name: ViewField.Language,
            title: 'Language',
            filter: {
                enum: ticketLanguages,
            },
        },
        {
            name: ViewField.Channel,
            title: 'Channel',
            filter: {
                enum: getChannels() // Filtering is done due: https://linear.app/gorgias/issue/APPS-2219
                    .filter(
                        (channel) =>
                            channel?.slug !== TicketChannel.InternalNote,
                    )
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((channel) => channel.slug),
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
        {
            name: ViewField.TicketField,
            title: 'Ticket field',
            path: 'custom_fields',
            filter: {},
            show: false,
        },
        {
            name: ViewField.CSATScore,
            title: 'CSAT Score',
            path: 'satisfaction_survey.score',
            filter: {
                enum: [1, 2, 3, 4, 5],
            },
            show: false,
        },
        {
            name: ViewField.QAScore,
            title: 'QA Score',
            path: 'qa_score_dimensions',
            filter: {
                enum: [1, 2, 3, 4, 5],
            },
            show: false,
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
                    (item.get('last_received_message_datetime') as string) || ''
                )
            case ViewField.Customer:
                return (item.get('customer') as Map<any, any>) || fromJS({})
            case ViewField.AssigneeTeam:
                return (
                    (item.get('assignee_team') as Map<any, any>) || fromJS({})
                )
            case ViewField.Assignee:
                return (
                    (item.get('assignee_user') as Map<any, any>) || fromJS({})
                )
            case ViewField.Language: {
                return getLanguageDisplayName(item.get('language')) as string
            }
            case ViewField.Details: {
                const subjectHighlights: string | null = item.getIn(
                    ['highlights', 'subject', 0],
                    null,
                )

                const excerptHighlights: string | null = item.getIn(
                    ['highlights', 'messages', 'body', 0],
                    null,
                )

                let subject =
                    subjectHighlights || stripHTML(item.get('subject')) || ''

                const messageCount: number = item.get('messages_count')
                if (messageCount > 1) {
                    subject = `(${messageCount}) ${subject}`
                }

                const body = excerptHighlights
                    ? trimWithEllipsisBeforeTheHighlight(excerptHighlights)
                    : stripHTML(item.get('excerpt'))

                return (
                    <div>
                        <div
                            className="subject"
                            dangerouslySetInnerHTML={{
                                __html: sanitizeHtmlDefault(subject),
                            }}
                        />
                        {!!body && (
                            <div
                                className="description skip-bold"
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeHtmlDefault(body),
                                }}
                            />
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
                            EMAIL_INTEGRATION_TYPES.includes(inte.get('type'))
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
                    <TicketTags
                        isDisabled
                        textClassName="skip-bold"
                        ticketTags={
                            (item.get('tags', fromJS([])) as List<any>).sort(
                                ((a: Map<any, any>, b: Map<any, any>) =>
                                    (a.get('name') as string).toLowerCase() >
                                    (
                                        b.get('name') as string
                                    ).toLowerCase()) as any,
                            ) as List<any>
                        }
                    />
                )
            }
            case ViewField.TicketId: {
                return (item.get('id') as string) || ''
            }
            default: {
                return defaultCell(fieldName, item)
            }
        }
    },
    newView: (
        visibility?: ViewVisibility,
        viewName?: string,
        filters?: string,
    ) => {
        let view = baseView().merge({
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
            visibility:
                visibility === ViewVisibility.Private
                    ? ViewVisibility.Private
                    : ViewVisibility.Public,
        })
        if (filters) {
            view = view.merge({
                filters,
                filters_ast: fromAST(getAST(filters)),
            })
        }
        if (viewName) {
            view = view.set('name', viewName)
        }
        return view
    },
    searchView: (query: string, filters?: string) => {
        const searchView = baseView().merge({
            name: `Search "${query}"`,
            search: query,
            fields: [
                ViewField.Details,
                ViewField.Customer,
                ViewField.Assignee,
                ViewField.TicketId,
                ViewField.Status,
                ViewField.Channel,
                ViewField.Created,
            ],
            type: ViewType.TicketList,
            order_by: undefined,
            order_dir: undefined,
        })

        if (filters) {
            return searchView.merge({
                filters,
                filters_ast: fromAST(getAST(filters)),
            })
        }

        return searchView
    },
}

export const views = fromAST([
    defaultTicketView,
    defaultCustomerView,
]) as List<any>

export const getConfigByName = (name: EntityType) => {
    const config = views.find(
        (item: Map<any, any>) => item.get('name') === name,
    ) as Maybe<Map<any, any>>

    if (!config) {
        console.error(`There is no view configuration for name "${name}"`)
        return fromJS({}) as Map<any, any>
    }

    return config
}

export const getConfigByType = (type: ViewType) => {
    const config = views.find(
        (item: Map<any, any>) => item.get('type') === type,
    ) as Maybe<Map<any, any>>

    if (!config) {
        console.error(`There is no view configuration for type "${type}"`)
        return fromJS({}) as Map<any, any>
    }

    return config
}

/**
 * Return the expiration time for a given view count. 1min per 100 tickets. 30s under 100 tickets.
 */
export const getExpirationTimeForCount = (count: number | null) =>
    count && count >= 100 ? Math.ceil((count / 100) * 60) : 30

export const getTicketViewField = (fieldName: ViewField): Map<any, any> => {
    const viewConfig = getConfigByType(ViewType.TicketList)
    const field = (viewConfig.get('fields') as List<Map<any, any>>).find(
        (field) => field!.get('name') === fieldName,
    )
    return field
}

export const getTicketViewFieldPath = (field: Map<any, any>): string => {
    const viewConfig = getConfigByType(ViewType.TicketList)
    return `${viewConfig.get('singular') as string}.${fieldPath(field)}`
}
