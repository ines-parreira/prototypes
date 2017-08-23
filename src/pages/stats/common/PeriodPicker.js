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

        this.state = {
            ranges: {
                Today: [moment(), moment()],
                'Last 7 days': [moment().subtract(6, 'days'), moment()],
                'Last 30 days': [moment().subtract(29, 'days'), moment()],
                'Last 60 days': [moment().subtract(59, 'days'), moment()],
                'Last 90 days': [moment().subtract(89, 'days'), moment()],
            },
            startDate: props.startDatetime || moment().subtract(29, 'days'),
            endDate: props.endDatetime || moment(),
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
            start_datetime: picker.startDate.format(),
            end_datetime: picker.endDate.format(),
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
