import {ListMacrosParams, Macro} from '@gorgias/api-queries'

import {ApiPaginationParams, OrderParams} from 'models/api/types'

export type MacroDraft = Pick<Macro, 'actions' | 'language' | 'name'>

export enum MacroSortableProperties {
    CreatedDatetime = 'created_datetime',
    Name = 'name',
    UpdatedDatetime = 'updated_datetime',
    Usage = 'usage',
    Language = 'language',
}

export type FetchMacrosOptions = OrderParams<MacroSortableProperties> &
    ApiPaginationParams &
    MacrosProperties & {
        messageId?: number
        search?: string
        ticketId?: number
        numberPredictions?: number
    }

export type MacrosProperties = Pick<ListMacrosParams, 'languages' | 'tags'>

export enum MacroPropertiesOptions {
    Languages = 'languages',
    Tags = 'tags',
}

export type Filters = Pick<
    ListMacrosParams,
    'languages' | 'tags' | 'cursor' | 'search'
>
