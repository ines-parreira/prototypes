import React, {PropTypes} from 'react'
import moment from 'moment'
import DateRangePicker from 'react-bootstrap-daterangepicker'
import {Button} from 'reactstrap'

/**
 * The period picker allows to select a period which will set a start and an end datetime
 */
export default class PeriodPicker extends React.Component {
    constructor(props) {
        super(props)
        const startOfToday = () => moment().startOf('day')
        const endOfToday = () => moment().endOf('day')
        const someDaysAgoStartOfDay = (days) => startOfToday().subtract(days - 1, 'days')

        this.state = {
            ranges: {
                Today: [startOfToday(), endOfToday()],
                'Last 7 days': [someDaysAgoStartOfDay(7), endOfToday()],
                'Last 30 days': [someDaysAgoStartOfDay(30), endOfToday()],
                'Last 60 days': [someDaysAgoStartOfDay(60), endOfToday()],
                'Last 90 days': [someDaysAgoStartOfDay(90), endOfToday()],
            },
            startDate: props.startDatetime,
            endDate: props.endDatetime,
        }
    }

    shouldComponentUpdate(nextProps) {
        // because react-bootstrap-daterangepicker lib is based on weird DOM manipulation,
        // trigger redraw only when really needed
        return !this.props.startDatetime.isSame(nextProps.startDatetime)
            || !this.props.endDatetime.isSame(nextProps.endDatetime)
            || this.props.isDisabled !== nextProps.isDisabled
            || this.props.onChange !== nextProps.onChange
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.startDatetime && nextProps.endDatetime) {
            this.setState({
                startDate: nextProps.startDatetime,
                endDate: nextProps.endDatetime,
            })
        }
    }

    _handleEvent = (event, picker) => {
        this.props.onChange({
            start_datetime: picker.startDate.startOf('day').format(),
            end_datetime: picker.endDate.endOf('day').format(),
        })
    }

    render() {
        const {isDisabled} = this.props
        const start = this.state.startDate.format('MMM DD, YYYY')
        const end = this.state.endDate.format('MMM DD, YYYY')
        let label = `${start} - ${end}`

        if (start === end) {
            label = start
        }

        const button = (
            <Button
                type="button"
                className="selected-date-range-btn"
                disabled={isDisabled}
            >
                <i className="fa fa-fw fa-calendar mr-2" />
                <span>
                        {label}
                    </span>
                <i className="fa fa-fw fa-caret-down" />
            </Button>
        )

        if (isDisabled) {
            return button
        }

        return (
            <DateRangePicker
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                ranges={this.state.ranges}
                onApply={this._handleEvent}
                opens="left"
                buttonClasses={['btn']}
                applyClass="btn-success mr-2"
                cancelClass="btn-secondary"
                alwaysShowCalendars
                showCustomRangeLabel={false}
            >
                {button}
            </DateRangePicker>
        )
    }
}

PeriodPicker.propTypes = {
    isDisabled: PropTypes.bool.isRequired,
    endDatetime: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    startDatetime: PropTypes.object.isRequired,
}

PeriodPicker.defaultProps = {
    isDisabled: false,
}
