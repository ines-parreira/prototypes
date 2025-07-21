import { Map } from 'immutable'

import { OrderParams } from 'models/api/types'
import { TicketSearchSortableProperties } from 'models/search/types'

export enum ViewNavDirection {
    PrevView = 'prev',
    NextView = 'next',
}

export type ViewsState = Map<any, any>

export type ViewFilter = {
    operator: string
    left: string
    right?: string | number
}

export type ViewImmutable = Map<any, any>

export type FieldSearchResult = {
    id: number
    name: string
}

export type FetchViewItemsOptions = OrderParams<TicketSearchSortableProperties>
