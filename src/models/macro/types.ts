import {MacroAction} from 'models/macroAction/types'
import {ApiPaginationParams, OrderParams} from 'models/api/types'

export type Macro = MacroDraft & {
    id: number
    category: string | null
    created_datetime: string
    deactivated_datetime?: string
    deleted_datetime?: string
    external_id: string | null
    relevance_rank?: number
    score?: number
    updated_datetime: string
    uri: string
    usage: number
}

export type MacroDraft = {
    actions: MacroAction[] | null
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
    ApiPaginationParams &
    MacrosProperties & {
        messageId?: number
        search?: string
        ticketId?: number
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
