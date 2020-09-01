import {Map} from 'immutable'
import {createSelector} from 'reselect'

import {RootState} from '../types'
import {views as statViewsConfig} from '../../config/stats.js'

import {StatsState} from './types'

export const getStatsState = (state: RootState): StatsState => state.stats

export const getFilters = createSelector<RootState, Map<any, any>, StatsState>(
    getStatsState,
    (state) => state.get('filters') as Map<any, any>
)

export const getViewFilters = (viewName: string) =>
    createSelector<RootState, Maybe<Map<any, any>>, Map<any, any>>(
        getFilters,
        (globalFilters) => {
            const viewConfig = (statViewsConfig as Map<any, any>).get(
                viewName
            ) as Map<any, any>
            const viewFilterTypes = (viewConfig.get('filters') as Map<
                any,
                any
            >).map((filter: Map<any, any>) => filter.get('type') as string)
            if (!globalFilters) {
                return null
            }

            return globalFilters.filter((_, filterType) =>
                viewFilterTypes.includes(filterType)
            ) as Maybe<Map<any, any>>
        }
    )
