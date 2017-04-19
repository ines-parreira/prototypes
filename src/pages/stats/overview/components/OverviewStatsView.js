import React, {PropTypes} from 'react'
import moment from 'moment'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import _isNumber from 'lodash/isNumber'
import _debounce from 'lodash/debounce'
import {UncontrolledTooltip} from 'reactstrap'

import PeriodPicker from '../../common/PeriodPicker'
import PageHeader from '../../../common/components/PageHeader'
import {Loader} from '../../../common/components/Loader'
import {renderDifference, comparedPeriodString} from '../../common/utils'
import {fieldEnumSearch} from '../../../../state/views/actions'
import SearchableSelectField from '../../common/SearchableSelectField'

// format a value and display it as a percentage
const formatPercent = (value) => {
    return _isNumber(value) ? `${value}%` : ''
}

// format a value and display it as a duration (days, hours, minutes or seconds)
const formatDuration = (value) => {
    const duration = moment.duration(value, 'seconds')
    let response = ''

    const days = duration.days()
    if (days) {
        response += `${days}d `
    }

    const hours = duration.hours()
    if (hours) {
        response += `${hours}h `
    }

    const minutes = duration.minutes()
    if (minutes) {
        response += `${minutes}m `
    }

    const seconds = duration.seconds()
    if (!response && seconds) {
        response = `${seconds}s`
    }

    return response
}

const availableStats = fromJS([
    {
        name: 'total_new_tickets',
        value: v => v,
        label: 'New tickets',
        tooltip: 'Tickets created during this period',
    },
    {
        name: 'total_closed_tickets',
        value: v => v,
        label: 'Closed tickets',
        tooltip: 'Tickets closed during this period. If a ticket was closed multiple times, we only take into account the last time it was closed',
    },
    {
        name: 'total_ticket_messages_sent',
        value: v => v,
        tooltip: 'Total number of messages on all channels sent by agents',
        label: 'Messages sent',
    },
    {
        name: 'total_ticket_messages_received',
        value: v => v,
        tooltip: 'Total number of messages on all channels received from user',
        label: 'Messages received',
    },
    {
        name: 'median_first_response_time',
        value: v => formatDuration(v),
        tooltip: `Difference between the date when the first message was received from 
the user and the first response of the agent. Only tickets with at least 1 response are taken into account (median)`,
        label: 'First response time',
        moreIsBetter: false,
    },
    {
        name: 'median_resolution_time',
        value: v => formatDuration(v),
        tooltip: `Difference between the date the ticket was created and when it was closed (median). 
                        Only tickets with at least 1 response are taken into account`,
        label: 'Resolution time',
        moreIsBetter: false,
    },
    {
        name: 'total_one_touch_tickets',
        value: v => formatPercent(v),
        tooltip: 'Percentage of tickets that were solved with only one response from your agents',
        label: 'One-touch tickets',
        moreIsBetter: true,
    },
    // {
    //     name: 'satisfaction_score',
    //     value: v => formatPercent(v),
    //     tooltip: 'Positive satisfaction ratings minus negative satisfaction ratings',
    //     label: 'Satisfaction score',
    //     moreIsBetter: true,
    // }
])

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

    // render helper tooltip displaying description of each statistic
    _renderTooltip = (id, text, content, options = {}) => {
        return (
            <span>
                <span
                    id={id}
                >
                    {content}
                </span>
                <UncontrolledTooltip
                    placement="top"
                    target={id}
                    delay={0}
                    {...options}
                >
                    {text}
                </UncontrolledTooltip>
            </span>
        )
    }

    _renderValue = (config, value, key, tooltipDelta) => {
        const {stats} = this.props

        value = config.get('value')(value)

        if (value || value === 0) {
            return (
                <span className="value">
                    {value}
                    {
                        this._renderTooltip(
                            `value-${config.get('name')}`,
                            tooltipDelta,
                            renderDifference(
                                stats.getIn(['difference_period', key]),
                                config.get('moreIsBetter')
                            ),
                            {
                                tether: {
                                    offset: '-10px 0',
                                },
                            }
                        )
                    }
                </span>
            )
        }

        return <span className="value">n/a</span>
    }

    // render the grid of statistics
    _renderStatistics = () => {
        const {stats, meta} = this.props

        const previousStartDatetime = moment(meta.get('previous_start_datetime'))
        const previousEndDatetime = moment(meta.get('previous_end_datetime'))

        const tooltipDelta = comparedPeriodString(previousStartDatetime, previousEndDatetime)

        const currentPeriod = stats.get('current_period') || fromJS({})

        return (
            <div className="ui card stats-card">
                <div className="content">
                    <div className="ui statistics">
                        {
                            availableStats.map((config) => {
                                const currentPeriodStat = currentPeriod.find((value, key) => key === config.get('name'))

                                if (currentPeriodStat === null) {
                                    return null
                                }

                                return (
                                    <div
                                        className="statistic"
                                        key={config.get('name')}
                                    >
                                        <div className="label">
                                            {config.get('label')}
                                            {
                                                this._renderTooltip(
                                                    `title-${config.get('name')}`,
                                                    config.get('tooltip'),
                                                    <i className="help circle link icon" />
                                                )
                                            }
                                        </div>
                                        {this._renderValue(config, currentPeriodStat, config.get('name'), tooltipDelta)}
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }

    // returns a redux-form like input to use the field outside of redux-form context
    _makeInputControl = (name) => {
        const {filters} = this.props

        return {
            value: filters.get(name, fromJS([])).toJS(),
            onChange: this._handleFilterChange(name),
        }
    }

    render() {
        const {meta, isLoading} = this.props

        const startDatetime = moment(meta.get('start_datetime'))
        const endDatetime = moment(meta.get('end_datetime'))

        return (
            <div className="view stats">
                <PageHeader title="Overview">
                    <div className="ui right floated flex">
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
                {isLoading ? <Loader loading /> : this._renderStatistics()}
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
