import React, {PropTypes} from 'react'
import moment from 'moment'
import {fromJS} from 'immutable'
import PeriodPicker from '../../common/PeriodPicker'
import PageHeader from '../../../common/components/PageHeader'
import {Loader} from '../../../common/components/Loader'
import {renderDifference, comparedPeriodString} from '../../common/utils'
import SearchableSelectField from '../../../common/forms/SearchableSelectField'
import _isNumber from 'lodash/isNumber'

import 'react-datepicker/dist/react-datepicker.css'

export default class OverviewStatsView extends React.Component {
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

    // format a value and display it as a percentage
    _formatPercent(d) {
        return _isNumber(d) ? `${d}%` : ''
    }

    // format a value and display it as a duration (days, hours, minutes or seconds)
    _formatDuration(value) {
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

    // add meta info on how to display each statistic
    _transformValues = (stats = fromJS([])) => {
        return stats.map((v, key) => {
            switch (key) {
                case 'median_resolution_time':
                    return {
                        value: this._formatDuration(v),
                        tooltip: 'Difference between the date the ticket was created and when it was closed.',
                        label: 'Resolution time',
                        moreIsBetter: false,
                    }
                case 'median_first_response_time':
                    return {
                        value: this._formatDuration(v),
                        tooltip: `Difference between the date when the first message was received from 
the user and the first response of the agent. Only tickets with at least 1 response are taken into account.`,
                        label: 'First response time',
                        moreIsBetter: false,
                    }
                case 'total_new_tickets':
                    return {
                        value: v,
                        label: 'New tickets',
                    }
                case 'total_closed_tickets':
                    return {
                        value: v,
                        label: 'Closed tickets',
                    }
                case 'total_ticket_messages_sent':
                    return {
                        value: v,
                        tooltip: 'Total number of messages on all channels sent by agents.',
                        label: 'Messages sent',
                    }
                case 'total_ticket_messages_received':
                    return {
                        value: v,
                        tooltip: 'Total number of messages on all channels received from user.',
                        label: 'Messages received',
                    }
                case 'satisfaction_score':
                    return {
                        value: this._formatPercent(v),
                        tooltip: 'Positive satisfaction ratings minus negative satisfaction ratings.',
                        label: 'Satisfaction score',
                        moreIsBetter: true,
                    }
                case 'total_one_touch_tickets':
                    return {
                        value: this._formatPercent(v),
                        tooltip: 'Percentage of tickets that were solved with only one response from your agents.',
                        label: 'One-touch tickets',
                        moreIsBetter: true,
                    }
                default:
                    console.error(`Unknown stat ${key}`)
                    return {}
            }
        })
    }

    // render helper tooltip displaying description of each statistic
    _renderTooltip(text, content, popupOptions = {}) {
        if (text) {
            return (
                <span
                    className="tooltip"
                    data-content={text}
                    data-variation="wide inverted"
                    ref={(e) => $(e).popup(popupOptions)}
                >
                    {content}
                </span>
            )
        }
    }

    _renderValue(value, key, tooltipDelta) {
        const {stats} = this.props

        if (value.value || value.value === 0) {
            return (
                <span className="value">
                    {value.value}
                    {
                        this._renderTooltip(
                            tooltipDelta,
                            renderDifference(
                                stats.getIn(['difference_period', key]),
                                value.moreIsBetter
                            ),
                            {distanceAway: -10}
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

        return (
            <div className="ui card stats-card">
                <div className="content">
                    <div className="ui statistics">
                        {
                            this._transformValues(stats.get('current_period'), fromJS([]))
                                .map((value, key) => (
                                    <div className="card statistic"
                                         key={value.label}
                                    >
                                        <div className="label">
                                            {value.label}
                                            {
                                                this._renderTooltip(
                                                    value.tooltip,
                                                    <i className="help circle link icon" />
                                                )
                                            }
                                        </div>
                                        {this._renderValue(value, key, tooltipDelta)}
                                    </div>
                                ))
                                .toList()
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
                            items={this.props.tags}
                            input={this._makeInputControl('tags')}
                            isDisabled={isLoading}
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
                            period={meta.get('period')}
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
    tags: PropTypes.array,
    channels: PropTypes.array,
    agents: PropTypes.array,
    stats: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    filters: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
    fetchStats: PropTypes.func.isRequired,
    setFilter: PropTypes.func.isRequired,
}
