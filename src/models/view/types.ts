import {OrderDirection} from '../api/types'

export enum ViewCategory {
    System = 'system',
}

export enum ViewType {
    TicketList = 'ticket-list',
    CustomerList = 'customer-list',
}

export enum ViewField {
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
}

export enum ViewVisibility {
    Public = 'public',
    Shared = 'shared',
    Private = 'private',
}

export type ViewDecoration = {
    emoji?: string
}

export type ViewDraft = {
    category: Maybe<ViewCategory>
    created_datetime: string
    deactivated_datetime: Maybe<string>
    decoration: Maybe<ViewDecoration>
    display_order: number
    fields: ViewField[]
    filters: string
    filters_ast: Record<string, unknown>
    group_by: Maybe<ViewField>
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
}

type SharedWith = {
    id: number
    meta: Record<string, unknown>
    name: string
}

export type View = Omit<
    ViewDraft,
    'shared_with_teams' | 'shared_with_users'
> & {
    id: number
    shared_with_teams?: SharedWith[]
    shared_with_users?: SharedWith[]
}
