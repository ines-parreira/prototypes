import {fromJS, Map, List} from 'immutable'
import {createSelector} from 'reselect'

import {RootState} from '../types'

import {State} from './types'

export const getMacrosState = (state: RootState): State =>
    state.macros || fromJS({})

export const getMacros = createSelector(
    getMacrosState,
    (state) => (state.get('items') || fromJS([])) as List<any>
)

export const getMacroParametersOptions = createSelector(
    getMacrosState,
    (state) => (state.get('parameters_options') || fromJS({})) as Map<any, any>
)
