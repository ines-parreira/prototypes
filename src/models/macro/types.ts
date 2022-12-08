import {MacroAction} from 'models/macroAction/types'
import {ApiCursorPaginationParams, OrderParams} from 'models/api/types'

export type Macro = MacroDraft & {
    category: string | null
    created_datetime: string
    deactivated_datetime?: string
    deleted_datetime?: string
    external_id: string | null
    id: number
    updated_datetime: string
    uri: string
    usage: number
    relevance_rank?: number
}

export type MacroDraft = {
    actions: MacroAction[]
    name: string
    language: string | null
}

export enum MacroSortableProperties {
    CreatedDatetime = 'created_datetime',
    Name = 'name',
    UpdatedDatetime = 'updated_datetime',
    Usage = 'usage',
    Language = 'language',
}

export type FetchMacrosOptions = OrderParams<MacroSortableProperties> &
    ApiCursorPaginationParams & {
        messageId?: number
        search?: string
        ticketId?: number
        languages?: string[]
        tags?: string[]
        numberPredictions?: number
    }

export type MacrosProperties = {
    [MacroPropertiesOptions.Languages]?: string[]
    [MacroPropertiesOptions.Tags]?: string[]
}

export enum MacroPropertiesOptions {
    Languages = 'languages',
    Tags = 'tags',
}
