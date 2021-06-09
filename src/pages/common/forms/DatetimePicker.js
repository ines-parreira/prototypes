// @flow
import React from 'react'
import moment from 'moment'
import DateRangePicker from 'react-bootstrap-daterangepicker'

import {Input} from 'reactstrap'

import {stringToDatetime} from '../../../utils/date.ts'

type Props = {
    datetime: string,
    isDisabled?: boolean,
    onChange: (state: string) => *,
}

type State = {
    datetime: moment,
}

export default class DatetimePicker extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        //$FlowFixMe
        this.state = {datetime: stringToDatetime(props.datetime)}
    }

    componentWillReceiveProps(nextProps: Props) {
        //$FlowFixMe
        this.setState({datetime: stringToDatetime(nextProps.datetime)})
    }

    _handleEvent = (event: Object, picker: Object) => {
        this.props.onChange(picker.startDate.toISOString())
    }

    render() {
        return (
            <DateRangePicker
                onApply={this._handleEvent}
                initialSettings={{
                    alwaysShowCalendars: true,
                    applyButtonClasses: 'btn-success mr-2',
                    cancelButtonClasses: 'btn-secondary',
                    endDate: this.state.datetime || moment(),
                    opens: 'left',
                    showCustomRangeLabel: false,
                    singleDatePicker: true,
                    startDate: this.state.datetime || moment(),
                    timePicker: true,
                }}
            >
                <div>
                    <Input
                        value={
                            this.state.datetime
                                ? this.state.datetime.format('L LT')
                                : ''
                        }
                        placeholder="Choose a date..."
                    />
                </div>
            </DateRangePicker>
        )
    }
}
