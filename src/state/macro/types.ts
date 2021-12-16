import {Map} from 'immutable'

import {GorgiasApiError} from '../../models/api/types'

export type Macro = Map<any, any>
export type State = Map<number, Macro>

export type MacroApiError = GorgiasApiError<{
    actions: Record<string, Record<string, Record<string, string>[]>>
}>
