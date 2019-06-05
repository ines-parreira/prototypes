// @flow
import {fromJS} from 'immutable'
import React from 'react'
import {connect} from 'react-redux'
import {Container} from 'reactstrap'
import type {List} from 'immutable'
import {withRouter} from 'react-router'

import axios from 'axios'

import {stats as statsConfig, views as statViewsConfig} from '../../config/stats'
import GorgiasApi from '../../services/gorgiasApi'
import {notify} from '../../state/notifications/actions'
import {getViewFilters} from '../../state/stats/selectors'

import Stat from './common/components/charts/Stat'

type Props = {
    params: Object,
    filters: Map<*, *>,
    notify: typeof notify
}

type State = {
    loadings: Map<*, *>,
    stats: Map<*, *>
}

export class Stats extends React.Component<Props, State> {
    gorgiasApi = new GorgiasApi()
    state = {
        loadings: fromJS({}), // store loading state of each stat on the view
        stats: fromJS({})
    }

    componentDidMount() {
        const {params, filters} = this.props
        const viewConfig = statViewsConfig.get(params.view)
        this._fetchStats(viewConfig.get('stats'), filters)
    }

    componentWillUnmount() {
        this.gorgiasApi.cancelPendingRequests()
    }

    _updateLoadingStatsState = (statNames: List<string>, loading: boolean) => {
        const statLoaders = statNames.reduce((loaders, statName) => {
            return loaders.set(statName, loading)
        }, fromJS({}))
        // $FlowFixMe
        this.setState({loadings: this.state.loadings.merge(statLoaders)})
    }

    _fetchStats = (statNames: List<string>, filters: Map<*, *>) => {
        const {notify} = this.props
        this._updateLoadingStatsState(statNames, true)

        return Promise.all([statNames.map(async(statName) => {
            try {
                const stat = await this.gorgiasApi.getStatistic(statName, fromJS({filters}))
                this.setState({
                    stats: this.state.stats.set(statName, fromJS({
                        'meta': stat.get('meta'),
                        ...stat.get('data').toJS()
                    }))
                })
                return stat
            } catch (error) {
                if (axios.isCancel(error)) {
                    return
                }

                const defaultError = 'Failed to get statistics. Please retry in a few seconds.'
                const respData = error.response.data
                const serverError = respData && respData.error ? respData.error.msg : null
                notify({
                    status: 'error',
                    title: serverError || defaultError
                })
            } finally {
                this._updateLoadingStatsState(fromJS([statName]), false)
            }
        })])
    }

    render() {
        const {params, filters} = this.props
        const viewConfig = statViewsConfig.get(params.view)
        const {stats} = this.state
        return (
            <Container
                fluid
                style={{padding: 0}}
            >
                {viewConfig.get('stats').map((statName, idx) => {
                    const statConfig = statsConfig.get(statName)
                    const isLoading = this.state.loadings.get(statName)
                    // $FlowFixMe
                    const stat = stats.get(statName) ? stats.get(statName).toObject() : null

                    // An error occured: invalid filters, request timed out, etc....
                    if (!isLoading && !stat) {
                        return null
                    }

                    let padding = '30px'
                    // First key metrics statistics are stuck to the top
                    if (idx === 0 && statConfig.get('style') === 'key-metrics') {
                        padding = '0 0 30px'
                    }

                    return (
                        <div
                            style={{padding}}
                            key={idx}
                        >
                            <Stat
                                isLoading={isLoading}
                                name={statName}
                                config={statConfig}
                                filters={filters}
                                {...stat}
                            />
                        </div>
                    )
                })
                }
            </Container>
        )
    }
}

const mapStateToProps = (state: Object, props: Props) => {
    return {
        filters: getViewFilters(props.params.view)(state)
    }
}

export default withRouter(connect(mapStateToProps, {notify})(Stats))
