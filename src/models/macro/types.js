//@flow
import {type MetaSortOptions, type OrderDirection} from '../api'
import type {IntentName} from '../intent'
import type {MacroAction} from '../macroAction'

import {MACRO_SORTABLE_PROPERTIES} from './constants.ts'

export type Macro = MacroDraft & {
    category: string,
    created_datetime: string,
    deactivated_datetime?: string,
    deleted_datetime?: string,
    external_id: string,
    id: number,
    updated_datetime: string,
    uri: string,
    usage: number,
}

export type MacroDraft = {
    actions: MacroAction[],
    intent: ?IntentName,
    name: string,
}

export type MacroSortableProperties = $Values<typeof MACRO_SORTABLE_PROPERTIES>

export type FetchMacrosOptions = {
    fallbackOrderBy?: MacroSortableProperties,
    messageId?: number,
    orderBy?: MacroSortableProperties | MetaSortOptions,
    orderDir?: OrderDirection,
    page?: number,
    search?: string,
    ticketId?: number,
}
