import {fromJS, List, Map} from 'immutable'
import {createSelector} from 'reselect'
import moment from 'moment-timezone'

import {RootState} from '../types'
import {views as statViewsConfig} from '../../config/stats'

import {getIntegrations} from '../integrations/selectors'
import {getTimezone} from '../currentUser/selectors'

import {StatsState} from './types'

export const getStatsState = (state: RootState): StatsState => state.stats

export const getFilters = createSelector<
    RootState,
    Maybe<Map<any, any>>,
    StatsState
>(getStatsState, (state) => state.get('filters') as Maybe<Map<any, any>>)

export const makeStatsFiltersSelector = (viewName: string) =>
    createSelector<
        RootState,
        Maybe<Map<any, any>>,
        Maybe<Map<any, any>>,
        List<any>,
        string | null
    >(
        getFilters,
        getIntegrations,
        getTimezone,
        (globalFilters, integrations, timezone) => {
            const viewConfig = statViewsConfig.get(viewName) as Map<any, any>
            const viewFilterTypes = (viewConfig.get('filters') as Map<
                any,
                any
            >).map((filter: Map<any, any>) => filter.get('type') as string)

            if (!globalFilters) {
                return null
            }
            const viewFilters = globalFilters.toJS() as {integrations: number[]}
            const integrationFilter = (viewFilterTypes.includes('integrations')
                ? (viewConfig.get('filters') as List<any>).find(
                      (filter: Map<any, any>) =>
                          filter.get('type') === 'integrations'
                  )
                : null) as Maybe<Map<any, any>>

            if (integrationFilter) {
                const allowedTypes = integrationFilter.getIn([
                    'options',
                    'allowedTypes',
                ]) as List<string>
                const allowedIntegrations = allowedTypes
                    ? integrations.filter((integration: Map<any, any>) =>
                          allowedTypes.includes(integration.get('type'))
                      )
                    : integrations
                const allowedIntegrationIds = allowedIntegrations.map(
                    (integration: Map<string, unknown>) => integration.get('id')
                )

                if (!!allowedTypes && !!viewFilters.integrations) {
                    viewFilters.integrations = viewFilters.integrations.filter(
                        (integrationId: number) =>
                            allowedIntegrationIds.includes(integrationId)
                    )
                }

                if (
                    integrationFilter.getIn(['options', 'isRequired']) &&
                    (!viewFilters.integrations ||
                        viewFilters.integrations.length === 0)
                ) {
                    viewFilters.integrations = [
                        allowedIntegrationIds.get(0) as number,
                    ]
                }
            }
            return ((fromJS(viewFilters) as Map<
                string,
                any
            >).filter((_, filterType) =>
                viewFilterTypes.includes(filterType as string)
            ) as Map<any, any>).update('period', (value?: Map<any, any>) => {
                const currentTime = timezone ? moment().tz(timezone) : moment()
                return (
                    value ||
                    (fromJS({
                        start_datetime: currentTime
                            .clone()
                            .startOf('day')
                            .format(),
                        end_datetime: currentTime.clone().endOf('day').format(),
                    }) as Map<any, any>)
                )
            })
        }
    )

export const getSupportPerformanceAgentsStatsFilters = makeStatsFiltersSelector(
    'support-performance-agents'
)

export const getTagsStatsFilters = makeStatsFiltersSelector('tags')

export const getChannelsStatsFilters = makeStatsFiltersSelector('channels')
