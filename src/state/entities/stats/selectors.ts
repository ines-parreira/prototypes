import {createSelector} from 'reselect'

import {Stat, OneDimensionalChart} from '../../../models/stat/types'
import {StatConfig, stats as statsConfig} from '../../../config/stats'
import {toJS} from '../../../utils'

import {RootState} from '../../types'

import {StatsState} from './types'

export const getStatDataByName = (statName: string) =>
    createSelector<RootState, Stat | undefined, StatsState>(
        (state) => state.entities.stats,
        (statsState) => {
            const config = toJS<StatConfig>(statsConfig.get(statName))

            /**
             * When requesting key-metrics charts we can either ask for each resource independently
             * or request them as a whole. The following block formats a key-metric chart with split resources
             * into a single chart.
             */
            if (config.style === 'key-metrics' && !config.api_resource_name) {
                return config.metrics!.reduce(
                    (acc, metric) => {
                        const stat =
                            statsState[
                                `${statName}/${metric.api_resource_name!}`
                            ]

                        if (!stat) {
                            return acc
                        }
                        acc.data.data.push(
                            (stat.data as OneDimensionalChart).data
                        )

                        if (Object.keys(acc.meta).length === 0 && stat.meta) {
                            acc.meta = stat.meta
                        }
                        return acc
                    },
                    {
                        data: {data: [] as OneDimensionalChart['data'][]},
                        meta: {},
                    }
                ) as Stat
            }
            return statsState[`${statName}/${statName}`]
        }
    )
