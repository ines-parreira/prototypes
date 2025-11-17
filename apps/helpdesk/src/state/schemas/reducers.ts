import { fromJS } from 'immutable'

import type { SchemasState } from './types'

const initialState: SchemasState = fromJS({})

export default function reducer(
    state: SchemasState = initialState,
): SchemasState {
    return state
}
