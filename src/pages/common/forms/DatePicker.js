// @flow
import React, {Component, type Node} from 'react'
import DateRangePicker from 'react-bootstrap-daterangepicker'
import _pick from 'lodash/pick'

type Props = {
    applyClass: ?string,
    buttonClasses: ?Array<string>,
    children: ?Node,
    cancelClass: ?string,
    isOpen: boolean,
    minDate: ?Object,
    onApply: ?Function,
    onHide: ?Function,
    opens: ?string,
    ranges: ?Object,
    showCustomRangeLabel: ?boolean,
    singleDatePicker: ?boolean,
    startDate: ?Object,
    timePicker: ?boolean,
    toggle?: Function
}

export default class DatePicker extends Component<Props> {
    static defaultProps = {
        onHide: null,
        showCustomRangeLabel: false
    }

    componentWillReceiveProps(nextProps: Props) {
        if (!this.props.isOpen && nextProps.isOpen) {
            this._show()
        }
    }

    componentDidMount() {
        if (this.props.isOpen) {
            this._show()
        }
    }

    _show = () => {
        if (!this.refs.datepicker) {
            return
        }

        // ranges for single date picker are hidden by default
        // so we display them.
        if (this.props.ranges && this.props.singleDatePicker) {
            const ranges = document.querySelector('.daterangepicker .ranges > ul')

            if (ranges) {
                ranges.style.display = ''
            }
        }

        // there are no API/attributes that enable us
        // to show and hide the date picker component,
        // so we simulate a click on it to open it
        this.refs.datepicker.$picker.click()
    }

    _onEvent = (event: Object) => {
        if (event.type === 'hide') {
            if (this.props.toggle) {
                this.props.toggle()
            }

            if (this.props.onHide) {
                this.props.onHide()
            }
        }
    }

    render() {
        const dateRangePickerProps = _pick(this.props, Object.keys(DateRangePicker.propTypes))
        return (
            <DateRangePicker
                ref="datepicker"
                onEvent={this._onEvent}
                {...dateRangePickerProps}
            >
                {this.props.children}
            </DateRangePicker>)
    }
}
