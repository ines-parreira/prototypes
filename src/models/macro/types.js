//@flow
import type {IntentName} from '../intent'
import type {MacroAction} from '../macroAction'

import {MACRO_SORTABLE_PROPERTIES} from './constants'

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
    intent: IntentName,
    name: string,
}

export type MacroSortableProperties = $Values<typeof MACRO_SORTABLE_PROPERTIES>
