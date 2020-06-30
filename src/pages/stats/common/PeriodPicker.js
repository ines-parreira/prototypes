// @flow
import React from 'react'
import moment from 'moment-timezone'
import DateRangePicker from 'react-bootstrap-daterangepicker'
import {Button} from 'reactstrap'

type Props = {
    isDisabled: boolean,
    endDatetime: moment,
    onChange: ({start_datetime: string, end_datetime: string}) => void,
    startDatetime: moment,
}

type State = {
    startDate: moment,
    endDate: moment,
    ranges: {[string]: [moment, moment]},
}

/**
 * The period picker allows to select a period which will set a start and an end datetime
 */
export default class PeriodPicker extends React.Component<Props, State> {
    static defaultProps = {
        isDisabled: false,
    }

    constructor(props: Props) {
        super(props)
        const startOfToday = () => moment().startOf('day')
        const endOfToday = () => moment().endOf('day')
        const someDaysAgoStartOfDay = (days) =>
            startOfToday().subtract(days - 1, 'days')

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

    shouldComponentUpdate(nextProps: Props) {
        // because react-bootstrap-daterangepicker lib is based on weird DOM manipulation,
        // trigger redraw only when really needed
        return (
            !this.props.startDatetime.isSame(nextProps.startDatetime) ||
            !this.props.endDatetime.isSame(nextProps.endDatetime) ||
            this.props.isDisabled !== nextProps.isDisabled
        )
    }

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.startDatetime && nextProps.endDatetime) {
            this.setState({
                startDate: nextProps.startDatetime,
                endDate: nextProps.endDatetime,
            })
        }
    }

    _handleEvent = (
        event: Event,
        picker: {startDate: moment, endDate: moment}
    ) => {
        this.props.onChange({
            start_datetime: moment(
                picker.startDate.startOf('day').format('YYYY-MM-DD HH:mm:ss')
            ).format(),
            end_datetime: moment(
                picker.endDate.endOf('day').format('YYYY-MM-DD HH:mm:ss')
            ).format(),
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
            <Button type="button" disabled={isDisabled}>
                <i className="material-icons mr-2">calendar_today</i>
                <span>{label}</span>
                <i className="material-icons md-2 strong ml-1">
                    arrow_drop_down
                </i>
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
