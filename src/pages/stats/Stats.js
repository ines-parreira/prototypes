// @flow
import {fromJS} from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import {Container} from 'reactstrap'
import {withRouter} from 'react-router'

import axios from 'axios'

import {
    stats as statsConfig,
    views as statViewsConfig,
} from '../../config/stats'
import GorgiasApi from '../../services/gorgiasApi.ts'
import {notify} from '../../state/notifications/actions.ts'
import {getViewFilters} from '../../state/stats/selectors.ts'

import {errorToChildren} from '../../utils.ts'
import type {Notification} from '../../state/notifications/types'

import Stat from './common/components/charts/Stat'

type Props = {
    params: Object,
    filters: Map<*, *>,
    notify: typeof notify,
}

type State = {
    fetchingStates: Map<*, *>,
    stats: Map<*, *>,
}

export class Stats extends React.Component<Props, State> {
    gorgiasApi = new GorgiasApi()
    state = {
        fetchingStates: fromJS({}), // Store fetching state of each stat on the view.
        stats: fromJS({}),
    }

    componentDidMount() {
        const {params, filters} = this.props
        const viewConfig = statViewsConfig.get(params.view)
        viewConfig
            .get('stats')
            .forEach((statName) => this._fetchStat(statName, filters))
    }

    componentWillUnmount() {
        this.gorgiasApi.cancelPendingRequests()
    }

    _fetchStat = (statName: string, filters: Object) => {
        const {notify} = this.props
        const statConfig = statsConfig.get(statName)
        let resourceNames = fromJS([statName])

        if (statConfig.get('style') === 'key-metrics') {
            // key metrics can be fetched separately or all together.
            const resourceName = statConfig.get('api_resource_name')
            resourceNames = resourceName
                ? fromJS([resourceName])
                : statConfig
                      .get('metrics')
                      .map((metric) => metric.get('api_resource_name'))
        }

        resourceNames.map(async (resourceName) => {
            // We store the fetching state and data of a statistic differently if this one has several api resources to fetch.
            const statStorageKey =
                resourceNames.size > 1
                    ? [statName, 'data', resourceName]
                    : [statName]
            const fetchingStateKey =
                resourceNames.size > 1 ? [statName, resourceName] : [statName]
            this.setState((state) => {
                return {
                    // $FlowFixMe
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
                    // $FlowFixMe
                    stats: this.state.stats.setIn(
                        statStorageKey,
                        fromJS({
                            meta: stat.get('meta'),
                            ...stat.get('data').toJS(),
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
                const respData = error.response.data
                const serverError =
                    respData && respData.error ? respData.error.msg : null
                const notification: Notification = {
                    status: 'error',
                    title: serverError || defaultError,
                }
                const errorDetails = errorToChildren(error)

                if (errorDetails) {
                    notification.allowHTML = true
                    notification.message = errorDetails
                }
                notify(notification)
            } finally {
                this.setState((state) => {
                    return {
                        // $FlowFixMe
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
        const {params, filters} = this.props
        const viewConfig = statViewsConfig.get(params.view)
        const {stats} = this.state
        return (
            <Container fluid style={{padding: 0}}>
                {viewConfig.get('stats').map((statName, idx) => {
                    const statConfig = statsConfig.get(statName)
                    const fetchingState = this.state.fetchingStates.get(
                        statName
                    )
                    const stat = stats.get(statName)
                        ? // $FlowFixMe
                          stats.get(statName).toObject()
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
                                filters={filters}
                                {...stat}
                            />
                        </div>
                    )
                })}
            </Container>
        )
    }
}

const mapStateToProps = (state: Object, props: Props) => {
    return {
        filters: getViewFilters(props.params.view)(state),
    }
}

export default withRouter(connect(mapStateToProps, {notify})(Stats))
