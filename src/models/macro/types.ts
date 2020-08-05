import {IntentName} from '../intent/types'
import {MacroAction} from '../macroAction/types'
import {MetaSortOptions, OrderDirection} from '../api/types'

export type Macro = MacroDraft & {
    category: string
    created_datetime: string
    deactivated_datetime?: string
    deleted_datetime?: string
    external_id: string
    id: number
    updated_datetime: string
    uri: string
    usage: number
}

export type MacroDraft = {
    actions: MacroAction[]
    intent: Maybe<IntentName>
    name: string
}

export enum MacroSortableProperties {
    CreatedDatetime = 'createdDatetime',
    Name = 'name',
    UpdatedDatetime = 'updatedDatetime',
    Usage = 'usage',
}

export type FetchMacrosOptions = {
    fallbackOrderBy?: MacroSortableProperties
    messageId?: number
    orderBy?: MacroSortableProperties | MetaSortOptions
    orderDir?: OrderDirection
    page?: number
    search?: string
    ticketId?: number
}
