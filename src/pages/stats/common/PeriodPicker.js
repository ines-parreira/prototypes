import React, {PropTypes} from 'react'
import moment from 'moment'
import DatePicker from 'react-datepicker'
import {timesFromPeriod} from './utils'

/**
 * The period picker allows to select a period which will set a start and an end datetime
 */
export default class PeriodPicker extends React.Component {
    componentWillMount() {
        const {period, startDatetime, endDatetime} = this.props

        // on initialization
        if (period && (!startDatetime || !endDatetime)) {
            this._handlePeriodChange(period)
        }
    }

    componentDidMount() {
        $(this.refs.periodPicker).dropdown({
            onChange: this._handlePeriodChange,
        })
    }

    // period is changed via dropdown
    _handlePeriodChange = (period) => {
        const {startDatetime, endDatetime} = timesFromPeriod(period)

        this.props.onChange({
            period,
            start_datetime: startDatetime.format(),
            end_datetime: endDatetime.format(),
        })
    }

    // date is changed via datepicker
    _handleDateChange = (value, isStart = true) => {
        let {startDatetime, endDatetime} = this.props

        if (isStart) {
            startDatetime = value
        } else {
            endDatetime = value
        }

        this.props.onChange({
            start_datetime: startDatetime.format(),
            end_datetime: endDatetime.format()
        })
    }

    _renderPeriodOption = (period, label) => {
        const {startDatetime, endDatetime} = timesFromPeriod(period)

        return (
            <div
                className="item"
                key={period}
                data-value={period}
            >
                <b>{label}</b>
                <span>{startDatetime.format('MMM DD, YYYY')} - {endDatetime.format('MMM DD, YYYY')}</span>
            </div>
        )
    }

    render() {
        const {startDatetime, endDatetime, isDisabled} = this.props

        const periodPickerOptions = [
            ['today', 'Today'],
            ['last-7-days', 'Last 7 days'],
            ['past-week', 'Past week'],
            ['last-month', 'Last month'],
            ['past-month', 'Past month'],
            ['last-3-months', 'Last 3 months'],
            ['last-6-months', 'Last 6 months'],
            ['last-year', 'Last year'],
        ]

        return (
            <div className="period-picker">
                <div className="ui input">
                    <DatePicker
                        dateFormat="MMM DD, YYYY"
                        selected={startDatetime}
                        startDate={startDatetime}
                        endDate={endDatetime}
                        onChange={this._handleDateChange}
                        disabled={isDisabled}
                        maxDate={endDatetime}
                    />
                </div>
                <div className="ui input">
                    <DatePicker
                        dateFormat="MMM DD, YYYY"
                        selected={endDatetime}
                        startDate={startDatetime}
                        endDate={endDatetime}
                        onChange={(v) => this._handleDateChange(v, false)}
                        disabled={isDisabled}
                        minDate={startDatetime}
                        maxDate={moment()}
                    />
                </div>
                <div className="field inline">
                    <div
                        ref="periodPicker"
                        className="ui icon dropdown button"
                    >
                        <i className="content icon" />
                        <div className="menu">
                            {periodPickerOptions.map((option) => this._renderPeriodOption(option[0], option[1]))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

PeriodPicker.propTypes = {
    startDatetime: PropTypes.object.isRequired,
    endDatetime: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool.isRequired,
    period: PropTypes.string,
}

PeriodPicker.defaultProps = {
    isDisabled: false,
    startDatetime: moment().format(),
    endDatetime: moment().format(),
}
