// @flow
import moment from 'moment'
import {fromJS} from 'immutable'

import type {Map} from 'immutable'

import type {actionType} from '../types'
import {getHashOfObj} from '../../utils'

import * as constants from './constants'

export const initialState = fromJS({
    _internal: {
        loading: {},
        filters: {
            // default period: last 7 days
            period: {
                'start_datetime': moment().startOf('day').subtract(6, 'days').format(),
                'end_datetime': moment().endOf('day').format()
            }
        }
    }
})

export default function reducer(state: Map<*, *> = initialState, action: actionType): Map<*, *> {
    switch (action.type) {
        case constants.FETCH_STATS_SUCCESS: {
            const currentFiltersHash = getHashOfObj(state.getIn(['_internal', 'filters']))

            // We do not replace statistics if the filters used to fetch these statistics
            // do not match the filters currently selected.
            if (currentFiltersHash !== action.filtersHash) {
                return state
            }

            return state.set(action.name, fromJS({
                'meta': action.stat.meta,
                ...action.stat.data
            }))
        }

        case constants.RESET_STATS_FILTERS: {
            const filtersPath = ['_internal', 'filters']
            return state.setIn(filtersPath, initialState.getIn(filtersPath))
        }

        case constants.SET_STATS_FILTERS:
            return state.setIn(['_internal', 'filters'], fromJS(action.filters))

        default:
            return state
    }
}
