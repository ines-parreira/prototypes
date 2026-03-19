import type { Team } from '@gorgias/helpdesk-queries'

import type { ApiPaginationParams, OrderDirection } from 'models/api/types'

export type ListParams = ApiPaginationParams & {
    url?: string
    viewId: number
}

export enum ViewCategory {
    System = 'system',
    User = 'user',
}

export enum ViewType {
    All = 'all',
    TicketList = 'ticket-list',
    CustomerList = 'customer-list',
    CallList = 'voice-call-list',
}

export enum EntityType {
    Ticket = 'ticket',
    Customer = 'customer',
}

export enum ViewField {
    TicketId = 'id',
    Name = 'name',
    Email = 'email',
    Created = 'created',
    Updated = 'updated',
    Details = 'details',
    Tags = 'tags',
    Customer = 'customer',
    LastMessage = 'last_message',
    Channel = 'channel',
    Subject = 'subject',
    Integrations = 'integrations',
    AssigneeTeam = 'assignee_team',
    Assignee = 'assignee',
    Status = 'status',
    Language = 'language',
    LastReceivedMessage = 'last_received_message',
    Closed = 'closed',
    Snooze = 'snooze',
    TicketField = 'ticket_field',
    CustomerField = 'customer_field',
    CSATScore = 'csat_score',
    QAScore = 'qa_score',
    Priority = 'priority',
    Store = 'store',
    Feedback = 'feedback',
}

export enum ViewVisibility {
    Public = 'public',
    Shared = 'shared',
    Private = 'private',
}

export type ViewCategoryNavbar = Extract<
    ViewVisibility,
    ViewVisibility.Public | ViewVisibility.Private
>

export type ViewDecoration = {
    emoji?: string
}

export type ViewDraft = {
    category: Maybe<ViewCategory>
    created_datetime: string
    deactivated_datetime?: Maybe<string>
    decoration: Maybe<ViewDecoration>
    fields: ViewField[]
    filters: string
    filters_ast: Record<string, unknown>
    group_by?: ViewField | null
    name: string
    order_by: ViewField
    order_dir: OrderDirection
    search: Maybe<string>
    section_id: number | null
    shared_with_teams?: number[]
    shared_with_users?: number[]
    slug: string
    type: ViewType
    uri: string
    visibility: ViewVisibility
    with_highlights: boolean
}

export type SharedWith = {
    id: number
    meta: Record<string, unknown>
    name: string
}

export type View = Omit<
    ViewDraft,
    'shared_with_teams' | 'shared_with_users'
> & {
    id: number
    shared_with_teams?: Pick<Team, 'id' | 'name' | 'decoration'>[]
    shared_with_users?: SharedWith[]
}
