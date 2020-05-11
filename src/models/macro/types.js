//@flow
import type {IntentName} from '../intent'
import type {MacroAction} from '../macroAction'

import {MACRO_SORTABLE_PROPERTIES} from './constants'

export type Macro = MacroDraft & {
    category: string,
    createdDatetime: string,
    deactivatedDatetime?: string,
    deletedDatetime?: string,
    externalId: string,
    id: number,
    updatedDatetime: string,
    uri: string,
    usage: number,
}

export type MacroDraft = {
    actions: MacroAction[],
    intent: IntentName,
    name: string,
}

export type MacroSortableProperties = $Values<typeof MACRO_SORTABLE_PROPERTIES>
