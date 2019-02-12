// @flow
import React, {Component} from 'react'
import moment from 'moment/moment'

import DatePicker from '../../../../common/forms/DatePicker'

type Props = {
    children?: string,
    datetime?: string,
    isOpen: boolean,
    onApply: Function,
    ranges: Object,
    toggle: Function
}

export default class TicketSnoozePicker extends Component<Props> {
    static defaultProps = {
        ranges: {
            'In 3 hours': [moment().add(3, 'hours'), moment().add(3, 'hours')],
            'In 6 hours': [moment().add(6, 'hours'), moment().add(6, 'hours')],
            'In 1 day': [moment().add(1, 'days'), moment().add(1, 'days')],
            'In 3 days': [moment().add(3, 'days'), moment().add(3, 'days')],
            'in 1 week': [moment().add(7, 'days'), moment().add(7, 'days')],
        }
    }

    render() {
        const {datetime, isOpen, onApply, ranges, toggle} = this.props
        const dt = datetime ? moment(datetime) : moment()

        // Lazy rendering so datetimes are always up-to-date
        // when the user opens the picker
        const _render = () => {
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
                    startDate={dt}
                    endDate={dt}
                    timePicker
                    toggle={toggle}
                >
                    {this.props.children}
                </DatePicker>
            )
        }
        return _render()
    }
}
