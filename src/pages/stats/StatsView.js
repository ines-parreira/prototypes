import React, {PropTypes} from 'react'
import update from 'react/lib/update'
import moment from 'moment'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import _debounce from 'lodash/debounce'
import {stats as statsConfig} from '../../config/stats'
import {Container} from 'reactstrap'

import PeriodPicker from './common/PeriodPicker'
import PageHeader from '../common/components/PageHeader'
import {fieldEnumSearch} from '../../state/views/actions'
import SearchableSelectField from './common/SearchableSelectField'
import Stat from './common/components/charts/Stat'

class StatsView extends React.Component {
    static propTypes = {
        config: PropTypes.object.isRequired,
        channels: PropTypes.array,
        agents: PropTypes.array,
        tags: PropTypes.array,
        stats: PropTypes.object.isRequired,
        meta: PropTypes.object.isRequired,
        filters: PropTypes.object.isRequired,
        fetchStat: PropTypes.func.isRequired,
        setMeta: PropTypes.func.isRequired,
        setFilters: PropTypes.func.isRequired,
        fieldEnumSearch: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            tags: props.tags,
            loadings: {} // store loading state of each stat on the view
        }
    }

    componentWillMount() {
        const {config, meta, filters} = this.props
        this._fetchStats(config.get('stats'), meta.toJS(), filters.toJS())
    }

    /**
     * Reset filters and meta when users leave statistics
     */
    componentWillUnmount() {
        this.props.setFilters(fromJS({}))
        this.props.setMeta(fromJS({}))
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.config.get('name') !== nextProps.config.get('name')) {
            this._fetchStats(nextProps.config.get('stats'), nextProps.meta.toJS(), nextProps.filters.toJS())
        }
    }

    _updateLoadingStatsState = (stats, loading) => {
        let newState = this.state

        stats.forEach((stat) => {
            newState = update(newState, {
                loadings: {
                    [stat]: {$set: loading}
                }
            })
        })
        this.setState(newState)
    }

    _fetchStats = (stats, meta, filters) => {
        this._updateLoadingStatsState(stats, true)

        stats.forEach(stat => {
            this.props.fetchStat(stat, meta, filters).then(() => {
                this._updateLoadingStatsState([stat], false)
            })
        })
    }

    _handleDateChange = (meta) => {
        this.props.setMeta(meta)
        this._fetchStats(this.props.config.get('stats'), meta, this.props.filters.toJS())
    }

    _handleFilterChange = (filterName) => {
        return (values) => {
            const filters = this.props.filters.set(filterName, fromJS(values))
            this.props.setFilters(filters)
            this._fetchStats(this.props.config.get('stats'), this.props.meta.toJS(), filters.toJS())
        }
    }

    _onSearchTags = _debounce((search) => {
        const field = fromJS({
            filter: {type: 'tag'}
        })

        this.props.fieldEnumSearch(field, search)
            .then((data) => {
                this.setState({
                    tags: data.toJS(),
                })
            })
    }, 300)

    // returns a redux-form like input to use the field outside of redux-form context
    _makeInputControl = (name) => {
        const {filters} = this.props

        return {
            value: filters.get(name, fromJS([])).toJS(),
            onChange: this._handleFilterChange(name),
        }
    }

    render() {
        const {config, filters, meta, stats} = this.props
        const startDatetime = moment(meta.get('start_datetime'))
        const endDatetime = moment(meta.get('end_datetime'))

        return (
            <div className="stats full-width">
                <PageHeader title={config.get('name')} className="mb-0">
                    <div className="d-flex flex-wrap float-right">
                        {config.get('filters', []).includes('agents') && (
                            <SearchableSelectField
                                plural="agents"
                                singular="agent"
                                items={this.props.agents}
                                input={this._makeInputControl('agents')}
                            />
                        )}
                        {config.get('filters', []).includes('tags') && (
                            <SearchableSelectField
                                plural="tags"
                                singular="tag"
                                items={this.state.tags.map(tag => ({label: tag.name, value: tag.id}))}
                                input={this._makeInputControl('tags')}
                                onSearch={this._onSearchTags}
                            />
                        )}
                        {config.get('filters', []).includes('channels') && (
                            <SearchableSelectField
                                plural="channels"
                                singular="channel"
                                items={this.props.channels}
                                input={this._makeInputControl('channels')}
                            />
                        )}
                        {config.get('filters', []).includes('date') && (
                            <PeriodPicker
                                startDatetime={startDatetime}
                                endDatetime={endDatetime}
                                onChange={this._handleDateChange}
                            />
                        )}
                    </div>
                </PageHeader>

                <Container fluid style={{padding: 0}}>
                    {config.get('stats').map((statName, idx) => {
                        const isCurrentStatLoading = this.state.loadings[statName]
                        const stat = stats.get(statName)
                        const isLoading = isCurrentStatLoading || !stat
                        const statConfig = statsConfig.get(statName)
                        let padding = '30px'
                        const statProps = isLoading ? {} : stat.toObject()
                        // First key metrics statistics are stuck to the top
                        if (idx === 0 && statConfig.get('style') === 'key-metrics') {
                            padding = '0 0 30px'
                        }

                        return (
                            <div style={{padding}} key={idx}>
                                <Stat
                                    isLoading={isLoading}
                                    name={statName}
                                    config={statConfig}
                                    filters={filters}
                                    {...statProps}
                                />
                            </div>
                        )
                    })}
                </Container>
            </div>
        )
    }
}

export default connect(null, {fieldEnumSearch})(StatsView)
