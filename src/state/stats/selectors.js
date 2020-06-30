// @flow
import type {Map} from 'immutable'
import {createSelector} from 'reselect'

import type {stateType} from '../types'
import {views as statViewsConfig} from '../../config/stats'

export const getStatsState = (state: stateType) => state.stats

export const getFilters = createSelector(
    [getStatsState],
    (state: Map<*, *>): Map<*, *> => state.get('filters')
)

export const getViewFilters = (viewName: string) =>
    createSelector([getFilters], (globalFilters: Map<*, *>) => {
        const viewConfig = statViewsConfig.get(viewName)
        const viewFilterTypes = viewConfig
            .get('filters')
            .map((filter) => filter.get('type'))
        if (!globalFilters) {
            return null
        }

        return (globalFilters.filter((_, filterType) =>
            viewFilterTypes.includes(filterType)
        ): Map<*, *> | null)
    })
