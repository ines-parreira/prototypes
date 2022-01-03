import {fromJS, List, Map} from 'immutable'
import {createSelector, Selector} from 'reselect'
import moment from 'moment-timezone'

import {RootState} from '../types'
import {views as statViewsConfig} from '../../config/stats'

import {
    getIntegrations,
    getIntegrationsByTypes,
} from '../integrations/selectors'
import {getTimezone} from '../currentUser/selectors'
import {Integration} from '../../models/integration/types'
import {makeGetPlainJS} from '../../utils'

import {StatsFilters, StatsState} from './types'
import {
    STATS_MESSAGING_INTEGRATIONS_TYPES,
    STATS_STORE_INTEGRATION_TYPES,
} from './constants'

export const getStatsState = (state: RootState): StatsState => state.stats

export const getFilters = createSelector<
    RootState,
    Maybe<Map<any, any>>,
    StatsState
>(getStatsState, (state) => state.get('filters') as Maybe<Map<any, any>>)

export const getStatsFiltersJS = createSelector(getFilters, (filters) =>
    filters ? (filters.toJS() as StatsFilters) : null
)

export const DEPRECATED_makeStatsFiltersSelector = (viewName: string) =>
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
            const viewFilterTypes = (
                viewConfig.get('filters') as Map<any, any>
            ).map((filter: Map<any, any>) => filter.get('type') as string)

            if (!globalFilters) {
                return null
            }
            const viewFilters = globalFilters.toJS() as {integrations: number[]}
            const integrationFilter = (
                viewFilterTypes.includes('integrations')
                    ? (viewConfig.get('filters') as List<any>).find(
                          (filter: Map<any, any>) =>
                              filter.get('type') === 'integrations'
                      )
                    : null
            ) as Maybe<Map<any, any>>

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
            return (
                (fromJS(viewFilters) as Map<string, any>).filter(
                    (_, filterType) =>
                        viewFilterTypes.includes(filterType as string)
                ) as Map<any, any>
            ).update('period', (value?: Map<any, any>) => {
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

export const getSupportPerformanceAgentsStatsFilters =
    DEPRECATED_makeStatsFiltersSelector('support-performance-agents')

export const getTagsStatsFilters = DEPRECATED_makeStatsFiltersSelector('tags')

export const getChannelsStatsFilters =
    DEPRECATED_makeStatsFiltersSelector('channels')

export const getLiveAgentsStatsFilters =
    DEPRECATED_makeStatsFiltersSelector('live-agents')

const makeIntegrationsStatsFilterSelector = (
    integrationsSelector: Selector<RootState, Integration[]>
) => {
    return createSelector(
        getStatsFiltersJS,
        integrationsSelector,
        (statsFilters, integrations) => {
            const integrationsIds = integrations.map(
                (integration) => integration.id
            )
            return (
                statsFilters?.integrations?.filter((integrationId: number) =>
                    integrationsIds.includes(integrationId)
                ) || []
            )
        }
    )
}

export const getStatsMessagingIntegrations = makeGetPlainJS<Integration[]>(
    getIntegrationsByTypes(STATS_MESSAGING_INTEGRATIONS_TYPES)
)

export const getMessagingIntegrationsStatsFilter =
    makeIntegrationsStatsFilterSelector(getStatsMessagingIntegrations)

export const getStatsStoreIntegrations = makeGetPlainJS<Integration[]>(
    getIntegrationsByTypes(STATS_STORE_INTEGRATION_TYPES)
)

export const getStoreIntegrationsStatsFilter =
    makeIntegrationsStatsFilterSelector(getStatsStoreIntegrations)
