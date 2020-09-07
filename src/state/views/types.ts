import {Map} from 'immutable'

import {OrderDirection} from '../../models/api/types'

export enum ViewNavDirection {
    PrevView = 'prev',
    NextView = 'next',
}

export enum ViewCategory {
    System = 'system',
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
}

export enum ViewVisibility {
    Public = 'public',
    Shared = 'shared',
    Private = 'private',
}

export enum ViewType {
    TicketList = 'ticket-list',
    CustomerList = 'customer-list',
}

export type ViewsState = Map<any, any>

export type ViewFilter = {
    operator: string
    left: string
    right: string
}

export type ViewImmutable = Map<any, any>

export type ViewDecoration = {
    emoji?: string
}

export type View = {
    category: Maybe<ViewCategory>
    created_datetime: string
    deactivated_datetime: Maybe<string>
    decoration: Maybe<ViewDecoration>
    display_order: number
    fields: ViewField[]
    filters: string
    filters_ast: Record<string, unknown>
    group_by: Maybe<ViewField>
    id: number
    name: string
    order_by: ViewField
    order_dir: OrderDirection
    search: Maybe<string>
    slug: string
    type: ViewType
    uri: string
}
