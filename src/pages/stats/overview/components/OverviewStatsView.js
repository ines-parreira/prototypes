import React, {PropTypes} from 'react'
import moment from 'moment'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import _debounce from 'lodash/debounce'
import {config as statsConfig} from '../../../../config/stats'

import PeriodPicker from '../../common/PeriodPicker'
import PageHeader from '../../../common/components/PageHeader'
import Loader from '../../../common/components/Loader'
import {fieldEnumSearch} from '../../../../state/views/actions'
import SearchableSelectField from '../../common/SearchableSelectField'
import Stat from '../../common/components/charts/Stat'

class OverviewStatsView extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            tags: props.tags,
        }
    }

    componentDidMount() {
        this.props.fetchStats({type: 'overview'})
    }

    _handleDateChange = (meta) => {
        meta.type = 'overview'
        this.props.fetchStats(meta)
    }

    _handleFilterChange = (filterName) => {
        return (values) => {
            this.props.setFilter(filterName, fromJS(values))
            this.props.fetchStats({type: 'overview'})
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
        const {meta, isLoading, stats} = this.props
        const startDatetime = moment(meta.get('start_datetime'))
        const endDatetime = moment(meta.get('end_datetime'))

        return (
            <div className="stats">
                <PageHeader title="Overview">
                    <div className="d-flex flex-wrap pull-right">
                        <SearchableSelectField
                            plural="agents"
                            singular="agent"
                            items={this.props.agents}
                            input={this._makeInputControl('agents')}
                            isDisabled={isLoading}
                        />
                        <SearchableSelectField
                            plural="tags"
                            singular="tag"
                            items={this.state.tags.map(tag => ({label: tag.name, value: tag.id}))}
                            input={this._makeInputControl('tags')}
                            isDisabled={isLoading}
                            onSearch={this._onSearchTags}
                        />
                        <SearchableSelectField
                            plural="channels"
                            singular="channel"
                            items={this.props.channels}
                            input={this._makeInputControl('channels')}
                            isDisabled={isLoading}
                        />
                        <PeriodPicker
                            startDatetime={startDatetime}
                            endDatetime={endDatetime}
                            onChange={this._handleDateChange}
                            isDisabled={isLoading}
                        />
                    </div>
                </PageHeader>
                {isLoading || stats.isEmpty() ?
                    <Loader/>
                    :
                    stats.map((stat, idx) => {
                        const config = statsConfig.get(stat.get('name'))
                        return (
                            <Stat
                                key={idx}
                                config={config}
                                meta={meta}
                                {...stat.toObject()}
                            />
                        )
                    })
                }
            </div>
        )
    }
}

OverviewStatsView.propTypes = {
    channels: PropTypes.array,
    agents: PropTypes.array,
    tags: PropTypes.array,
    stats: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    filters: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
    fetchStats: PropTypes.func.isRequired,
    setFilter: PropTypes.func.isRequired,
    fieldEnumSearch: PropTypes.func.isRequired,
}

const mapDispatchToProps = {
    fieldEnumSearch,
}

export default connect(null, mapDispatchToProps)(OverviewStatsView)
