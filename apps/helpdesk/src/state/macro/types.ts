import type { Map } from 'immutable'

import type { GorgiasApiError } from '../../models/api/types'

export type Macro = Map<any, any>
export type State = Map<any, any>

export type MacroApiError = GorgiasApiError<{
    actions: Record<string, Record<string, Record<string, string>[]>>
    name: string[]
}>
