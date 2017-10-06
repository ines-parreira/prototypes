// @flow
import {fromJS} from 'immutable'

import type {Map} from 'immutable'

const initialState = fromJS({})

export default (state: Map<*,*> = initialState): Map<*,*> => {
    return state
}
