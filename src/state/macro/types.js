import {type List, type Map} from 'immutable'

export type Macro = Map<*, { actions: MacroAction }>
export type State = Map<number, Macro>

export type MacroAction = Map<*, {
    arguments: {
        attachments: List<{ url: string }>
    }
}>
