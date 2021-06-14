import {createSelector} from 'reselect'
import {Map} from 'immutable'

import {stats as statsConfig} from '../../../config/stats'
import {RootState} from '../../types'

import {StatsState} from './types'

export const getFetchingStatusByName = (statName: string) =>
    createSelector<
        RootState,
        boolean | {[resourceName: string]: boolean} | undefined,
        StatsState
    >(
        (state) => state.ui.stats,
        (stats) => {
            const config = (statsConfig.get(statName) as Map<
                any,
                any
            >).toJS() as {
                style: string
                api_resource_name?: string
                metrics: {api_resource_name: string}[]
            }

            /**
             * When requesting key-metrics charts we can either ask for each resource independently
             * or request them as a whole. The following block formats a map of resource name to boolean
             * in case they are fetched separately.
             */
            if (config.style === 'key-metrics' && !config.api_resource_name) {
                return config.metrics.reduce((acc, metric) => {
                    acc[metric.api_resource_name] = !!stats.fetchingMap[
                        `${statName}/${metric.api_resource_name}`
                    ]

                    return acc
                }, {} as {[resourceName: string]: boolean})
            }
            return stats.fetchingMap[`${statName}/${statName}`]
        }
    )
