// @flow
import React from 'react'
import moment from 'moment'
import DateRangePicker from 'react-bootstrap-daterangepicker'

import {Input} from 'reactstrap'

type Props = {
    datetime: string,
    isDisabled?: boolean,
    onChange: (state: Object) => *
}

type State = {
    datetime: moment
}

export default class DatetimePicker extends React.Component<Props,State> {
    constructor(props: Props) {
        super(props)
        this.state = {datetime: props.datetime ? moment(props.datetime) : null}
    }

    componentWillReceiveProps(nextProps: Props) {
        this.setState({datetime: nextProps.datetime ? moment(nextProps.datetime) : null})
    }

    _handleEvent = (event: Object, picker: Object) => {
        this.props.onChange(picker.startDate.toISOString())
    }

    render() {
        return (
            <DateRangePicker
                value={this.state.datetime}
                onApply={this._handleEvent}
                opens="left"
                buttonClasses={['btn']}
                applyClass="btn-success mr-2"
                cancelClass="btn-secondary"
                alwaysShowCalendars
                showCustomRangeLabel={false}
                singleDatePicker
                timePicker
                timePicker24Hour
            >
                <Input
                    value={this.state.datetime ? this.state.datetime.format('L LT') : ''}
                    placeholder="Choose a date..."
                />
            </DateRangePicker>
        )
    }
}
