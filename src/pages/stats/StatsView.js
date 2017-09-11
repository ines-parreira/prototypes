import React, {PropTypes} from 'react'
import moment from 'moment'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import _debounce from 'lodash/debounce'
import {stats as statsConfig} from '../../config/stats'

import PeriodPicker from './common/PeriodPicker'
import PageHeader from '../common/components/PageHeader'
import Loader from '../common/components/Loader'
import {fieldEnumSearch} from '../../state/views/actions'
import SearchableSelectField from './common/SearchableSelectField'
import Stat from './common/components/charts/Stat'

class OverviewStatsView extends React.Component {
    static propTypes = {
        config: PropTypes.object.isRequired,
        channels: PropTypes.array,
        agents: PropTypes.array,
        tags: PropTypes.array,
        stats: PropTypes.object.isRequired,
        meta: PropTypes.object.isRequired,
        filters: PropTypes.object.isRequired,
        isLoading: PropTypes.bool.isRequired,
        fetchStat: PropTypes.func.isRequired,
        setFilter: PropTypes.func.isRequired,
        fieldEnumSearch: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            tags: props.tags,
        }
    }

    componentWillMount() {
        this._fetchStats(this.props.config.get('stats'))
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.config.get('name') !== nextProps.config.get('name')) {
            this._fetchStats(nextProps.config.get('stats'))
        }
    }

    _fetchStats = (stats, meta) => {
        stats.forEach(stat => {
            this.props.fetchStat(stat, meta)
        })
    }

    _handleDateChange = (meta) => {
        this._fetchStats(this.props.config.get('stats'), meta)
    }

    _handleFilterChange = (filterName) => {
        return (values) => {
            this.props.setFilter(filterName, fromJS(values))
            this._fetchStats(this.props.config.get('stats'))
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
        const {meta, isLoading, stats, config,} = this.props
        const startDatetime = moment(meta.get('start_datetime'))
        const endDatetime = moment(meta.get('end_datetime'))

        return (
            <div className="stats">
                <PageHeader title={config.get('name')}>
                    <div className="d-flex flex-wrap pull-right">
                        {config.get('filters', []).includes('agents') && (
                            <SearchableSelectField
                                plural="agents"
                                singular="agent"
                                items={this.props.agents}
                                input={this._makeInputControl('agents')}
                                isDisabled={isLoading}
                            />
                        )}
                        {config.get('filters', []).includes('tags') && (
                            <SearchableSelectField
                                plural="tags"
                                singular="tag"
                                items={this.state.tags.map(tag => ({label: tag.name, value: tag.id}))}
                                input={this._makeInputControl('tags')}
                                isDisabled={isLoading}
                                onSearch={this._onSearchTags}
                            />
                        )}
                        {config.get('filters', []).includes('channels') && (
                            <SearchableSelectField
                                plural="channels"
                                singular="channel"
                                items={this.props.channels}
                                input={this._makeInputControl('channels')}
                                isDisabled={isLoading}
                            />
                        )}
                        {config.get('filters', []).includes('date') && (
                            <PeriodPicker
                                startDatetime={startDatetime}
                                endDatetime={endDatetime}
                                onChange={this._handleDateChange}
                                isDisabled={isLoading}
                            />
                        )}
                    </div>
                </PageHeader>
                {config.get('stats').map(statName => {
                    if (isLoading) {
                        return <Loader/>
                    }

                    const stat = stats.get(statName)

                    if (!stat) {
                        return <Loader/>
                    }

                    const statConfig = statsConfig.get(statName)

                    return (
                        <Stat
                            key={statName}
                            config={statConfig}
                            meta={meta}
                            {...stat.toObject()}
                        />
                    )
                })}
            </div>
        )
    }
}

export default connect(null, {fieldEnumSearch})(OverviewStatsView)
