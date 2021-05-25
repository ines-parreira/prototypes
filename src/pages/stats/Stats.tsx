import {fromJS, Map, List} from 'immutable'
import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Container} from 'reactstrap'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import _debounce from 'lodash/debounce'
import axios, {AxiosError} from 'axios'

import {
    stats as statsConfig,
    views as statViewsConfig,
} from '../../config/stats'
import GorgiasApi from '../../services/gorgiasApi'
import {notify} from '../../state/notifications/actions'
import {getViewFilters} from '../../state/stats/selectors'
import {errorToChildren} from '../../utils'
import {Notification, NotificationStatus} from '../../state/notifications/types'
import {RootState} from '../../state/types'

import Stat from './common/components/charts/Stat'

type Props = RouteComponentProps<{view: string}> &
    ConnectedProps<typeof connector>

type State = {
    fetchingStates: Map<any, any>
    stats: Map<any, any>
}

const initialState = {
    fetchingStates: fromJS({}) as Map<any, any>,
    stats: fromJS({}) as Map<any, any>,
}

export class StatsContainer extends React.Component<Props, State> {
    gorgiasApi = new GorgiasApi()
    state = initialState

    componentDidMount() {
        this.handleFetchStats()
    }

    componentDidUpdate(prevProps: Props) {
        const {filters, match} = this.props

        if (prevProps.match.params.view !== match.params.view) {
            this.handleFetchStats()
        } else if (!prevProps.filters?.equals(filters!)) {
            this.handleFetchStatsDebounced()
        }
    }

    componentWillUnmount() {
        this.gorgiasApi.cancelPendingRequests()
    }

    handleFetchStats = () => {
        const {
            match: {params},
            filters,
        } = this.props
        this.setState(initialState)
        const viewConfig = statViewsConfig.get(params.view) as Map<any, any>
        ;(viewConfig.get('stats') as List<any>).forEach((statName: string) =>
            this._fetchStat(statName, filters!)
        )
    }

    handleFetchStatsDebounced = _debounce(this.handleFetchStats, 1000)

    _fetchStat = (statName: string, filters: Map<any, any>) => {
        const {notify} = this.props
        const statConfig = statsConfig.get(statName) as Map<any, any>
        let resourceNames = fromJS([statName]) as List<any>

        if (statConfig.get('style') === 'key-metrics') {
            // key metrics can be fetched separately or all together.
            const resourceName = statConfig.get('api_resource_name')
            resourceNames = resourceName
                ? fromJS([resourceName])
                : (statConfig.get('metrics') as List<any>).map(
                      (metric: Map<any, any>) =>
                          metric.get('api_resource_name') as string
                  )
        }

        resourceNames.map(async (resourceName: string) => {
            // We store the fetching state and data of a statistic differently if this one has several api resources to fetch.
            const statStorageKey =
                resourceNames.size > 1
                    ? [statName, 'data', resourceName]
                    : [statName]
            const fetchingStateKey =
                resourceNames.size > 1 ? [statName, resourceName] : [statName]
            this.setState((state) => {
                return {
                    fetchingStates: state.fetchingStates.setIn(
                        fetchingStateKey,
                        true
                    ),
                }
            })

            try {
                const stat = await this.gorgiasApi.getStatistic(
                    resourceName,
                    fromJS({filters})
                )
                this.setState({
                    stats: this.state.stats.setIn(
                        statStorageKey,
                        fromJS({
                            meta: stat.get('meta'),
                            ...(stat.get('data') as Map<any, any>).toJS(),
                        })
                    ),
                })
                return stat
            } catch (error) {
                if (axios.isCancel(error)) {
                    return
                }

                const defaultError =
                    'Failed to retrieve statistic. Please retry in a few seconds.'
                const respData = (error as AxiosError<{error?: {msg: string}}>)
                    .response?.data
                const serverError =
                    respData && respData.error ? respData.error.msg : null
                const notification: Notification = {
                    status: NotificationStatus.Error,
                    title: serverError || defaultError,
                }
                const errorDetails = errorToChildren(error)

                if (errorDetails) {
                    notification.allowHTML = true
                    notification.message = errorDetails
                }
                void notify(notification)
            } finally {
                this.setState((state) => {
                    return {
                        fetchingStates: state.fetchingStates.setIn(
                            fetchingStateKey,
                            false
                        ),
                    }
                })
            }
        })
    }

    render() {
        const {
            match: {params},
            filters,
        } = this.props
        const viewConfig = statViewsConfig.get(params.view) as Map<any, any>
        const {stats} = this.state
        return (
            <Container fluid style={{padding: 0}}>
                {(viewConfig.get('stats') as List<any>).map(
                    (statName: string, idx?: number) => {
                        const statConfig = statsConfig.get(statName) as Map<
                            any,
                            any
                        >
                        const fetchingState = this.state.fetchingStates.get(
                            statName
                        )
                        const stat = stats.get(statName)
                            ? (stats.get(statName) as Map<any, any>).toObject()
                            : null

                        // An error occured: invalid filters, request timed out, etc....
                        if (!fetchingState && !stat) {
                            return null
                        }

                        let padding = '30px'
                        // First key metrics statistics are stuck to the top
                        if (
                            idx === 0 &&
                            statConfig.get('style') === 'key-metrics'
                        ) {
                            padding = '0 0 30px'
                        }

                        return (
                            <div style={{padding}} key={idx}>
                                <Stat
                                    loading={fetchingState}
                                    name={statName}
                                    config={statConfig}
                                    filters={filters!}
                                    {...(stat as {
                                        data: Map<any, any>
                                        meta: Map<any, any>
                                        legend: Map<any, any>
                                        label?: string
                                        downloadable?: boolean
                                    })}
                                />
                            </div>
                        )
                    }
                )}
            </Container>
        )
    }
}

const connector = connect(
    (state: RootState, props: RouteComponentProps<{view: string}>) => {
        return {
            filters: getViewFilters(props.match.params.view)(state),
        }
    },
    {notify}
)

export default withRouter(connector(StatsContainer))
