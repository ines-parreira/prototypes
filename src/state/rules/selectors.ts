import {createSelector} from 'reselect'
import {fromJS, Map} from 'immutable'

import {RootState} from '../types'

import {RulesState} from './types'

export const getRulesState = (state: RootState): RulesState =>
    state.rules || fromJS({})

export const getRules = createSelector<RootState, Map<any, any>, RulesState>(
    getRulesState,
    (state) => (state.get('rules') || fromJS({})) as Map<any, any>
)

export const getRule = (id: string) =>
    createSelector<RootState, Map<any, any>, Map<any, any>>(
        getRules,
        (state) => {
            if (!id) {
                return fromJS({}) as Map<any, any>
            }

            return (state.get(id.toString()) || fromJS({})) as Map<any, any>
        }
    )

export const getInternal = createSelector<
    RootState,
    Map<any, any>,
    Map<any, any>
>(
    getRulesState,
    (state) => (state.get('_internal') || fromJS({})) as Map<any, any>
)
