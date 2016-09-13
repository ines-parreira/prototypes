import React from 'react'
import moment from 'moment'
import DatePicker from 'react-datepicker'
import PageHeader from '../../../common/components/PageHeader'
import 'react-datepicker/dist/react-datepicker.css'

export default class StatsView extends React.Component {
    componentWillMount() {
        this.props.actions.stats.fetchStats()
    }

    componentDidUpdate() {
        $('.tooltip').popup({})
    }

    _handleDateChange = (v, type) => {
        const {stats} = this.props
        let startDatetime = moment(stats.getIn(['meta', 'start_datetime']))
        let endDatetime = moment(stats.getIn(['meta', 'end_datetime']))
        if (type === 'start') {
            startDatetime = v
        } else {
            endDatetime = v
        }
        this.props.actions.stats.fetchStats(startDatetime.format(), endDatetime.format())
    }

    _formatDuration(d) {
        let ret = ''
        if (d.days()) {
            ret += `${d.days()}d `
        }
        if (d.hours()) {
            ret += `${d.hours()}h `
        }
        if (d.minutes()) {
            ret += `${d.minutes()}m `
        }
        return ret
    }

    _tooltip(s) {
        if (s.tooltip) {
            return (
                <span className="tooltip" data-content={s.tooltip} data-variation="wide">
                    <i className="help circle link icon"/>
                </span>
            )
        }
        return null
    }

    _transformValues = (stats) => stats.map((v, key) => {
        switch (key) {
            case 'median_time_to_resolution':
                return {
                    value: this._formatDuration(moment.duration(v, 'seconds')),
                    tooltip: 'Difference between the date the ticket was created and when it was closed',
                    label: 'Resolution time (median)'
                }
            case 'median_first_response_time':
                return {
                    value: this._formatDuration(moment.duration(v, 'seconds')),
                    tooltip: `Difference between the date when the first message was received from 
the user and the first response of the agent. Only tickets with at least 1 response are taken into account.`,
                    label: 'First response time (median)'
                }
            case 'total_new_tickets':
                return {
                    value: v,
                    label: 'New tickets'
                }
            case 'total_closed_tickets':
                return {
                    value: v,
                    label: 'Closed tickets'
                }
            case 'total_ticket_messages_agent':
                return {
                    value: v,
                    tooltip: 'Total number of messages on all channels sent by agents.',
                    label: 'Messages sent'
                }
            case 'total_ticket_messages_user':
                return {
                    value: v,
                    tooltip: 'Total number of messages on all channels received from user.',
                    label: 'Messages received'
                }
            default:
                console.error(`Unknown stat ${key}`)
                return {}
        }
    }).filter(s => s.value !== '')


    render() {
        const {stats} = this.props
        const startDatetime = moment(stats.getIn(['meta', 'start_datetime']))
        const endDatetime = moment(stats.getIn(['meta', 'end_datetime']))

        if (stats.isEmpty()) {
            return null
        }


        return (
            <div className="view">
                <PageHeader title="Ticket statistics">
                    <div className="ui right floated">
                        <div className="ui input">
                            <DatePicker
                                dateFormat="YYYY/MM/DD"
                                selected={startDatetime}
                                startDate={startDatetime}
                                endDate={endDatetime}
                                onChange={(v) => this._handleDateChange(v, 'start')}
                            />
                        </div>
                        <span> </span>
                        <div className="ui input">
                            <DatePicker
                                dateFormat="YYYY/MM/DD"
                                selected={endDatetime}
                                startDate={startDatetime}
                                endDate={endDatetime}
                                popoverAttachment="bottom center"
                                popoverTargetAttachment="top center"
                                onChange={(v) => this._handleDateChange(v, 'end')}
                            />
                        </div>
                    </div>
                </PageHeader>
                <p>These are some basic stats for tickets.</p>
                <div className="ui four statistics">
                    {this._transformValues(stats.get('data')).map(s => (
                        <div className="card statistic"
                             key={s.label}
                        >
                            <div className="label">
                                {s.label}
                                {this._tooltip(s)}
                            </div>
                            <div className="value">{s.value}</div>
                        </div>
                    )).toList()}
                </div>
            </div>
        )
    }
}

StatsView.propTypes = {
    actions: React.PropTypes.object,
    stats: React.PropTypes.object
}
