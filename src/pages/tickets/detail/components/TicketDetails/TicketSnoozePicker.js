// @flow
import React, {Component} from 'react'
import moment from 'moment/moment'

import DatePicker from '../../../../common/forms/DatePicker'

type Props = {
    children?: string,
    datetime?: string,
    isOpen: boolean,
    onApply: Function,
    toggle: Function
}

export default class TicketSnoozePicker extends Component<Props> {
    render() {
        const {datetime, isOpen, onApply, toggle} = this.props
        const formattedDate = moment(datetime)
        const snoozeDatetime = formattedDate.isValid() ? formattedDate : moment()
        const ranges = {
            'In 3 hours': [moment().add(3, 'hours'), moment().add(3, 'hours')],
            'In 6 hours': [moment().add(6, 'hours'), moment().add(6, 'hours')],
            'In 1 day': [moment().add(1, 'days'), moment().add(1, 'days')],
            'In 3 days': [moment().add(3, 'days'), moment().add(3, 'days')],
            'in 1 week': [moment().add(7, 'days'), moment().add(7, 'days')],
        }

        if (datetime && !formattedDate.isValid()) {
            console.error('Received invalid datetime', datetime)
        }
        return (
            <DatePicker
                applyClass="btn-success mr-2"
                buttonClasses={['btn']}
                cancelClass="btn-secondary"
                isOpen={isOpen}
                minDate={moment()}
                onApply={onApply}
                opens="left"
                ranges={ranges}
                showCustomRangeLabel={false}
                singleDatePicker
                startDate={snoozeDatetime}
                endDate={snoozeDatetime}
                timePicker
                toggle={toggle}
            >
                {this.props.children}
            </DatePicker>
        )
    }
}
