import {fromJS, Map, List} from 'immutable'
import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Container} from 'reactstrap'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import _debounce from 'lodash/debounce'
import axios, {AxiosError, Canceler} from 'axios'

import {
    stats as statsConfig,
    views as statViewsConfig,
} from '../../config/stats'
import {notify} from '../../state/notifications/actions'
import {makeStatsFiltersSelector} from '../../state/stats/selectors'
import {errorToChildren} from '../../utils'
import {Notification, NotificationStatus} from '../../state/notifications/types'
import {RootState} from '../../state/types'
import {statFetched} from '../../state/entities/stats/actions'
import {fetchStat} from '../../models/stat/resources'
import {fetchStatEnded, fetchStatStarted} from '../../state/ui/stats/actions'

import Stat from './common/components/charts/Stat'

type Props = RouteComponentProps<{view: string}> &
    ConnectedProps<typeof connector>

export class StatsContainer extends React.Component<Props> {
    cancellableRequests: {[key: string]: Canceler} = {}

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
        Object.values(this.cancellableRequests).map((cancel) => cancel())
    }

    handleFetchStats = () => {
        const {
            match: {params},
            filters,
        } = this.props
        const viewConfig = statViewsConfig.get(params.view) as Map<any, any>
        ;(viewConfig.get('stats') as List<any>)
            .filter(
                (statName: string) =>
                    statsConfig.getIn([statName, 'style']) !== 'element'
            )
            .forEach((statName: string) => this._fetchStat(statName, filters!))
    }

    handleFetchStatsDebounced = _debounce(this.handleFetchStats, 1000)

    _fetchStat = (statName: string, filters: Map<any, any>) => {
        const {
            notify,
            statFetched,
            fetchStatEnded,
            fetchStatStarted,
        } = this.props
        const statConfig = statsConfig.get(statName)
        let resourceNames = fromJS([statName]) as List<any>
        if (statConfig.get('style') === 'key-metrics') {
            // key metrics can be fetched separately or all together.
            const resourceName = statConfig.get('api_resource_name')
            resourceNames = resourceName
                ? fromJS([resourceName])
                : (statConfig.get('metrics') as List<any>)
                      .map(
                          (metric: Map<any, any>) =>
                              metric.get('api_resource_name') as string
                      )
                      .toSet()
                      .toList()
        }

        resourceNames.map(async (resourceName: string) => {
            void fetchStatStarted({statName, resourceName})

            try {
                const cancelToken = axios.CancelToken.source()
                if (this.cancellableRequests[`${resourceName}/${statName}`]) {
                    this.cancellableRequests[`${resourceName}/${statName}`]()
                }
                this.cancellableRequests[`${resourceName}/${statName}`] =
                    cancelToken.cancel
                const stat = await fetchStat(
                    resourceName,
                    {filters: filters.toJS()},
                    {
                        cancelToken: cancelToken.token,
                    }
                )

                void statFetched({
                    resourceName,
                    statName,
                    value: stat,
                })
                delete this.cancellableRequests[`${resourceName}/${statName}`]
                void fetchStatEnded({statName, resourceName})
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
                const errorDetails = errorToChildren(error as AxiosError)

                if (errorDetails) {
                    notification.allowHTML = true
                    notification.message = errorDetails
                }
                void notify(notification)
                delete this.cancellableRequests[`${resourceName}/${statName}`]
                void fetchStatEnded({statName, resourceName})
            }
        })
    }

    render() {
        const {
            match: {params},
        } = this.props
        const viewConfig = statViewsConfig.get(params.view) as Map<any, any>

        return (
            <Container fluid style={{padding: 0}}>
                {(viewConfig.get('stats') as List<any>).map(
                    (statName: string, idx?: number) => {
                        const statConfig = statsConfig.get(statName)
                        let padding = '30px'
                        // First key metrics statistics are stuck to the top
                        if (
                            idx === 0 &&
                            statConfig.get('style') === 'key-metrics'
                        ) {
                            padding = '0 0 30px'
                        } else if (
                            idx !== 0 &&
                            statConfig.get('style') === 'element'
                        ) {
                            padding = '0 30px'
                        }

                        return (
                            <div style={{padding}} key={idx}>
                                <Stat name={statName} />
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
            filters: makeStatsFiltersSelector(props.match.params.view)(state),
        }
    },
    {notify, statFetched, fetchStatEnded, fetchStatStarted}
)

export default withRouter(connector(StatsContainer))
