import {MacroAction} from '../macroAction/types'
import {MetaSortOptions, OrderParams} from '../api/types'

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
}

export type MacroDraft = {
    actions: MacroAction[]
    name: string
    language: string | null
}

export enum MacroSortableProperties {
    CreatedDatetime = 'createdDatetime',
    Name = 'name',
    UpdatedDatetime = 'updatedDatetime',
    Usage = 'usage',
    Language = 'language',
}

export type FetchMacrosOptions = OrderParams<
    MacroSortableProperties | MetaSortOptions
> & {
    fallbackOrderBy?: MacroSortableProperties
    messageId?: number
    page?: number
    search?: string
    ticketId?: number
    languages?: string[]
    tags?: string[]
}

export type MacrosProperties = {
    [MacroPropertiesOptions.Languages]?: string[]
    [MacroPropertiesOptions.Tags]?: string[]
}

export enum MacroPropertiesOptions {
    Languages = 'languages',
    Tags = 'tags',
}
